use std::collections::HashMap;

use crate::error::Result;
use crate::models::config::*;

/// Manages NFC / printable-card tag assignments for media entries.
pub struct TagService;

impl TagService {
    /// Create a new `TagService`.
    pub fn new() -> Self {
        Self
    }

    /// Assign a tag to a media entry inside the given configuration.
    ///
    /// `tag_id`     – unique identifier for the physical tag / card.
    /// `media_path` – path of the media file on the device.
    ///
    /// The mapping is stored in `config.tags` (`tag_id` -> `media_path`).
    /// If the tag was previously assigned to a different media file, the
    /// old assignment is replaced.
    pub async fn assign_tag(
        &self,
        config: &mut MediaConfig,
        tag_id: &str,
        media_path: &str,
    ) -> Result<()> {
        // Update the tag map
        config
            .tags
            .insert(tag_id.to_string(), media_path.to_string());

        // Also update the media entry's tag_id field so the two stay in sync
        for entry in config.media.iter_mut() {
            if entry.path == media_path {
                entry.tag_id = Some(tag_id.to_string());
            }
        }

        Ok(())
    }

    /// Remove a tag assignment from the configuration.
    ///
    /// If the tag was linked to a media entry, that entry's `tag_id` field
    /// is also cleared.
    pub async fn unassign_tag(
        &self,
        config: &mut MediaConfig,
        tag_id: &str,
    ) -> Result<()> {
        // Remove from the top-level tag map
        config.tags.remove(tag_id);

        // Clear the tag_id on any media entry that referenced this tag
        for entry in config.media.iter_mut() {
            if entry.tag_id.as_deref() == Some(tag_id) {
                entry.tag_id = None;
            }
        }

        Ok(())
    }

    /// Return a clone of the current tag-to-media-path mapping.
    pub async fn get_tag_assignments(
        &self,
        config: &MediaConfig,
    ) -> Result<HashMap<String, String>> {
        Ok(config.tags.clone())
    }

    /// Generate the data needed to produce a printable card for a given
    /// media entry.
    ///
    /// Returns a `HashMap` containing fields such as `title`, `year`,
    /// `poster`, `tag_id`, and `genres` that a front-end template can
    /// render into a physical card layout.
    pub async fn generate_card_data(
        &self,
        media_entry: &MediaEntry,
    ) -> Result<HashMap<String, String>> {
        let mut card: HashMap<String, String> = HashMap::new();

        card.insert("title".to_string(), media_entry.title.clone());

        if let Some(year) = media_entry.year {
            card.insert("year".to_string(), year.to_string());
        }

        if let Some(ref poster) = media_entry.poster {
            card.insert("poster".to_string(), poster.clone());
        }

        if let Some(ref tag_id) = media_entry.tag_id {
            card.insert("tag_id".to_string(), tag_id.clone());
        }

        if let Some(ref overview) = media_entry.overview {
            card.insert("overview".to_string(), overview.clone());
        }

        if let Some(runtime) = media_entry.runtime {
            card.insert("runtime".to_string(), format!("{} min", runtime));
        }

        if !media_entry.genres.is_empty() {
            card.insert("genres".to_string(), media_entry.genres.join(", "));
        }

        card.insert("path".to_string(), media_entry.path.clone());

        if let Some(ref media_type) = media_entry.media_type {
            card.insert("media_type".to_string(), media_type.clone());
        }

        Ok(card)
    }
}
