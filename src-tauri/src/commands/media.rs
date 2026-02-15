use crate::commands::device::AppState;
use crate::error::{AppError, Result};
use crate::models::{MediaItem, MediaCategory};
use crate::repositories::media_repo::MediaRepository;
use tauri::State;

#[tauri::command]
pub async fn scan_media(state: State<'_, AppState>) -> Result<Vec<MediaItem>> {
    let path = state.current_device_path.lock().unwrap();
    let device_path = path.as_ref().ok_or(AppError::DeviceNotConnected)?;
    let repo = MediaRepository::new(device_path.clone());
    repo.scan_media().await
}

#[tauri::command]
pub async fn add_media(
    source_path: String,
    category: MediaCategory,
    state: State<'_, AppState>,
) -> Result<String> {
    let path = state.current_device_path.lock().unwrap();
    let device_path = path.as_ref().ok_or(AppError::DeviceNotConnected)?;
    let repo = MediaRepository::new(device_path.clone());
    let dest = repo.add_media(&source_path, &category).await?;
    Ok(dest.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn remove_media(
    media_path: String,
    state: State<'_, AppState>,
) -> Result<()> {
    let path = state.current_device_path.lock().unwrap();
    let device_path = path.as_ref().ok_or(AppError::DeviceNotConnected)?;
    let repo = MediaRepository::new(device_path.clone());
    repo.remove_media(&media_path).await
}

#[tauri::command]
pub async fn get_media_categories(state: State<'_, AppState>) -> Result<Vec<String>> {
    let path = state.current_device_path.lock().unwrap();
    let device_path = path.as_ref().ok_or(AppError::DeviceNotConnected)?;
    let repo = MediaRepository::new(device_path.clone());
    repo.get_categories().await
}
