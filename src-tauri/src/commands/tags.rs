use crate::commands::device::AppState;
use crate::error::{AppError, Result};
use crate::models::MediaConfig;
use crate::repositories::config_repo::ConfigRepository;
use crate::services::tag_service::TagService;
use std::collections::HashMap;
use tauri::State;

#[tauri::command]
pub async fn assign_tag(
    tag_id: String,
    media_path: String,
    state: State<'_, AppState>,
) -> Result<MediaConfig> {
    let path = state.current_device_path.lock().unwrap();
    let device_path = path.as_ref().ok_or(AppError::DeviceNotConnected)?;
    let repo = ConfigRepository::new(device_path.clone());
    let mut config = repo.load().await?;

    let service = TagService;
    service.assign_tag(&mut config, &tag_id, &media_path).await?;
    repo.save(&config).await?;
    Ok(config)
}

#[tauri::command]
pub async fn unassign_tag(
    tag_id: String,
    state: State<'_, AppState>,
) -> Result<MediaConfig> {
    let path = state.current_device_path.lock().unwrap();
    let device_path = path.as_ref().ok_or(AppError::DeviceNotConnected)?;
    let repo = ConfigRepository::new(device_path.clone());
    let mut config = repo.load().await?;

    let service = TagService;
    service.unassign_tag(&mut config, &tag_id).await?;
    repo.save(&config).await?;
    Ok(config)
}

#[tauri::command]
pub async fn get_tag_assignments(state: State<'_, AppState>) -> Result<HashMap<String, String>> {
    let path = state.current_device_path.lock().unwrap();
    let device_path = path.as_ref().ok_or(AppError::DeviceNotConnected)?;
    let repo = ConfigRepository::new(device_path.clone());
    let config = repo.load().await?;

    let service = TagService;
    service.get_tag_assignments(&config).await
}

#[tauri::command]
pub async fn generate_card_data(
    media_path: String,
    state: State<'_, AppState>,
) -> Result<HashMap<String, String>> {
    let path = state.current_device_path.lock().unwrap();
    let device_path = path.as_ref().ok_or(AppError::DeviceNotConnected)?;
    let repo = ConfigRepository::new(device_path.clone());
    let config = repo.load().await?;

    let entry = config.media.iter()
        .find(|m| m.path == media_path)
        .ok_or(AppError::MediaError(format!("Media not found: {}", media_path)))?;

    let service = TagService;
    service.generate_card_data(entry).await
}
