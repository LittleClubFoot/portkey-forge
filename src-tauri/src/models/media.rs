use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaItem {
    pub path: String,
    pub filename: String,
    pub size_bytes: u64,
    pub duration_secs: Option<u32>,
    pub format: Option<String>,
    pub resolution: Option<String>,
    pub category: MediaCategory,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum MediaCategory {
    Movies,
    Shows,
    Music,
    Other,
}

impl Default for MediaCategory {
    fn default() -> Self {
        Self::Other
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnrichedMediaItem {
    pub path: String,
    pub title: String,
    pub original_filename: String,
    pub year: Option<u32>,
    pub overview: Option<String>,
    pub poster_path: Option<String>,
    pub local_poster_path: Option<String>,
    pub runtime: Option<u32>,
    pub genres: Vec<String>,
    pub tmdb_id: Option<u64>,
    pub media_type: TMDBMediaType,
    pub season: Option<u32>,
    pub episode: Option<u32>,
    pub tag_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TMDBMediaType {
    Movie,
    Tv,
    Unknown,
}

impl Default for TMDBMediaType {
    fn default() -> Self {
        Self::Unknown
    }
}
