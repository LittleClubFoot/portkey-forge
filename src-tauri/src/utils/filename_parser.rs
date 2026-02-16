use once_cell::sync::Lazy;
use regex::Regex;

use crate::models::metadata::{ParsedFilename, ParsedMediaType};

static RE_SXEX: Lazy<Regex> =
    Lazy::new(|| Regex::new(r"(?i)[Ss](\d{1,2})[Ee](\d{1,3})").unwrap());
static RE_CROSS: Lazy<Regex> =
    Lazy::new(|| Regex::new(r"(?i)(\d{1,2})[xX](\d{1,3})").unwrap());
static RE_VERBOSE: Lazy<Regex> =
    Lazy::new(|| Regex::new(r"(?i)Season\s*(\d{1,2})\s*Episode\s*(\d{1,3})").unwrap());
static RE_YEAR: Lazy<Regex> =
    Lazy::new(|| Regex::new(r"[\(\[\.\s_]?((?:19|20)\d{2})[\)\]\.\s_]?").unwrap());
static RE_SPACES: Lazy<Regex> =
    Lazy::new(|| Regex::new(r"\s{2,}").unwrap());
static RE_QUALITY: Lazy<Regex> = Lazy::new(|| {
    Regex::new(
        r"(?i)\b(1080p|720p|480p|2160p|4K|BluRay|BRRip|WEBRip|WEBDL|WEB-DL|WEB\.DL|HDRip|DVDRip|HDTV|x264|x265|h264|h265|HEVC|AAC|AC3|DTS|REMUX|PROPER|REPACK|EXTENDED|UNRATED|DIRECTORS\.CUT|10bit|HDR|SDR|AMZN|NF|DSNP|HMAX)\b",
    )
    .unwrap()
});

/// Parse a video filename to extract metadata such as title, year, season, and episode.
pub fn parse(filename: &str) -> ParsedFilename {
    // Strip the file extension
    let name = strip_extension(filename);

    // Detect season/episode patterns
    let (season, episode, se_match_start) = extract_season_episode(&name);

    // Determine media type based on whether season/episode was found
    let media_type = if season.is_some() && episode.is_some() {
        ParsedMediaType::TVShow
    } else {
        ParsedMediaType::Movie
    };

    // Extract year
    let (year, year_match_start) = extract_year(&name);

    // Build the title: take everything before the first metadata match
    let title = build_title(&name, se_match_start, year_match_start);

    ParsedFilename {
        title,
        year,
        season,
        episode,
        media_type,
    }
}

/// Remove the file extension from a filename.
fn strip_extension(filename: &str) -> String {
    match filename.rfind('.') {
        Some(pos) => {
            let ext = &filename[pos + 1..];
            // Only strip if it looks like a real file extension (short, alphabetic)
            if ext.len() <= 5 && ext.chars().all(|c| c.is_ascii_alphanumeric()) {
                filename[..pos].to_string()
            } else {
                filename.to_string()
            }
        }
        None => filename.to_string(),
    }
}

/// Extract season and episode numbers from the filename.
/// Returns (season, episode, match_start_position).
fn extract_season_episode(name: &str) -> (Option<u32>, Option<u32>, Option<usize>) {
    // Pattern: S01E05 or s01e05
    if let Some(caps) = RE_SXEX.captures(name) {
        let season = caps.get(1).unwrap().as_str().parse::<u32>().ok();
        let episode = caps.get(2).unwrap().as_str().parse::<u32>().ok();
        let start = caps.get(0).unwrap().start();
        return (season, episode, Some(start));
    }

    // Pattern: 1x05
    if let Some(caps) = RE_CROSS.captures(name) {
        let season = caps.get(1).unwrap().as_str().parse::<u32>().ok();
        let episode = caps.get(2).unwrap().as_str().parse::<u32>().ok();
        let start = caps.get(0).unwrap().start();
        return (season, episode, Some(start));
    }

    // Pattern: Season 1 Episode 5
    if let Some(caps) = RE_VERBOSE.captures(name) {
        let season = caps.get(1).unwrap().as_str().parse::<u32>().ok();
        let episode = caps.get(2).unwrap().as_str().parse::<u32>().ok();
        let start = caps.get(0).unwrap().start();
        return (season, episode, Some(start));
    }

    (None, None, None)
}

