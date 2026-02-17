use std::path::{Path, PathBuf};

use rusqlite::{params, Connection};

use crate::error::{AppError, Result};
use crate::models::watch_history::{PlaybackEvent, SeriesProgress, WatchHistoryItem};

/// Repository for reading and writing the device's `playback.db` SQLite database.
pub struct WatchHistoryRepository {
    db_path: PathBuf,
}

impl WatchHistoryRepository {
    pub fn new(device_path: &str) -> Self {
        Self {
            db_path: Path::new(device_path).join("playback.db"),
        }
    }

    fn open(&self) -> Result<Connection> {
        if !self.db_path.exists() {
            return Err(AppError::DatabaseError(format!(
                "No playback database found at {}",
                self.db_path.display()
            )));
        }
        Connection::open(&self.db_path).map_err(|e| {
            AppError::DatabaseError(format!("Failed to open playback.db: {}", e))
        })
    }

    fn open_or_create(&self) -> Result<Connection> {
        let conn = Connection::open(&self.db_path).map_err(|e| {
            AppError::DatabaseError(format!("Failed to open playback.db: {}", e))
        })?;
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS playback_events (
                tag_id        TEXT NOT NULL,
                title         TEXT NOT NULL DEFAULT '',
                media_path    TEXT NOT NULL DEFAULT '',
                start_time    DATETIME,
                end_time      DATETIME,
                duration_watched INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS series_progress (
                tag_id           TEXT PRIMARY KEY,
                current_season   INTEGER NOT NULL DEFAULT 0,
                current_episode  INTEGER NOT NULL DEFAULT 0,
                position_seconds INTEGER NOT NULL DEFAULT 0,
                completed        INTEGER NOT NULL DEFAULT 0
            );",
        )
        .map_err(|e| AppError::DatabaseError(format!("Failed to init tables: {}", e)))?;
        Ok(conn)
    }

    /// Get aggregated watch history items combining playback events and series progress.
    pub fn get_watch_history(&self) -> Result<Vec<WatchHistoryItem>> {
        let conn = self.open()?;

        // Aggregate playback events by media_path
        let mut event_stmt = conn
            .prepare(
                "SELECT tag_id, title, media_path,
                        COUNT(*) as play_count,
                        SUM(duration_watched) as total_secs,
                        MAX(start_time) as last_watched
                 FROM playback_events
                 GROUP BY media_path
                 ORDER BY last_watched DESC",
            )
            .map_err(|e| AppError::DatabaseError(e.to_string()))?;

        let events: Vec<(String, String, String, u32, u32, Option<String>)> = event_stmt
            .query_map([], |row| {
                Ok((
                    row.get(0)?,
                    row.get(1)?,
                    row.get(2)?,
                    row.get(3)?,
                    row.get(4)?,
                    row.get(5)?,
                ))
            })
            .map_err(|e| AppError::DatabaseError(e.to_string()))?
            .filter_map(|r| r.ok())
            .collect();

        // Load all series progress
        let progress_map = self.load_progress_map(&conn)?;

        let items = events
            .into_iter()
            .map(|(tag_id, title, media_path, play_count, total_secs, last_watched)| {
                let progress = progress_map.get(&tag_id);
                let (season, episode, position, completed) = match progress {
                    Some(p) => (
                        if p.current_season > 0 { Some(p.current_season) } else { None },
                        if p.current_episode > 0 { Some(p.current_episode) } else { None },
                        p.position_seconds,
                        p.completed,
                    ),
                    None => (None, None, 0, false),
                };

                let media_type = if season.is_some() || episode.is_some() {
                    "tv".to_string()
                } else {
                    "movie".to_string()
                };

                WatchHistoryItem {
                    media_path,
                    title,
                    tag_id: Some(tag_id),
                    media_type,
                    season,
                    episode,
                    watched: completed,
                    progress_seconds: position,
                    total_watch_time_secs: total_secs,
                    last_watched,
                    play_count,
                }
            })
            .collect();

        Ok(items)
    }

