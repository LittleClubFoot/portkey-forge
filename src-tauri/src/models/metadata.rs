use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TMDBSearchResult {
    pub id: u64,
    pub title: String,
    pub overview: String,
    pub release_date: Option<String>,
    pub poster_path: Option<String>,
    pub vote_average: Option<f64>,
    pub media_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TMDBMovieDetails {
    pub id: u64,
    pub title: String,
    pub overview: String,
    pub release_date: Option<String>,
    pub poster_path: Option<String>,
    pub runtime: Option<u32>,
    pub genres: Vec<TMDBGenre>,
    pub vote_average: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TMDBTVDetails {
    pub id: u64,
    pub name: String,
    pub overview: String,
    pub first_air_date: Option<String>,
    pub poster_path: Option<String>,
    pub episode_run_time: Vec<u32>,
    pub genres: Vec<TMDBGenre>,
    pub vote_average: Option<f64>,
    pub number_of_seasons: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TMDBGenre {
    pub id: u64,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParsedFilename {
    pub title: String,
    pub year: Option<u32>,
    pub season: Option<u32>,
    pub episode: Option<u32>,
    pub media_type: ParsedMediaType,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ParsedMediaType {
    Movie,
    TVShow,
    Unknown,
}

// TMDB API response wrappers
#[derive(Debug, Clone, Deserialize)]
pub struct TMDBSearchResponse {
    pub results: Vec<TMDBSearchResultRaw>,
    pub total_results: u32,
}

#[derive(Debug, Clone, Deserialize)]
pub struct TMDBSearchResultRaw {
    pub id: u64,
    pub title: Option<String>,
    pub name: Option<String>,
    pub overview: Option<String>,
    pub release_date: Option<String>,
    pub first_air_date: Option<String>,
    pub poster_path: Option<String>,
    pub vote_average: Option<f64>,
}
