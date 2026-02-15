export interface DeviceInfo {
  path: string;
  name: string;
  total_space_bytes: number;
  available_space_bytes: number;
  video_count: number;
  is_connected: boolean;
}
