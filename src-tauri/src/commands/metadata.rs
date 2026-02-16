use std::path::{Path, PathBuf};

use crate::commands::device::AppState;
use crate::error::{AppError, Result};
use crate::models::{EnrichedMediaItem, TMDBSearchResult};
use crate::models::metadata::ParsedFilename;
use crate::services::tmdb_service::TMDBService;
use crate::services::metadata_service::MetadataService;
use crate::utils::filename_parser;
use tauri::State;

#[tauri::command]
pub async fn parse_filename(filename: String) -> Result<ParsedFilename> {
    Ok(filename_parser::parse(&filename))
}

#[tauri::command]
pub async fn search_tmdb(
    query: String,
    year: Option<u32>,
    media_type: String,
    state: State<'_, AppState>,
) -> Result<Vec<TMDBSearchResult>> {
    let api_key = state.tmdb_api_key.lock().unwrap();
    let api_key = api_key.as_ref().ok_or(AppError::TMDBError("API key not set".into()))?;
    let tmdb = TMDBService::new(api_key.clone());

    match media_type.as_str() {
        "movie" | "tv" => tmdb.search(&media_type, &query, year).await,
        _ => {
            let mut results = tmdb.search("movie", &query, year).await?;
            results.extend(tmdb.search("tv", &query, year).await?);
            Ok(results)
        }
    }
}

#[tauri::command]
pub async fn auto_enrich_video(
    video_path: String,
    state: State<'_, AppState>,
) -> Result<EnrichedMediaItem> {
    let api_key = state.tmdb_api_key.lock().unwrap().clone();
    let api_key = api_key.ok_or(AppError::TMDBError("API key not set".into()))?;
    let device_path = state.current_device_path.lock().unwrap().clone();
    let device_path = device_path.ok_or(AppError::DeviceNotConnected)?;

    let tmdb = TMDBService::new(api_key);
    let service = MetadataService::new(&tmdb, PathBuf::from(&device_path));
    service.enrich_video(Path::new(&video_path)).await
}

#[tauri::command]
pub async fn enrich_with_selection(
    video_path: String,
    tmdb_id: u64,
    media_type: String,
    state: State<'_, AppState>,
) -> Result<EnrichedMediaItem> {
    let api_key = state.tmdb_api_key.lock().unwrap().clone();
    let api_key = api_key.ok_or(AppError::TMDBError("API key not set".into()))?;
    let device_path = state.current_device_path.lock().unwrap().clone();
    let device_path = device_path.ok_or(AppError::DeviceNotConnected)?;

    let tmdb = TMDBService::new(api_key);
    let service = MetadataService::new(&tmdb, PathBuf::from(&device_path));
    service.enrich_with_selection(Path::new(&video_path), tmdb_id, &media_type).await
}

#[tauri::command]
pub async fn batch_enrich(
    video_paths: Vec<String>,
    state: State<'_, AppState>,
) -> Result<Vec<Option<EnrichedMediaItem>>> {
    let api_key = state.tmdb_api_key.lock().unwrap().clone();
    let api_key = api_key.ok_or(AppError::TMDBError("API key not set".into()))?;
    let device_path = state.current_device_path.lock().unwrap().clone();
    let device_path = device_path.ok_or(AppError::DeviceNotConnected)?;

    let tmdb = TMDBService::new(api_key);
    let service = MetadataService::new(&tmdb, PathBuf::from(&device_path));
    let paths: Vec<PathBuf> = video_paths.iter().map(PathBuf::from).collect();
    let results = service.batch_enrich(&paths).await;

    Ok(results.into_iter().map(|r| r.ok()).collect())
}
