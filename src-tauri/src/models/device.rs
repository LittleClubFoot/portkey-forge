use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub path: String,
    pub name: String,
    pub total_space_bytes: u64,
    pub available_space_bytes: u64,
    pub video_count: usize,
    pub is_connected: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceSignature {
    pub device_name: String,
    pub device_id: String,
    pub version: String,
}
