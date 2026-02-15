use std::path::Path;
use tokio::fs;

use crate::error::{AppError, Result};

/// Repository for caching TMDB metadata as individual JSON files on disk.
pub struct CacheRepository {
    cache_dir: String,
}

impl CacheRepository {
    /// Create a new CacheRepository. Creates the cache directory if it does not exist.
    pub fn new(cache_dir: String) -> Result<Self> {
        let path = Path::new(&cache_dir);
        if !path.exists() {
            std::fs::create_dir_all(path).map_err(|e| {
                AppError::ConfigError(format!(
                    "Failed to create cache directory {}: {}",
                    cache_dir, e
                ))
            })?;
        }
        Ok(Self { cache_dir })
    }

    /// Retrieve cached metadata for a given TMDB ID.
    /// Returns `None` if no cached file exists.
    pub async fn get_cached_metadata(&self, tmdb_id: u64) -> Result<Option<serde_json::Value>> {
        let file_path = self.cache_file_path(tmdb_id);

        if !file_path.exists() {
            return Ok(None);
        }

        let contents = fs::read_to_string(&file_path).await.map_err(|e| {
            AppError::ConfigError(format!(
                "Failed to read cache file {}: {}",
                file_path.display(),
                e
            ))
        })?;

        let data: serde_json::Value = serde_json::from_str(&contents).map_err(|e| {
            AppError::ConfigError(format!(
                "Failed to parse cached metadata from {}: {}",
                file_path.display(),
                e
            ))
        })?;

        Ok(Some(data))
    }

    /// Write metadata to the cache for a given TMDB ID.
    pub async fn cache_metadata(
        &self,
        tmdb_id: u64,
        data: &serde_json::Value,
    ) -> Result<()> {
        let file_path = self.cache_file_path(tmdb_id);

        let json = serde_json::to_string_pretty(data).map_err(|e| {
            AppError::ConfigError(format!("Failed to serialize cache data: {}", e))
        })?;

        fs::write(&file_path, json).await.map_err(|e| {
            AppError::ConfigError(format!(
                "Failed to write cache file {}: {}",
                file_path.display(),
                e
            ))
        })?;

        Ok(())
    }

    /// Remove all cached metadata files from the cache directory.
    pub async fn clear_cache(&self) -> Result<()> {
        let cache_path = Path::new(&self.cache_dir);

        if !cache_path.exists() {
            return Ok(());
        }

        let mut entries = fs::read_dir(cache_path).await.map_err(|e| {
            AppError::ConfigError(format!(
                "Failed to read cache directory {}: {}",
                self.cache_dir, e
            ))
        })?;

        while let Some(entry) = entries.next_entry().await.map_err(|e| {
            AppError::ConfigError(format!("Failed to read cache entry: {}", e))
        })? {
            let path = entry.path();
            if path.is_file()
                && path
                    .extension()
                    .and_then(|e| e.to_str())
                    .map(|e| e == "json")
                    .unwrap_or(false)
            {
                fs::remove_file(&path).await.map_err(|e| {
                    AppError::ConfigError(format!(
                        "Failed to remove cache file {}: {}",
                        path.display(),
                        e
                    ))
                })?;
            }
        }

        log::info!("Cache cleared: {}", self.cache_dir);
        Ok(())
    }

    /// Build the file path for a cached TMDB entry.
    fn cache_file_path(&self, tmdb_id: u64) -> std::path::PathBuf {
        Path::new(&self.cache_dir).join(format!("{}.json", tmdb_id))
    }
}
