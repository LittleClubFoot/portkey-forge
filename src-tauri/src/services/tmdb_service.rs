use std::path::Path;
use std::time::Duration;

use reqwest::Client;
use tokio::time::sleep;

use crate::error::{AppError, Result};
use crate::models::metadata::*;

const BASE_URL: &str = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL: &str = "https://image.tmdb.org/t/p/w500";

/// Minimum delay between consecutive TMDB API calls (rate-limiting).
const RATE_LIMIT_DELAY: Duration = Duration::from_millis(300);

/// Client for The Movie Database (TMDB) REST API.
pub struct TMDBService {
    pub api_key: String,
    pub client: Client,
}

impl TMDBService {
    /// Create a new `TMDBService` with the given TMDB API key.
    pub fn new(api_key: String) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .expect("failed to build reqwest client");

        Self { api_key, client }
    }

    // ── search ──────────────────────────────────────────────────

    /// Search TMDB for movies or TV shows matching `query`.
    ///
    /// `media_type` must be `"movie"` or `"tv"`.
    /// Optionally filter by `year`.
    pub async fn search(
        &self,
        media_type: &str,
        query: &str,
        year: Option<u32>,
    ) -> Result<Vec<TMDBSearchResult>> {
        sleep(RATE_LIMIT_DELAY).await;

        let (endpoint, year_param) = match media_type {
            "tv" => ("tv", "first_air_date_year"),
            _ => ("movie", "primary_release_year"),
        };

        let mut request = self
            .client
            .get(format!("{}/search/{}", BASE_URL, endpoint))
            .query(&[("api_key", &self.api_key), ("query", &query.to_string())]);

        if let Some(y) = year {
            request = request.query(&[(year_param, &y.to_string())]);
        }

        let response = request.send().await.map_err(|e| {
            AppError::TMDBError(format!("{} search request failed: {}", endpoint, e))
        })?;

        if !response.status().is_success() {
            return Err(AppError::TMDBError(format!(
                "TMDB {} search returned status {}",
                endpoint,
                response.status()
            )));
        }

        let search_response: TMDBSearchResponse = response.json().await.map_err(|e| {
            AppError::TMDBError(format!("Failed to parse {} search response: {}", endpoint, e))
        })?;

        let is_tv = media_type == "tv";
        let results = search_response
            .results
            .into_iter()
            .map(|raw| TMDBSearchResult {
                id: raw.id,
                title: if is_tv {
                    raw.name.unwrap_or_default()
                } else {
                    raw.title.unwrap_or_default()
                },
                overview: raw.overview.unwrap_or_default(),
                release_date: if is_tv { raw.first_air_date } else { raw.release_date },
                poster_path: raw.poster_path,
                vote_average: raw.vote_average,
                media_type: media_type.to_string(),
            })
            .collect();

        Ok(results)
    }

    // ── details ─────────────────────────────────────────────────

    /// Fetch full movie details from TMDB by movie ID.
    pub async fn get_movie_details(&self, id: u64) -> Result<TMDBMovieDetails> {
        sleep(RATE_LIMIT_DELAY).await;

        let response = self
            .client
            .get(format!("{}/movie/{}", BASE_URL, id))
            .query(&[("api_key", &self.api_key)])
            .send()
            .await
            .map_err(|e| {
                AppError::TMDBError(format!("Movie details request failed: {}", e))
            })?;

        if !response.status().is_success() {
            return Err(AppError::TMDBError(format!(
                "TMDB movie details returned status {}",
                response.status()
            )));
        }

        let details: TMDBMovieDetails = response.json().await.map_err(|e| {
            AppError::TMDBError(format!("Failed to parse movie details: {}", e))
        })?;

        Ok(details)
    }

    /// Fetch full TV show details from TMDB by TV show ID.
    pub async fn get_tv_details(&self, id: u64) -> Result<TMDBTVDetails> {
        sleep(RATE_LIMIT_DELAY).await;

        let response = self
            .client
            .get(format!("{}/tv/{}", BASE_URL, id))
            .query(&[("api_key", &self.api_key)])
            .send()
            .await
            .map_err(|e| {
                AppError::TMDBError(format!("TV details request failed: {}", e))
            })?;

        if !response.status().is_success() {
            return Err(AppError::TMDBError(format!(
                "TMDB TV details returned status {}",
                response.status()
            )));
        }

        let details: TMDBTVDetails = response.json().await.map_err(|e| {
            AppError::TMDBError(format!("Failed to parse TV details: {}", e))
        })?;

        Ok(details)
    }

    // ── images ──────────────────────────────────────────────────

    /// Download a poster image from TMDB and save it to `destination`.
    ///
    /// `poster_path` is the path fragment returned by TMDB (e.g. `/abc123.jpg`).
    /// The image is fetched from `https://image.tmdb.org/t/p/w500{poster_path}`.
    pub async fn download_poster(
        &self,
        poster_path: &str,
        destination: &Path,
    ) -> Result<()> {
        sleep(RATE_LIMIT_DELAY).await;

        let url = format!("{}{}", IMAGE_BASE_URL, poster_path);

        let response = self.client.get(&url).send().await.map_err(|e| {
            AppError::TMDBError(format!("Poster download failed: {}", e))
        })?;

        if !response.status().is_success() {
            return Err(AppError::TMDBError(format!(
                "Poster download returned status {}",
                response.status()
            )));
        }

        let bytes = response.bytes().await.map_err(|e| {
            AppError::TMDBError(format!("Failed to read poster bytes: {}", e))
        })?;

        // Ensure parent directory exists
        if let Some(parent) = destination.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }

        tokio::fs::write(destination, &bytes).await?;

        Ok(())
    }
}
