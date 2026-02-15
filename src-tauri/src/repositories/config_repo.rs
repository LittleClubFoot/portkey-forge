use std::path::Path;
use tokio::fs;

use crate::error::{AppError, Result};
use crate::models::config::{MediaConfig, PlaybackLog};

/// Repository for reading and writing device configuration and playback logs.
pub struct ConfigRepository {
    device_path: String,
}

impl ConfigRepository {
    /// Create a new ConfigRepository for the given device path.
    pub fn new(device_path: String) -> Self {
        Self { device_path }
    }

    /// Load the media configuration from config.json at the device root.
    /// Returns a default MediaConfig if the file does not exist.
    pub async fn load(&self) -> Result<MediaConfig> {
        let config_path = Path::new(&self.device_path).join("config.json");

        if !config_path.exists() {
            log::info!(
                "Config file not found at {}, returning default",
                config_path.display()
            );
            return Ok(MediaConfig::default());
        }

        let contents = fs::read_to_string(&config_path).await.map_err(|e| {
            AppError::ConfigError(format!(
                "Failed to read config at {}: {}",
                config_path.display(),
                e
            ))
        })?;

        let config: MediaConfig = serde_json::from_str(&contents).map_err(|e| {
            AppError::ConfigError(format!("Failed to parse config.json: {}", e))
        })?;

        Ok(config)
    }

    /// Save the media configuration to config.json at the device root.
    pub async fn save(&self, config: &MediaConfig) -> Result<()> {
        let config_path = Path::new(&self.device_path).join("config.json");

        let json = serde_json::to_string_pretty(config).map_err(|e| {
            AppError::ConfigError(format!("Failed to serialize config: {}", e))
        })?;

        fs::write(&config_path, json).await.map_err(|e| {
            AppError::ConfigError(format!(
                "Failed to write config to {}: {}",
                config_path.display(),
                e
            ))
        })?;

        log::info!("Config saved to {}", config_path.display());
        Ok(())
    }

    /// Load playback logs from logs/playback.jsonl on the device.
    /// Each line in the file is a separate JSON object representing a PlaybackLog entry.
    /// Returns an empty Vec if the file does not exist.
    pub async fn load_playback_logs(&self) -> Result<Vec<PlaybackLog>> {
        let log_path = Path::new(&self.device_path)
            .join("logs")
            .join("playback.jsonl");

        if !log_path.exists() {
            log::info!(
                "Playback log not found at {}, returning empty",
                log_path.display()
            );
            return Ok(Vec::new());
        }

        let contents = fs::read_to_string(&log_path).await.map_err(|e| {
            AppError::ConfigError(format!(
                "Failed to read playback log at {}: {}",
                log_path.display(),
                e
            ))
        })?;

        let mut logs = Vec::new();
        for (line_num, line) in contents.lines().enumerate() {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }
            match serde_json::from_str::<PlaybackLog>(trimmed) {
                Ok(log_entry) => logs.push(log_entry),
                Err(e) => {
                    log::warn!(
                        "Failed to parse playback log line {}: {}",
                        line_num + 1,
                        e
                    );
                }
            }
        }

        Ok(logs)
    }
}
