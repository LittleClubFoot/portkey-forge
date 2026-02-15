import { useState } from "react";
import { Film, Trash2 } from "lucide-react";
import clsx from "clsx";
import type { MediaItem as MediaItemType } from "../../types/media";
import { formatBytes, categoryLabel } from "../../utils/formatters";

interface MediaItemProps {
  item: MediaItemType;
  isSelected: boolean;
  onClick: () => void;
  onRemove: () => void;
  posterUrl?: string;
}

const categoryColors: Record<string, string> = {
  movies: "bg-blue-100 text-blue-700",
  shows: "bg-purple-100 text-purple-700",
  music: "bg-green-100 text-green-700",
  other: "bg-gray-100 text-gray-700",
};

export default function MediaItem({
  item,
  isSelected,
  onClick,
  onRemove,
  posterUrl,
}: MediaItemProps) {
  const [confirmRemove, setConfirmRemove] = useState(false);

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmRemove) {
      onRemove();
      setConfirmRemove(false);
    } else {
      setConfirmRemove(true);
    }
  };

  const handleCancelRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmRemove(false);
  };

  const truncatedFilename =
    item.filename.length > 40
      ? item.filename.slice(0, 37) + "..."
      : item.filename;

  return (
    <div
      onClick={onClick}
      className={clsx(
        "group relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all cursor-pointer",
        "hover:shadow-md hover:border-gray-300",
        isSelected
          ? "border-blue-500 ring-2 ring-blue-200"
          : "border-gray-200"
      )}
    >
      {/* Poster / Thumbnail */}
      <div className="relative aspect-[2/3] w-full bg-gray-100">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={item.filename}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Film className="h-12 w-12 text-gray-300" />
          </div>
        )}

        {/* Remove button overlay */}
        <div
          className={clsx(
            "absolute right-1.5 top-1.5 transition-opacity",
            confirmRemove
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          )}
        >
          {confirmRemove ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleRemoveClick}
                className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={handleCancelRemove}
                className="rounded-md bg-gray-600 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleRemoveClick}
              className="rounded-md bg-black/50 p-1.5 text-white hover:bg-red-600 transition-colors"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Info section */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3
          className="text-sm font-medium text-gray-900 leading-tight"
          title={item.filename}
        >
          {truncatedFilename}
        </h3>

        <div className="flex items-center gap-2">
          <span
            className={clsx(
              "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
              categoryColors[item.category] || categoryColors.other
            )}
          >
            {categoryLabel(item.category)}
          </span>
          <span className="text-xs text-gray-500">
            {formatBytes(item.size_bytes)}
          </span>
        </div>

        {(item.format || item.resolution) && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {item.format && <span>{item.format.toUpperCase()}</span>}
            {item.format && item.resolution && (
              <span className="text-gray-300">|</span>
            )}
            {item.resolution && <span>{item.resolution}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
