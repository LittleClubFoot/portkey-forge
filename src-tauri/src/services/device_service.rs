use std::path::{Path, PathBuf};
use walkdir::WalkDir;

use crate::constants::VIDEO_EXTENSIONS;
use crate::error::{AppError, Result};
use crate::models::{DeviceInfo, DeviceSignature};

/// Name of the signature file that marks a directory as a Portkey Player device.
const SIGNATURE_FILE: &str = ".kidsmedia_device";

/// Detects and manages external USB / media devices that contain
/// the Portkey Player signature file.
pub struct DeviceDetector;

impl DeviceDetector {
    /// Create a new `DeviceDetector`.
    pub fn new() -> Self {
        Self
    }

    // ── scanning ────────────────────────────────────────────────

    /// Scan mounted drives for ones that contain the Portkey Player signature file.
    /// Returns a list of root paths for every valid device found.
    pub async fn scan_drives(&self) -> Result<Vec<PathBuf>> {
        let candidate_roots = Self::platform_roots();
        let mut devices: Vec<PathBuf> = Vec::new();

        for root in candidate_roots {
            if self.verify_device(&root).await {
                devices.push(root);
            }
        }

        Ok(devices)
    }

    /// Return the set of candidate mount-points for the current platform.
    fn platform_roots() -> Vec<PathBuf> {
        let mut roots = Vec::new();

        // Windows: check drive letters A-Z
        #[cfg(target_os = "windows")]
        {
            for letter in b'A'..=b'Z' {
                let drive = format!("{}:\\", letter as char);
                let path = PathBuf::from(&drive);
                if path.exists() {
                    roots.push(path);
                }
            }
        }

        // macOS: enumerate /Volumes/*
        #[cfg(target_os = "macos")]
        {
            if let Ok(entries) = std::fs::read_dir("/Volumes") {
                for entry in entries.flatten() {
                    roots.push(entry.path());
                }
            }
        }

        // Linux: enumerate /media/* and /mnt/*
        #[cfg(target_os = "linux")]
        {
            for base in &["/media", "/mnt"] {
                if let Ok(entries) = std::fs::read_dir(base) {
                    for entry in entries.flatten() {
                        let path = entry.path();
                        if path.is_dir() {
                            // /media/<user>/<device> – go one level deeper
                            if let Ok(sub_entries) = std::fs::read_dir(&path) {
                                for sub in sub_entries.flatten() {
                                    if sub.path().is_dir() {
                                        roots.push(sub.path());
                                    }
                                }
                            }
                            // Also check the direct child itself
                            roots.push(path);
                        }
                    }
                }
            }
        }

        roots
    }

    // ── device info ─────────────────────────────────────────────

    /// Read device information from a given device root path.
    ///
    /// This gathers disk-space metadata (via `std::fs::metadata` on the
    /// signature file) and counts all video files found on the device.
    pub async fn get_device_info(&self, path: &Path) -> Result<DeviceInfo> {
        if !self.verify_device(path).await {
            return Err(AppError::InvalidDevice);
        }

        let signature = self.read_signature(path).await?;

        // Count video files using walkdir
        let video_count = self.count_video_files(path);

        // Disk space – we use the metadata of the root directory itself.
        // Accurate free-space queries require platform APIs; here we provide
        // a best-effort approach using std::fs::metadata on the root.
        let (total_space, available_space) = Self::disk_space(path);

        Ok(DeviceInfo {
            path: path.to_string_lossy().to_string(),
            name: signature.device_name,
            total_space_bytes: total_space,
            available_space_bytes: available_space,
            video_count,
            is_connected: true,
        })
    }

    /// Attempt to read total and available disk space for the given path.
    /// Falls back to `(0, 0)` if the platform does not expose the information.
    fn disk_space(path: &Path) -> (u64, u64) {
        // On Unix-like systems we can use `statvfs` via std; on Windows, the
        // `GetDiskFreeSpaceExW` API could be called.  For portability we use
        // a simple heuristic based on `std::fs::metadata` of the directory.
        //
        // NOTE: `std::fs::metadata` does *not* report free space.  A production
        // implementation should use the `fs2` or `sysinfo` crate.  The values
        // below are placeholders that indicate "information unavailable".
        let _ = path;
        (0, 0)
    }

    /// Walk the device directory tree and count files with video extensions.
    fn count_video_files(&self, root: &Path) -> usize {
        WalkDir::new(root)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file())
            .filter(|e| {
                e.path()
                    .extension()
                    .and_then(|ext| ext.to_str())
                    .map(|ext| VIDEO_EXTENSIONS.contains(&ext.to_lowercase().as_str()))
                    .unwrap_or(false)
            })
            .count()
    }

    // ── verification ────────────────────────────────────────────

    /// Check whether the given path contains the `.kidsmedia_device`
    /// signature file, confirming it as a valid Portkey Player device.
    pub async fn verify_device(&self, path: &Path) -> bool {
        path.join(SIGNATURE_FILE).exists()
    }

    /// Read and parse the device signature JSON file.
    async fn read_signature(&self, path: &Path) -> Result<DeviceSignature> {
        let sig_path = path.join(SIGNATURE_FILE);
        let contents = tokio::fs::read_to_string(&sig_path).await.map_err(|_| {
            AppError::DeviceNotFound(format!(
                "Could not read signature file at {}",
                sig_path.display()
            ))
        })?;
        let signature: DeviceSignature = serde_json::from_str(&contents)?;
        Ok(signature)
    }

    // ── ejection ────────────────────────────────────────────────

    /// Attempt a platform-specific safe eject of the device at `path`.
    ///
    /// The actual eject commands are placeholders and should be replaced
    /// with proper implementations (or calls via `tauri-plugin-shell`) in
    /// production.
    pub async fn safe_eject(&self, path: &Path) -> Result<()> {
        let path_str = path.to_string_lossy().to_string();

        #[cfg(target_os = "windows")]
        {
            // Placeholder: on Windows one would invoke `mountvol <drive> /P`
            // or use the Win32 `CM_Request_Device_Eject` API.
            log::info!("Windows safe-eject requested for {}", path_str);
            let _output = std::process::Command::new("cmd")
                .args(["/C", &format!("mountvol {} /P", path_str)])
                .output()?;
        }

        #[cfg(target_os = "macos")]
        {
            // Placeholder: `diskutil eject <path>`
            log::info!("macOS safe-eject requested for {}", path_str);
            let _output = std::process::Command::new("diskutil")
                .args(["eject", &path_str])
                .output()?;
        }

        #[cfg(target_os = "linux")]
        {
            // Placeholder: `udisksctl unmount -b <device>` or `umount <path>`
            log::info!("Linux safe-eject requested for {}", path_str);
            let _output = std::process::Command::new("umount")
                .arg(&path_str)
                .output()?;
        }

        Ok(())
    }
}

/// Returns `true` if the given extension (without leading dot) is a
/// recognized video format.
pub fn is_video_extension(ext: &str) -> bool {
    VIDEO_EXTENSIONS.contains(&ext.to_lowercase().as_str())
}
