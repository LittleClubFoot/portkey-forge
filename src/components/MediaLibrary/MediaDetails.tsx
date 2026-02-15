import { useState } from "react";
import {
  Film,
  Clock,
  HardDrive,
  Monitor,
  FileVideo,
  FolderOpen,
  ExternalLink,
  Trash2,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import clsx from "clsx";
import type { MediaItem, EnrichedMediaItem } from "../../types/media";
import {
  formatBytes,
  formatDuration,
  posterUrl,
  categoryLabel,
} from "../../utils/formatters";

interface MediaDetailsProps {
  item: MediaItem;
  enrichedItem: EnrichedMediaItem | null;
  onEnrich: () => void;
  onRemove: () => void;
}

export default function MediaDetails({
  item,
  enrichedItem,
  onEnrich,
  onRemove,
}: MediaDetailsProps) {
  const [confirmRemove, setConfirmRemove] = useState(false);

  const handleRemoveClick = () => {
    if (confirmRemove) {
      onRemove();
      setConfirmRemove(false);
    } else {
      setConfirmRemove(true);
    }
  };

  const resolvedPosterUrl = enrichedItem
    ? posterUrl(enrichedItem.poster_path || enrichedItem.local_poster_path)
    : null;

  const tmdbUrl = enrichedItem?.tmdb_id
    ? enrichedItem.media_type === "movie"
      ? `https://www.themoviedb.org/movie/${enrichedItem.tmdb_id}`
      : `https://www.themoviedb.org/tv/${enrichedItem.tmdb_id}`
    : null;

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header area with poster and title */}
      <div className="flex gap-5">
        {/* Poster */}
        <div className="flex-shrink-0">
          {resolvedPosterUrl ? (
            <img
              src={resolvedPosterUrl}
              alt={enrichedItem?.title || item.filename}
              className="h-48 w-32 rounded-md object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-48 w-32 items-center justify-center rounded-md bg-gray-100">
              <Film className="h-10 w-10 text-gray-300" />
            </div>
          )}
        </div>

        {/* Title and main info */}
        <div className="flex flex-1 flex-col gap-2 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 leading-tight">
            {enrichedItem?.title || item.filename}
          </h2>

          {enrichedItem?.year && (
            <p className="text-sm text-gray-500">{enrichedItem.year}</p>
          )}

          {enrichedItem?.overview && (
            <p className="mt-1 text-sm leading-relaxed text-gray-600 line-clamp-4">
              {enrichedItem.overview}
            </p>
          )}

          {/* Genres */}
          {enrichedItem?.genres && enrichedItem.genres.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {enrichedItem.genres.map((genre) => (
                <span
                  key={genre}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
                >
                  <Tag className="h-3 w-3" />
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* TMDB link */}
          {tmdbUrl && (
            <a
              href={tmdbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              View on TMDB
            </a>
          )}
        </div>
      </div>

      {/* File details section */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          File Information
        </h3>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Path */}
          <div className="flex items-start gap-2.5">
            <FolderOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
            <div className="min-w-0">
              <dt className="text-xs font-medium text-gray-500">Path</dt>
              <dd
                className="truncate text-sm text-gray-900"
                title={item.path}
              >
                {item.path}
              </dd>
            </div>
          </div>

          {/* Size */}
          <div className="flex items-start gap-2.5">
            <HardDrive className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
            <div>
              <dt className="text-xs font-medium text-gray-500">Size</dt>
              <dd className="text-sm text-gray-900">
                {formatBytes(item.size_bytes)}
              </dd>
            </div>
          </div>

          {/* Format */}
          {item.format && (
            <div className="flex items-start gap-2.5">
              <FileVideo className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
              <div>
                <dt className="text-xs font-medium text-gray-500">Format</dt>
                <dd className="text-sm text-gray-900">
                  {item.format.toUpperCase()}
                </dd>
              </div>
            </div>
          )}

          {/* Duration */}
          {item.duration_secs != null && (
            <div className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
              <div>
                <dt className="text-xs font-medium text-gray-500">Duration</dt>
                <dd className="text-sm text-gray-900">
                  {formatDuration(item.duration_secs)}
                </dd>
              </div>
            </div>
          )}

          {/* Resolution */}
          {item.resolution && (
            <div className="flex items-start gap-2.5">
              <Monitor className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
              <div>
                <dt className="text-xs font-medium text-gray-500">
                  Resolution
                </dt>
                <dd className="text-sm text-gray-900">{item.resolution}</dd>
              </div>
            </div>
          )}

          {/* Category */}
          <div className="flex items-start gap-2.5">
            <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
            <div>
              <dt className="text-xs font-medium text-gray-500">Category</dt>
              <dd className="text-sm text-gray-900">
                {categoryLabel(item.category)}
              </dd>
            </div>
          </div>

          {/* Enriched-only: Season/Episode */}
          {enrichedItem?.season != null && (
            <div className="flex items-start gap-2.5">
              <Film className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
              <div>
                <dt className="text-xs font-medium text-gray-500">
                  Season / Episode
                </dt>
                <dd className="text-sm text-gray-900">
                  S{String(enrichedItem.season).padStart(2, "0")}
                  {enrichedItem.episode != null &&
                    `E${String(enrichedItem.episode).padStart(2, "0")}`}
                </dd>
              </div>
            </div>
          )}

          {/* Enriched-only: Runtime */}
          {enrichedItem?.runtime != null && (
            <div className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
              <div>
                <dt className="text-xs font-medium text-gray-500">
                  Runtime (TMDB)
                </dt>
                <dd className="text-sm text-gray-900">
                  {enrichedItem.runtime} min
                </dd>
              </div>
            </div>
          )}
        </dl>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
        {!enrichedItem && (
          <button
            onClick={onEnrich}
            className={clsx(
              "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            )}
          >
            <Sparkles className="h-4 w-4" />
            Enrich Metadata
          </button>
        )}

        {confirmRemove ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Remove this item?</span>
            <button
              onClick={handleRemoveClick}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              )}
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmRemove(false)}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                "bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
              )}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleRemoveClick}
            className={clsx(
              "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              "bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
            )}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
