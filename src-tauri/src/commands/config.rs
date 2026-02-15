use crate::commands::device::AppState;
use crate::error::{AppError, Result};
use crate::models::{MediaConfig, AnalyticsData, WatchCount, DailyUsage};
use crate::repositories::config_repo::ConfigRepository;
use std::collections::HashMap;
use tauri::State;

#[tauri::command]
pub async fn load_config(state: State<'_, AppState>) -> Result<MediaConfig> {
    let path = state.current_device_path.lock().unwrap();
    let device_path = path.as_ref().ok_or(AppError::DeviceNotConnected)?;
    let repo = ConfigRepository::new(device_path.clone());
    repo.load().await
}

#[tauri::command]
pub async fn save_config(
    config: MediaConfig,
    state: State<'_, AppState>,
) -> Result<()> {
    let path = state.current_device_path.lock().unwrap();
    let device_path = path.as_ref().ok_or(AppError::DeviceNotConnected)?;
    let repo = ConfigRepository::new(device_path.clone());
    repo.save(&config).await
}

#[tauri::command]
pub async fn get_analytics(state: State<'_, AppState>) -> Result<AnalyticsData> {
    let path = state.current_device_path.lock().unwrap();
    let device_path = path.as_ref().ok_or(AppError::DeviceNotConnected)?;
    let repo = ConfigRepository::new(device_path.clone());
    let logs = repo.load_playback_logs().await?;

    let total_watch_time_mins = logs.iter().map(|l| l.duration_secs as u64).sum::<u64>() / 60;
    let total_sessions = logs.len();

    // Count watches per media path
    let mut watch_counts: HashMap<String, (usize, u64)> = HashMap::new();
    for log in &logs {
        let entry = watch_counts.entry(log.media_path.clone()).or_insert((0, 0));
        entry.0 += 1;
        entry.1 += log.duration_secs as u64 / 60;
    }

    let mut most_watched: Vec<WatchCount> = watch_counts
        .into_iter()
        .map(|(title, (count, minutes))| WatchCount {
            title,
            count,
            total_minutes: minutes,
        })
        .collect();
    most_watched.sort_by(|a, b| b.count.cmp(&a.count));
    most_watched.truncate(10);

    // Daily usage
    let mut daily: HashMap<String, (u64, usize)> = HashMap::new();
    for log in &logs {
        let date = log.timestamp.get(..10).unwrap_or(&log.timestamp).to_string();
        let entry = daily.entry(date).or_insert((0, 0));
        entry.0 += log.duration_secs as u64 / 60;
        entry.1 += 1;
    }

    let mut daily_usage: Vec<DailyUsage> = daily
        .into_iter()
        .map(|(date, (minutes, sessions))| DailyUsage {
            date,
            minutes,
            sessions,
        })
        .collect();
    daily_usage.sort_by(|a, b| a.date.cmp(&b.date));

    Ok(AnalyticsData {
        total_watch_time_mins,
        total_sessions,
        most_watched,
        daily_usage,
    })
}
