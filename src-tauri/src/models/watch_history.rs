use serde::{Deserialize, Serialize};

/// A single playback event from the device's playback_events table.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybackEvent {
    pub tag_id: String,
    pub title: String,
    pub media_path: String,
    pub start_time: String,
    pub end_time: Option<String>,
    pub duration_watched: u32,
}

/// Resume state for a series/movie from the device's series_progress table.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SeriesProgress {
    pub tag_id: String,
    pub current_season: u32,
    pub current_episode: u32,
    pub position_seconds: u32,
    pub completed: bool,
}

/// Aggregated watch history item sent to the frontend.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatchHistoryItem {
    pub media_path: String,
    pub title: String,
    pub tag_id: Option<String>,
    /// "movie" or "tv"
    pub media_type: String,
    pub season: Option<u32>,
    pub episode: Option<u32>,
    pub watched: bool,
    /// Seconds into the current episode/movie where playback was paused.
    pub progress_seconds: u32,
    /// Total seconds watched across all sessions.
    pub total_watch_time_secs: u32,
    /// ISO timestamp of the most recent playback.
    pub last_watched: Option<String>,
    pub play_count: u32,
}
