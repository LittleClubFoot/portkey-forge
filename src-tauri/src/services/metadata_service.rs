use std::path::{Path, PathBuf};

use crate::error::{AppError, Result};
use crate::models::*;
use crate::models::metadata::{ParsedMediaType, TMDBSearchResult};
use crate::services::tmdb_service::TMDBService;
use crate::utils::filename_parser;

/// Orchestrates metadata enrichment for video files on a device.
///
/// Uses `TMDBService` to look up movie / TV metadata and downloads
/// poster art to the device.
pub struct MetadataService<'a> {
    pub tmdb_service: &'a TMDBService,
    pub device_path: PathBuf,
}

impl<'a> MetadataService<'a> {
    /// Create a new `MetadataService` bound to a TMDB client and a device
    /// root path.
    pub fn new(tmdb_service: &'a TMDBService, device_path: PathBuf) -> Self {
        Self {
            tmdb_service,
            device_path,
        }
    }

    // ── single-file enrichment ──────────────────────────────────

    /// Parse the filename of `video_path`, search TMDB for a match, and
    /// return an `EnrichedMediaItem` populated with the best result.
    ///
    /// If no TMDB result is found the item is still returned with whatever
    /// information could be extracted from the filename itself.
    pub async fn enrich_video(&self, video_path: &Path) -> Result<EnrichedMediaItem> {
        let filename = video_path
            .file_name()
            .and_then(|n| n.to_str())
            .ok_or_else(|| AppError::MediaError("Invalid video filename".into()))?
            .to_string();

        let parsed = filename_parser::parse(&filename);

        // Search TMDB based on the parsed media type
        let media_type = match parsed.media_type {
            ParsedMediaType::TVShow => "tv",
            _ => "movie",
        };
        let search_results = self
            .tmdb_service
            .search(media_type, &parsed.title, parsed.year)
            .await?;

        // Pick the first result (if any) and fetch full details
        if let Some(best) = search_results.first() {
            self.build_enriched_from_result(video_path, &filename, &parsed, best)
                .await
        } else {
            // No TMDB match – return a skeleton item
            Ok(self.skeleton_item(video_path, &filename, &parsed))
        }
    }

    /// Enrich a video file using a specific, user-selected TMDB result.
    ///
    /// `media_type` should be `"movie"` or `"tv"`.
    pub async fn enrich_with_selection(
        &self,
        video_path: &Path,
        tmdb_id: u64,
        media_type: &str,
    ) -> Result<EnrichedMediaItem> {
        let filename = video_path
            .file_name()
            .and_then(|n| n.to_str())
            .ok_or_else(|| AppError::MediaError("Invalid video filename".into()))?
            .to_string();

        let parsed = filename_parser::parse(&filename);

        match media_type {
            "movie" => {
                let details = self.tmdb_service.get_movie_details(tmdb_id).await?;
                let local_poster = if let Some(ref poster) = details.poster_path {
                    self.download_poster_to_device(poster, tmdb_id).await.ok()
                } else {
                    None
                };

                Ok(EnrichedMediaItem {
                    path: video_path.to_string_lossy().to_string(),
                    title: details.title,
                    original_filename: filename,
                    year: details
                        .release_date
                        .as_ref()
                        .and_then(|d| d.get(..4))
                        .and_then(|y| y.parse().ok()),
                    overview: Some(details.overview),
                    poster_path: details.poster_path,
                    local_poster_path: local_poster,
                    runtime: details.runtime,
                    genres: details.genres.iter().map(|g| g.name.clone()).collect(),
                    tmdb_id: Some(details.id),
                    media_type: TMDBMediaType::Movie,
                    season: parsed.season,
                    episode: parsed.episode,
                    tag_id: None,
                })
            }
            "tv" => {
                let details = self.tmdb_service.get_tv_details(tmdb_id).await?;
                let local_poster = if let Some(ref poster) = details.poster_path {
                    self.download_poster_to_device(poster, tmdb_id).await.ok()
                } else {
                    None
                };

                Ok(EnrichedMediaItem {
                    path: video_path.to_string_lossy().to_string(),
                    title: details.name,
                    original_filename: filename,
                    year: details
                        .first_air_date
                        .as_ref()
                        .and_then(|d| d.get(..4))
                        .and_then(|y| y.parse().ok()),
                    overview: Some(details.overview),
                    poster_path: details.poster_path,
                    local_poster_path: local_poster,
                    runtime: details.episode_run_time.first().copied(),
                    genres: details.genres.iter().map(|g| g.name.clone()).collect(),
                    tmdb_id: Some(details.id),
                    media_type: TMDBMediaType::Tv,
                    season: parsed.season,
                    episode: parsed.episode,
                    tag_id: None,
                })
            }
            _ => Err(AppError::MediaError(format!(
                "Unknown media type: {}",
                media_type
            ))),
        }
    }