/// Extract a four-digit year from the filename.
/// Matches patterns like (2013), [2013], or .2013.
/// Returns (year, match_start_position).
fn extract_year(name: &str) -> (Option<u32>, Option<usize>) {
    if let Some(caps) = RE_YEAR.captures(name) {
        let year = caps.get(1).unwrap().as_str().parse::<u32>().ok();
        let start = caps.get(0).unwrap().start();
        return (year, Some(start));
    }
    (None, None)
}

/// Build a cleaned title string from the filename.
/// Takes everything before the earliest metadata match position and cleans it up.
fn build_title(name: &str, se_pos: Option<usize>, year_pos: Option<usize>) -> String {
    // Find the earliest position where metadata begins
    let cut_pos = match (se_pos, year_pos) {
        (Some(a), Some(b)) => Some(a.min(b)),
        (Some(a), None) => Some(a),
        (None, Some(b)) => Some(b),
        (None, None) => None,
    };

    let raw_title = match cut_pos {
        Some(pos) if pos > 0 => &name[..pos],
        Some(_) => name,
        None => name,
    };

    // Remove quality markers and codec info from the title
    let cleaned = remove_quality_markers(raw_title);

    // Replace dots and underscores with spaces
    let cleaned = cleaned.replace('.', " ").replace('_', " ");

    // Collapse multiple spaces and trim
    let cleaned = RE_SPACES.replace_all(&cleaned, " ");

    cleaned.trim().to_string()
}

/// Remove common quality markers, codec identifiers, and release group tags.
fn remove_quality_markers(input: &str) -> String {
    RE_QUALITY.replace_all(input, " ").to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::metadata::ParsedMediaType;

    #[test]
    fn test_frozen_movie() {
        let result = parse("Frozen.2013.1080p.BluRay.mp4");
        assert_eq!(result.title, "Frozen");
        assert_eq!(result.year, Some(2013));
        assert_eq!(result.season, None);
        assert_eq!(result.episode, None);
        assert_eq!(result.media_type, ParsedMediaType::Movie);
    }

    #[test]
    fn test_breaking_bad_tv_show() {
        let result = parse("Breaking.Bad.S01E05.720p.mkv");
        assert_eq!(result.title, "Breaking Bad");
        assert_eq!(result.year, None);
        assert_eq!(result.season, Some(1));
        assert_eq!(result.episode, Some(5));
        assert_eq!(result.media_type, ParsedMediaType::TVShow);
    }

    #[test]
    fn test_lion_king_underscores_and_parens_year() {
        let result = parse("The_Lion_King_(2019).mp4");
        assert_eq!(result.title, "The Lion King");
        assert_eq!(result.year, Some(2019));
        assert_eq!(result.season, None);
        assert_eq!(result.episode, None);
        assert_eq!(result.media_type, ParsedMediaType::Movie);
    }

    #[test]
    fn test_avatar_way_of_water() {
        let result = parse("avatar.the.way.of.water.2022.webdl.mp4");
        assert_eq!(result.title, "avatar the way of water");
        assert_eq!(result.year, Some(2022));
        assert_eq!(result.season, None);
        assert_eq!(result.episode, None);
        assert_eq!(result.media_type, ParsedMediaType::Movie);
    }

    #[test]
    fn test_bluey_tv_show() {
        let result = parse("Bluey.S03E10.Chest.mp4");
        assert_eq!(result.title, "Bluey");
        assert_eq!(result.year, None);
        assert_eq!(result.season, Some(3));
        assert_eq!(result.episode, Some(10));
        assert_eq!(result.media_type, ParsedMediaType::TVShow);
    }

    #[test]
    fn test_home_video_no_metadata() {
        let result = parse("my-home-video.mp4");
        assert_eq!(result.title, "my-home-video");
        assert_eq!(result.year, None);
        assert_eq!(result.season, None);
        assert_eq!(result.episode, None);
        assert_eq!(result.media_type, ParsedMediaType::Movie);
    }

    #[test]
    fn test_cross_format_season_episode() {
        let result = parse("Friends.1x05.The.One.With.the.East.German.mp4");
        assert_eq!(result.title, "Friends");
        assert_eq!(result.season, Some(1));
        assert_eq!(result.episode, Some(5));
        assert_eq!(result.media_type, ParsedMediaType::TVShow);
    }

    #[test]
    fn test_verbose_season_episode() {
        let result = parse("Peppa Pig Season 2 Episode 10.mp4");
        assert_eq!(result.title, "Peppa Pig");
        assert_eq!(result.season, Some(2));
        assert_eq!(result.episode, Some(10));
        assert_eq!(result.media_type, ParsedMediaType::TVShow);
    }
}
