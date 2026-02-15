import { Loader2 } from "lucide-react";
import clsx from "clsx";
import type { TMDBSearchResult } from "../../types/media";
import { posterUrl } from "../../utils/formatters";

interface SearchResultsProps {
  results: TMDBSearchResult[];
  onSelect: (result: TMDBSearchResult) => void;
  isLoading: boolean;
}

function extractYear(dateStr?: string): string {
  if (!dateStr) return "Unknown year";
  const year = dateStr.slice(0, 4);
  return year || "Unknown year";
}

function truncateOverview(text: string, maxLength: number = 120): string {
  if (!text) return "No overview available.";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export default function SearchResults({
  results,
  onSelect,
  isLoading,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-3 text-sm text-gray-500">Searching TMDB...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 text-center">
        <p className="text-sm font-medium text-gray-500">No results found</p>
        <p className="mt-1 text-xs text-gray-400">
          Try adjusting your search query or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {results.map((result) => {
        const url = posterUrl(result.poster_path);
        const year = extractYear(result.release_date);
        const score =
          result.vote_average != null
            ? result.vote_average.toFixed(1)
            : null;

        return (
          <div
            key={`${result.media_type}-${result.id}`}
            className={clsx(
              "flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white",
              "transition-shadow hover:shadow-md"
            )}
          >
            {/* Poster */}
            <div className="relative aspect-[2/3] w-full bg-gray-100">
              {url ? (
                <img
                  src={url}
                  alt={`${result.title} poster`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-sm text-gray-400">No Poster</span>
                </div>
              )}
              {/* Media type badge */}
              <span
                className={clsx(
                  "absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium",
                  result.media_type === "movie"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                )}
              >
                {result.media_type === "movie" ? "Movie" : "TV"}
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                  {result.title}
                </h4>
                {score && (
                  <span
                    className={clsx(
                      "shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium",
                      parseFloat(score) >= 7
                        ? "bg-green-100 text-green-700"
                        : parseFloat(score) >= 5
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    )}
                  >
                    {score}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500">{year}</p>

              <p className="flex-1 text-xs leading-relaxed text-gray-600">
                {truncateOverview(result.overview)}
              </p>

              <button
                onClick={() => onSelect(result)}
                className={clsx(
                  "mt-2 w-full rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                )}
              >
                Select
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