    /// Get all series progress entries.
    pub fn get_all_progress(&self) -> Result<Vec<SeriesProgress>> {
        let conn = self.open()?;
        let mut stmt = conn
            .prepare(
                "SELECT tag_id, current_season, current_episode, position_seconds, completed
                 FROM series_progress",
            )
            .map_err(|e| AppError::DatabaseError(e.to_string()))?;

        let rows = stmt
            .query_map([], |row| {
                Ok(SeriesProgress {
                    tag_id: row.get(0)?,
                    current_season: row.get(1)?,
                    current_episode: row.get(2)?,
                    position_seconds: row.get(3)?,
                    completed: row.get::<_, i32>(4)? != 0,
                })
            })
            .map_err(|e| AppError::DatabaseError(e.to_string()))?
            .filter_map(|r| r.ok())
            .collect();

        Ok(rows)
    }

    /// Mark a media item as watched by setting completed=1 in series_progress.
    pub fn mark_watched(
        &self,
        tag_id: &str,
        season: Option<u32>,
        episode: Option<u32>,
    ) -> Result<()> {
        let conn = self.open_or_create()?;
        conn.execute(
            "INSERT INTO series_progress (tag_id, current_season, current_episode, position_seconds, completed)
             VALUES (?1, ?2, ?3, 0, 1)
             ON CONFLICT(tag_id) DO UPDATE SET
                current_season = ?2,
                current_episode = ?3,
                position_seconds = 0,
                completed = 1",
            params![tag_id, season.unwrap_or(0), episode.unwrap_or(0)],
        )
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;
        Ok(())
    }

    /// Mark a media item as unwatched by resetting progress.
    pub fn mark_unwatched(&self, tag_id: &str) -> Result<()> {
        let conn = self.open_or_create()?;
        conn.execute(
            "DELETE FROM series_progress WHERE tag_id = ?1",
            params![tag_id],
        )
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;
        Ok(())
    }

    /// Update the resume position for a media item.
    pub fn update_resume_position(
        &self,
        tag_id: &str,
        season: u32,
        episode: u32,
        position_seconds: u32,
    ) -> Result<()> {
        let conn = self.open_or_create()?;
        conn.execute(
            "INSERT INTO series_progress (tag_id, current_season, current_episode, position_seconds, completed)
             VALUES (?1, ?2, ?3, ?4, 0)
             ON CONFLICT(tag_id) DO UPDATE SET
                current_season = ?2,
                current_episode = ?3,
                position_seconds = ?4,
                completed = 0",
            params![tag_id, season, episode, position_seconds],
        )
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;
        Ok(())
    }

    /// Clear all playback history for a specific media path.
    pub fn clear_history(&self, media_path: &str) -> Result<()> {
        let conn = self.open()?;
        // Get the tag_id for this media_path so we can also clean series_progress
        let tag_id: Option<String> = conn
            .query_row(
                "SELECT tag_id FROM playback_events WHERE media_path = ?1 LIMIT 1",
                params![media_path],
                |row| row.get(0),
            )
            .ok();

        conn.execute(
            "DELETE FROM playback_events WHERE media_path = ?1",
            params![media_path],
        )
        .map_err(|e| AppError::DatabaseError(e.to_string()))?;

        if let Some(tid) = tag_id {
            conn.execute(
                "DELETE FROM series_progress WHERE tag_id = ?1",
                params![tid],
            )
            .map_err(|e| AppError::DatabaseError(e.to_string()))?;
        }

        Ok(())
    }

    fn load_progress_map(
        &self,
        conn: &Connection,
    ) -> Result<std::collections::HashMap<String, SeriesProgress>> {
        let mut stmt = conn
            .prepare(
                "SELECT tag_id, current_season, current_episode, position_seconds, completed
                 FROM series_progress",
            )
            .map_err(|e| AppError::DatabaseError(e.to_string()))?;

        let map = stmt
            .query_map([], |row| {
                Ok(SeriesProgress {
                    tag_id: row.get(0)?,
                    current_season: row.get(1)?,
                    current_episode: row.get(2)?,
                    position_seconds: row.get(3)?,
                    completed: row.get::<_, i32>(4)? != 0,
                })
            })
            .map_err(|e| AppError::DatabaseError(e.to_string()))?
            .filter_map(|r| r.ok())
            .map(|p| (p.tag_id.clone(), p))
            .collect();

        Ok(map)
    }
}
