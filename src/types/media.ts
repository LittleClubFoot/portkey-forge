export interface MediaItem {
  path: string;
  filename: string;
  size_bytes: number;
  duration_secs?: number;
  format?: string;
  resolution?: string;
  category: MediaCategory;
}

export type MediaCategory = "movies" | "shows" | "music" | "other";

export interface EnrichedMediaItem {
  path: string;
  title: string;
  original_filename: string;
  year?: number;
  overview?: string;
  poster_path?: string;
  local_poster_path?: string;
  runtime?: number;
  genres: string[];
  tmdb_id?: number;
  media_type: TMDBMediaType;
  season?: number;
  episode?: number;
  tag_id?: string;
}

export type TMDBMediaType = "movie" | "tv" | "unknown";

export interface TMDBSearchResult {
  id: number;
  title: string;
  overview: string;
  release_date?: string;
  poster_path?: string;
  vote_average?: number;
  media_type: string;
}

export interface ParsedFilename {
  title: string;
  year?: number;
  season?: number;
  episode?: number;
  media_type: "Movie" | "TVShow" | "Unknown";
}
