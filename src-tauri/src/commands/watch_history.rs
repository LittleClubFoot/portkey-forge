use crate::commands::device::AppState;
use crate::error::{AppError, Result};
use crate::models::watch_history::WatchHistoryItem;
use crate::repositories::watch_history_repo::WatchHistoryRepository;
use tauri::State;

fn get_repo(state: &State<'_, AppState>) -> Result<WatchHistoryRepository> {
    let device_path = state.current_device_path.lock().unwrap().clone();
    let device_path = device_path.ok_or(AppError::DeviceNotConnected)?;
    Ok(WatchHistoryRepository::new(&device_path))
}

#[tauri::command]
pub async fn get_watch_history(
    state: State<'_, AppState>,
) -> Result<Vec<WatchHistoryItem>> {
    let repo = get_repo(&state)?;
    tokio::task::spawn_blocking(move || repo.get_watch_history())
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?
}

#[tauri::command]
pub async fn mark_watched(
    tag_id: String,
    season: Option<u32>,
    episode: Option<u32>,
    state: State<'_, AppState>,
) -> Result<()> {
    let repo = get_repo(&state)?;
    tokio::task::spawn_blocking(move || repo.mark_watched(&tag_id, season, episode))
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?
}

#[tauri::command]
pub async fn mark_unwatched(
    tag_id: String,
    state: State<'_, AppState>,
) -> Result<()> {
    let repo = get_repo(&state)?;
    tokio::task::spawn_blocking(move || repo.mark_unwatched(&tag_id))
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?
}

#[tauri::command]
pub async fn update_resume_position(
    tag_id: String,
    season: u32,
    episode: u32,
    position_seconds: u32,
    state: State<'_, AppState>,
) -> Result<()> {
    let repo = get_repo(&state)?;
    tokio::task::spawn_blocking(move || {
        repo.update_resume_position(&tag_id, season, episode, position_seconds)
    })
    .await
    .map_err(|e| AppError::DatabaseError(e.to_string()))?
}

#[tauri::command]
pub async fn clear_watch_history(
    media_path: String,
    state: State<'_, AppState>,
) -> Result<()> {
    let repo = get_repo(&state)?;
    tokio::task::spawn_blocking(move || repo.clear_history(&media_path))
        .await
        .map_err(|e| AppError::DatabaseError(e.to_string()))?
}
