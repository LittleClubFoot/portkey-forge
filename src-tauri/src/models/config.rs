use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MediaConfig {
    #[serde(default)]
    pub media: Vec<MediaEntry>,
    #[serde(default)]
    pub tags: HashMap<String, String>,
    #[serde(default)]
    pub parental_controls: ParentalControls,
    #[serde(default)]
    pub nas: Option<NASConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaEntry {
    pub path: String,
    pub title: String,
    #[serde(default)]
    pub year: Option<u32>,
    #[serde(default)]
    pub overview: Option<String>,
    #[serde(default)]
    pub poster: Option<String>,
    #[serde(default)]
    pub runtime: Option<u32>,
    #[serde(default)]
    pub genres: Vec<String>,
    #[serde(default)]
    pub tmdb_id: Option<u64>,
    #[serde(default)]
    pub media_type: Option<String>,
    #[serde(default)]
    pub season: Option<u32>,
    #[serde(default)]
    pub episode: Option<u32>,
    #[serde(default)]
    pub tag_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ParentalControls {
    #[serde(default)]
    pub quiet_hours: Option<QuietHours>,
    #[serde(default)]
    pub daily_limit_minutes: Option<u32>,
    #[serde(default)]
    pub bedtime_content: Vec<String>,
    #[serde(default)]
    pub allowed_categories: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuietHours {
    pub start: String,
    pub end: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NASConfig {
    pub host: String,
    pub port: u16,
    pub share_path: String,
    #[serde(default)]
    pub username: Option<String>,
    #[serde(default)]
    pub password: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybackLog {
    pub timestamp: String,
    pub media_path: String,
    pub duration_secs: u32,
    pub completed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyticsData {
    pub total_watch_time_mins: u64,
    pub total_sessions: usize,
    pub most_watched: Vec<WatchCount>,
    pub daily_usage: Vec<DailyUsage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatchCount {
    pub title: String,
    pub count: usize,
    pub total_minutes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DailyUsage {
    pub date: String,
    pub minutes: u64,
    pub sessions: usize,
}
