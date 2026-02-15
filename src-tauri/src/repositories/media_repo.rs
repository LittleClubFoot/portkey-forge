use std::path::{Path, PathBuf};
use tokio::fs;
use walkdir::WalkDir;

use crate::error::{AppError, Result};
use crate::models::media::{MediaCategory, MediaItem};

/// Recognized video file extensions.
const VIDEO_EXTENSIONS: &[&str] = &[
    "mp4", "mkv", "avi", "mov", "wmv", "flv", "webm", "m4v",
];

/// Repository for scanning, adding, and removing media files on the device.
pub struct MediaRepository {
    device_path: String,
}

impl MediaRepository {
    /// Create a new MediaRepository for the given device path.
    pub fn new(device_path: String) -> Self {
        Self { device_path }
    }

    /// Recursively scan the {device}/media/ directory for video files.
    /// Returns a Vec of MediaItem for each recognized video file found.
    pub async fn scan_media(&self) -> Result<Vec<MediaItem>> {
        let media_dir = Path::new(&self.device_path).join("media");

        if !media_dir.exists() {
            log::info!(
                "Media directory not found at {}, returning empty",
                media_dir.display()
            );
            return Ok(Vec::new());
        }

        let media_dir_clone = media_dir.clone();

        // WalkDir is synchronous, so we run it in a blocking task
        let items = tokio::task::spawn_blocking(move || {
            let mut items = Vec::new();

            for entry in WalkDir::new(&media_dir_clone)
                .follow_links(true)
                .into_iter()
                .filter_map(|e| e.ok())
            {
                let path = entry.path();

                if !path.is_file() {
                    continue;
                }

                if !is_video_file(path) {
                    continue;
                }

                let filename = path
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("")
                    .to_string();

                let size_bytes = entry.metadata().map(|m| m.len()).unwrap_or(0);

                let format = path
                    .extension()
                    .and_then(|e| e.to_str())
                    .map(|s| s.to_lowercase());

                // Determine category from the first subfolder under media/
                let category = determine_category(path, &media_dir_clone);

                let path_str = path.to_string_lossy().to_string();

                items.push(MediaItem {
                    path: path_str,
                    filename,
                    size_bytes,
                    duration_secs: None,
                    format,
                    resolution: None,
                    category,
                });
            }

            items
        })
        .await
        .map_err(|e| AppError::MediaError(format!("Failed to scan media: {}", e)))?;

        Ok(items)
    }

    /// Copy a file from source_path into the appropriate category folder on the device.
    /// The file will be placed in {device}/media/{category}/{filename}.
    pub async fn add_media(&self, source_path: &str, category: &MediaCategory) -> Result<PathBuf> {
        let source = Path::new(source_path);

        if !source.exists() {
            return Err(AppError::MediaError(format!(
                "Source file not found: {}",
                source_path
            )));
        }

        let filename = source
            .file_name()
            .and_then(|n| n.to_str())
            .ok_or_else(|| {
                AppError::MediaError(format!(
                    "Could not determine filename from: {}",
                    source_path
                ))
            })?;

        let category_name = category_to_folder_name(category);
        let dest_dir = Path::new(&self.device_path)
            .join("media")
            .join(category_name);

        // Create the category directory if it doesn't exist
        fs::create_dir_all(&dest_dir).await.map_err(|e| {
            AppError::MediaError(format!(
                "Failed to create category directory {}: {}",
                dest_dir.display(),
                e
            ))
        })?;

        let dest_path = dest_dir.join(filename);

        fs::copy(source, &dest_path).await.map_err(|e| {
            AppError::MediaError(format!(
                "Failed to copy file to {}: {}",
                dest_path.display(),
                e
            ))
        })?;

        log::info!("Media added: {} -> {}", source_path, dest_path.display());
        Ok(dest_path)
    }

    /// Remove a media file from the device.
    pub async fn remove_media(&self, media_path: &str) -> Result<()> {
        let path = Path::new(media_path);

        if !path.exists() {
            return Err(AppError::MediaError(format!(
                "Media file not found: {}",
                media_path
            )));
        }

        // Verify the file is within the device's media directory
        let media_dir = Path::new(&self.device_path).join("media");
        if !path.starts_with(&media_dir) {
            return Err(AppError::MediaError(format!(
                "File is not within the device media directory: {}",
                media_path
            )));
        }

        fs::remove_file(path).await.map_err(|e| {
            AppError::MediaError(format!(
                "Failed to remove media file {}: {}",
                media_path, e
            ))
        })?;

        log::info!("Media removed: {}", media_path);
        Ok(())
    }

    /// List subdirectories in the media/ folder, representing available categories.
    pub async fn get_categories(&self) -> Result<Vec<String>> {
        let media_dir = Path::new(&self.device_path).join("media");

        if !media_dir.exists() {
            return Ok(Vec::new());
        }

        let mut categories = Vec::new();
        let mut entries = fs::read_dir(&media_dir).await.map_err(|e| {
            AppError::MediaError(format!(
                "Failed to read media directory {}: {}",
                media_dir.display(),
                e
            ))
        })?;

        while let Some(entry) = entries.next_entry().await.map_err(|e| {
            AppError::MediaError(format!("Failed to read directory entry: {}", e))
        })? {
            let metadata = entry.metadata().await.map_err(|e| {
                AppError::MediaError(format!("Failed to read entry metadata: {}", e))
            })?;

            if metadata.is_dir() {
                if let Some(name) = entry.file_name().to_str() {
                    categories.push(name.to_string());
                }
            }
        }

        categories.sort();
        Ok(categories)
    }
}

/// Check if a file path has a recognized video extension.
fn is_video_file(path: &Path) -> bool {
    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| VIDEO_EXTENSIONS.contains(&ext.to_lowercase().as_str()))
        .unwrap_or(false)
}

/// Determine the MediaCategory based on the subfolder name under the media/ directory.
fn determine_category(file_path: &Path, media_dir: &Path) -> MediaCategory {
    // Get the relative path from media_dir
    if let Ok(relative) = file_path.strip_prefix(media_dir) {
        // The first component is the category folder
        if let Some(first_component) = relative.components().next() {
            let folder_name = first_component.as_os_str().to_string_lossy().to_lowercase();
            return match folder_name.as_str() {
                "movies" => MediaCategory::Movies,
                "shows" | "tv" | "series" | "tvshows" => MediaCategory::Shows,
                "music" => MediaCategory::Music,
                _ => MediaCategory::Other,
            };
        }
    }
    MediaCategory::Other
}

/// Map a MediaCategory to its folder name on the device.
fn category_to_folder_name(category: &MediaCategory) -> &str {
    match category {
        MediaCategory::Movies => "movies",
        MediaCategory::Shows => "shows",
        MediaCategory::Music => "music",
        MediaCategory::Other => "other",
    }
}