    // ── batch enrichment ────────────────────────────────────────

    /// Enrich multiple video files in sequence.
    ///
    /// Returns a `Vec` of results – one per input path.  Individual
    /// failures are captured as `Err` entries so that the batch can
    /// continue even if some files fail.
    pub async fn batch_enrich(
        &self,
        video_paths: &[PathBuf],
    ) -> Vec<Result<EnrichedMediaItem>> {
        let mut results = Vec::with_capacity(video_paths.len());

        for path in video_paths {
            let result = self.enrich_video(path).await;
            results.push(result);
        }

        results
    }

    // ── helpers ─────────────────────────────────────────────────

    /// Build an `EnrichedMediaItem` from a TMDB search result.
    async fn build_enriched_from_result(
        &self,
        video_path: &Path,
        filename: &str,
        parsed: &crate::models::metadata::ParsedFilename,
        result: &TMDBSearchResult,
    ) -> Result<EnrichedMediaItem> {
        let local_poster = if let Some(ref poster) = result.poster_path {
            self.download_poster_to_device(poster, result.id).await.ok()
        } else {
            None
        };

        let media_type = match result.media_type.as_str() {
            "movie" => TMDBMediaType::Movie,
            "tv" => TMDBMediaType::Tv,
            _ => TMDBMediaType::Unknown,
        };

        Ok(EnrichedMediaItem {
            path: video_path.to_string_lossy().to_string(),
            title: result.title.clone(),
            original_filename: filename.to_string(),
            year: result
                .release_date
                .as_ref()
                .and_then(|d| d.get(..4))
                .and_then(|y| y.parse().ok()),
            overview: Some(result.overview.clone()),
            poster_path: result.poster_path.clone(),
            local_poster_path: local_poster,
            runtime: None, // Would require a follow-up details call
            genres: Vec::new(),
            tmdb_id: Some(result.id),
            media_type,
            season: parsed.season,
            episode: parsed.episode,
            tag_id: None,
        })
    }

    /// Download a poster to the device's `posters/` directory and return
    /// the local relative path.
    async fn download_poster_to_device(
        &self,
        poster_path: &str,
        tmdb_id: u64,
    ) -> Result<String> {
        let posters_dir = self.device_path.join("posters");
        let extension = Path::new(poster_path)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("jpg");
        let local_filename = format!("{}.{}", tmdb_id, extension);
        let destination = posters_dir.join(&local_filename);

        self.tmdb_service
            .download_poster(poster_path, &destination)
            .await?;

        // Return a path relative to the device root
        Ok(format!("posters/{}", local_filename))
    }

    /// Construct a minimal `EnrichedMediaItem` from parsed filename data
    /// when no TMDB match is available.
    fn skeleton_item(
        &self,
        video_path: &Path,
        filename: &str,
        parsed: &crate::models::metadata::ParsedFilename,
    ) -> EnrichedMediaItem {
        let media_type = match parsed.media_type {
            ParsedMediaType::Movie => TMDBMediaType::Movie,
            ParsedMediaType::TVShow => TMDBMediaType::Tv,
            ParsedMediaType::Unknown => TMDBMediaType::Unknown,
        };

        EnrichedMediaItem {
            path: video_path.to_string_lossy().to_string(),
            title: parsed.title.clone(),
            original_filename: filename.to_string(),
            year: parsed.year,
            overview: None,
            poster_path: None,
            local_poster_path: None,
            runtime: None,
            genres: Vec::new(),
            tmdb_id: None,
            media_type,
            season: parsed.season,
            episode: parsed.episode,
            tag_id: None,
        }
    }
}
