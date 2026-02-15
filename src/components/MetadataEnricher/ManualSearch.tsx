import { useState, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useMetadata } from "../../hooks/useMetadata";
import type { TMDBSearchResult } from "../../types/media";
import SearchResults from "./SearchResults";

type MediaTypeFilter = "all" | "movie" | "tv";

interface ManualSearchProps {
  videoPath: string;
  onSelect: (tmdbId: number, mediaType: string) => void;
}

const mediaTypeOptions: { value: MediaTypeFilter; label: string }[] = [
  { value: "all", label: "Both" },
  { value: "movie", label: "Movie" },
  { value: "tv", label: "TV Show" },
];

export default function ManualSearch({
  videoPath,
  onSelect,
}: ManualSearchProps) {
  const { searchResults, isSearching, search, clearResults } = useMetadata();
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<string>("");
  const [mediaType, setMediaType] = useState<MediaTypeFilter>("all");

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    const parsedYear = year ? parseInt(year, 10) : undefined;
    const typeParam = mediaType === "all" ? undefined : mediaType;

    await search(query.trim(), parsedYear, typeParam);
  }, [query, year, mediaType, search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelect = (result: TMDBSearchResult) => {
    onSelect(result.id, result.media_type);
    clearResults();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search form */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Manual TMDB Search
        </h3>

        <p className="text-sm text-gray-500">
          Searching metadata for:{" "}
          <span className="font-medium text-gray-700">
            {videoPath.split("/").pop() || videoPath}
          </span>
        </p>

        {/* Query input */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="search-query"
            className="text-sm font-medium text-gray-700"
          >
            Search Query
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="search-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter movie or show title..."
              className={clsx(
                "w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4",
                "text-sm text-gray-900 placeholder-gray-400",
                "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                "transition-colors"
              )}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {/* Year input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="search-year"
              className="text-sm font-medium text-gray-700"
            >
              Year{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="search-year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 2023"
              min={1900}
              max={2100}
              className={clsx(
                "w-28 rounded-md border border-gray-300 bg-white px-3 py-2",
                "text-sm text-gray-900 placeholder-gray-400",
                "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                "transition-colors"
              )}
            />
          </div>

          {/* Media type toggle */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">
              Media Type
            </span>
            <div className="inline-flex rounded-md border border-gray-300">
              {mediaTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMediaType(option.value)}
                  className={clsx(
                    "px-3 py-2 text-sm font-medium transition-colors",
                    "first:rounded-l-md last:rounded-r-md",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                    mediaType === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className={clsx(
              "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
              isSearching || !query.trim()
                ? "cursor-not-allowed bg-blue-300 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
            )}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      <SearchResults
        results={searchResults}
        onSelect={handleSelect}
        isLoading={isSearching}
      />
    </div>
  );
}
