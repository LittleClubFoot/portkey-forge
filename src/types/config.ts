export interface MediaConfig {
  media: MediaEntry[];
  tags: Record<string, string>;
  parental_controls: ParentalControls;
  nas?: NASConfig;
}

export interface MediaEntry {
  path: string;
  title: string;
  year?: number;
  overview?: string;
  poster?: string;
  runtime?: number;
  genres: string[];
  tmdb_id?: number;
  media_type?: string;
  season?: number;
  episode?: number;
  tag_id?: string;
}

export interface ParentalControls {
  quiet_hours?: QuietHours;
  daily_limit_minutes?: number;
  bedtime_content: string[];
  allowed_categories: string[];
}

export interface QuietHours {
  start: string;
  end: string;
}

export interface NASConfig {
  host: string;
  port: number;
  share_path: string;
  username?: string;
  password?: string;
}

export interface PlaybackLog {
  timestamp: string;
  media_path: string;
  duration_secs: number;
  completed: boolean;
}

export interface AnalyticsData {
  total_watch_time_mins: number;
  total_sessions: number;
  most_watched: WatchCount[];
  daily_usage: DailyUsage[];
}

export interface WatchCount {
  title: string;
  count: number;
  total_minutes: number;
}

export interface DailyUsage {
  date: string;
  minutes: number;
  sessions: number;
}
