#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod commands;
mod error;
mod models;
mod repositories;
mod services;
mod utils;

use commands::device::AppState;
use std::sync::Mutex;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            current_device_path: Mutex::new(None),
            tmdb_api_key: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            // Device commands
            commands::device::detect_devices,
            commands::device::connect_to_device,
            commands::device::disconnect_device,
            commands::device::get_device_info,
            commands::device::set_tmdb_api_key,
            commands::device::safe_eject_device,
            // Media commands
            commands::media::scan_media,
            commands::media::add_media,
            commands::media::remove_media,
            commands::media::get_media_categories,
            // Metadata commands
            commands::metadata::parse_filename,
            commands::metadata::search_tmdb,
            commands::metadata::auto_enrich_video,
            commands::metadata::enrich_with_selection,
            commands::metadata::batch_enrich,
            // Config commands
            commands::config::load_config,
            commands::config::save_config,
            commands::config::get_analytics,
            // Tag commands
            commands::tags::assign_tag,
            commands::tags::unassign_tag,
            commands::tags::get_tag_assignments,
            commands::tags::generate_card_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
