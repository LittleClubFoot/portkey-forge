import { useState, useMemo } from "react";
import { LayoutGrid, List, ArrowUpDown, Filter } from "lucide-react";
import clsx from "clsx";
import type { MediaItem as MediaItemType, MediaCategory } from "../../types/media";
import { formatBytes, categoryLabel } from "../../utils/formatters";
import SearchInput from "../common/SearchInput";
import MediaItem from "./MediaItem";

type ViewMode = "grid" | "list";
type SortField = "name" | "size" | "date";
type SortDirection = "asc" | "desc";
type CategoryFilter = "all" | MediaCategory;

interface MediaGridProps {
  items: MediaItemType[];
  onSelect: (item: MediaItemType) => void;
  selectedPath: string | null;
  viewMode: ViewMode;
  onRemove?: (item: MediaItemType) => void;
  posterUrls?: Record<string, string>;
}

const categoryOptions: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "movies", label: "Movies" },
  { value: "shows", label: "TV Shows" },
  { value: "music", label: "Music" },
  { value: "other", label: "Other" },
];

const sortOptions: { value: SortField; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "size", label: "Size" },
  { value: "date", label: "Date" },
];

export default function MediaGrid({
  items,
  onSelect,
  selectedPath,
  viewMode,
  onRemove,
  posterUrls = {},
}: MediaGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const filteredAndSorted = useMemo(() => {
    let result = [...items];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.filename.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      result = result.filter((item) => item.category === categoryFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.filename.localeCompare(b.filename);
          break;
        case "size":
          comparison = a.size_bytes - b.size_bytes;
          break;
        case "date":
          // Fall back to filename sort when no date is available
          comparison = a.filename.localeCompare(b.filename);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [items, searchQuery, categoryFilter, sortField, sortDirection]);

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleRemove = (item: MediaItemType) => {
    if (onRemove) {
      onRemove(item);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header and controls */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Media Library
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredAndSorted.length}{" "}
              {filteredAndSorted.length === 1 ? "item" : "items"})
            </span>
          </h2>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by filename..."
            className="w-64"
          />

          {/* Category filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as CategoryFilter)
              }
              className={clsx(
                "rounded-md border border-gray-300 bg-white py-2 pl-2 pr-8 text-sm",
                "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                "transition-colors"
              )}
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className={clsx(
                "rounded-md border border-gray-300 bg-white py-2 pl-2 pr-8 text-sm",
                "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                "transition-colors"
              )}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={toggleSortDirection}
              className={clsx(
                "rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 transition-colors",
                "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              )}
              aria-label={
                sortDirection === "asc" ? "Sort descending" : "Sort ascending"
              }
            >
              <ArrowUpDown
                className={clsx(
                  "h-4 w-4 transition-transform",
                  sortDirection === "desc" && "rotate-180"
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Content area */}
      {filteredAndSorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 text-center">
          <LayoutGrid className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            No media items found
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {searchQuery || categoryFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Add media to your library to get started."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid view */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredAndSorted.map((item) => (
            <MediaItem
              key={item.path}
              item={item}
              isSelected={selectedPath === item.path}
              onClick={() => onSelect(item)}
              onRemove={() => handleRemove(item)}
              posterUrl={posterUrls[item.path]}
            />
          ))}
        </div>
      ) : (
        /* List view */
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Filename
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Size
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Format
                </th>
                <th scope="col" className="relative px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredAndSorted.map((item) => (
                <tr
                  key={item.path}
                  onClick={() => onSelect(item)}
                  className={clsx(
                    "cursor-pointer transition-colors",
                    selectedPath === item.path
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  )}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                    {item.filename}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {categoryLabel(item.category)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {formatBytes(item.size_bytes)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {[item.format?.toUpperCase(), item.resolution]
                      .filter(Boolean)
                      .join(" / ") || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    {onRemove && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(item);
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        aria-label={`Remove ${item.filename}`}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
