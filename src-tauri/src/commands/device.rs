use std::path::Path;

use crate::error::Result;
use crate::models::DeviceInfo;
use crate::services::device_service::DeviceDetector;
use std::sync::Mutex;
use tauri::State;

pub struct AppState {
    pub current_device_path: Mutex<Option<String>>,
    pub tmdb_api_key: Mutex<Option<String>>,
}

#[tauri::command]
pub async fn detect_devices() -> Result<Vec<String>> {
    let detector = DeviceDetector;
    let paths = detector.scan_drives().await?;
    Ok(paths.into_iter().map(|p| p.to_string_lossy().to_string()).collect())
}

#[tauri::command]
pub async fn connect_to_device(
    device_path: String,
    state: State<'_, AppState>,
) -> Result<DeviceInfo> {
    let detector = DeviceDetector;
    let info = detector.get_device_info(Path::new(&device_path)).await?;
    let mut path = state.current_device_path.lock().unwrap();
    *path = Some(device_path);
    Ok(info)
}

#[tauri::command]
pub async fn disconnect_device(state: State<'_, AppState>) -> Result<()> {
    let mut path = state.current_device_path.lock().unwrap();
    *path = None;
    Ok(())
}

#[tauri::command]
pub async fn get_device_info(state: State<'_, AppState>) -> Result<DeviceInfo> {
    let path = state.current_device_path.lock().unwrap();
    let device_path = path.as_ref().ok_or(crate::error::AppError::DeviceNotConnected)?;
    let detector = DeviceDetector;
    detector.get_device_info(Path::new(device_path)).await
}

#[tauri::command]
pub async fn set_tmdb_api_key(api_key: String, state: State<'_, AppState>) -> Result<()> {
    let mut key = state.tmdb_api_key.lock().unwrap();
    *key = Some(api_key);
    Ok(())
}

#[tauri::command]
pub async fn safe_eject_device(state: State<'_, AppState>) -> Result<()> {
    let path = state.current_device_path.lock().unwrap();
    let device_path = path.as_ref().ok_or(crate::error::AppError::DeviceNotConnected)?;
    let detector = DeviceDetector;
    detector.safe_eject(Path::new(device_path)).await
}
