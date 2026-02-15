use std::fs;
use std::path::Path;

/// Returns potential mount points for removable/external media based on the current OS.
pub fn get_mount_points() -> Vec<String> {
    let mut mount_points = Vec::new();

    if cfg!(target_os = "windows") {
        // On Windows, iterate common drive letters (D: through Z:)
        for letter in b'D'..=b'Z' {
            let drive = format!("{}:\\", letter as char);
            if Path::new(&drive).exists() {
                mount_points.push(drive);
            }
        }
    } else if cfg!(target_os = "macos") {
        // On macOS, list /Volumes
        let volumes_path = Path::new("/Volumes");
        if volumes_path.exists() {
            if let Ok(entries) = fs::read_dir(volumes_path) {
                for entry in entries.flatten() {
                    if let Some(path_str) = entry.path().to_str() {
                        mount_points.push(path_str.to_string());
                    }
                }
            }
        }
    } else if cfg!(target_os = "linux") {
        // On Linux, check /media/$USER/* and /mnt/*

        // Check /media/$USER/
        if let Ok(user) = std::env::var("USER") {
            let media_user_path = format!("/media/{}", user);
            let media_path = Path::new(&media_user_path);
            if media_path.exists() {
                if let Ok(entries) = fs::read_dir(media_path) {
                    for entry in entries.flatten() {
                        if let Some(path_str) = entry.path().to_str() {
                            mount_points.push(path_str.to_string());
                        }
                    }
                }
            }
        }

        // Check /mnt/*
        let mnt_path = Path::new("/mnt");
        if mnt_path.exists() {
            if let Ok(entries) = fs::read_dir(mnt_path) {
                for entry in entries.flatten() {
                    if let Some(path_str) = entry.path().to_str() {
                        mount_points.push(path_str.to_string());
                    }
                }
            }
        }
    }

    mount_points
}

/// Check whether a given path contains the `.kidsmedia_device` marker file,
/// indicating it is a valid Portkey Player device.
pub fn is_kidsmedia_device(path: &str) -> bool {
    let marker = Path::new(path).join(".kidsmedia_device");
    marker.exists()
}
