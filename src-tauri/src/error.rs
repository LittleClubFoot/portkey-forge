use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Device not found: {0}")]
    DeviceNotFound(String),

    #[error("Device not connected")]
    DeviceNotConnected,

    #[error("Invalid device: missing signature file")]
    InvalidDevice,

    #[error("TMDB API error: {0}")]
    TMDBError(String),

    #[error("Configuration error: {0}")]
    ConfigError(String),

    #[error("Media error: {0}")]
    MediaError(String),

    #[error("Tag error: {0}")]
    TagError(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),

    #[error("HTTP error: {0}")]
    HttpError(#[from] reqwest::Error),

    #[error("Image error: {0}")]
    ImageError(#[from] image::ImageError),

    #[error("Database error: {0}")]
    DatabaseError(String),
}

// Tauri requires errors to be serializable
impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
