export interface WatchHistoryItem {
  media_path: string;
  title: string;
  tag_id: string | null;
  /** "movie" or "tv" */
  media_type: string;
  season: number | null;
  episode: number | null;
  watched: boolean;
  /** Seconds into current episode/movie where playback paused */
  progress_seconds: number;
  /** Total seconds watched across all sessions */
  total_watch_time_secs: number;
  /** ISO timestamp of most recent playback */
  last_watched: string | null;
  play_count: number;
}
