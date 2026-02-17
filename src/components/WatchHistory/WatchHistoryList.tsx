import { useMemo, useState } from "react";
import {
  Film,
  Tv,
  Eye,
  EyeOff,
  Clock,
  Play,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import type { WatchHistoryItem } from "../../types/watchHistory";
import { formatDuration } from "../../utils/formatters";

interface WatchHistoryListProps {
  items: WatchHistoryItem[];
  onMarkWatched: (tagId: string, season?: number, episode?: number) => void;
  onMarkUnwatched: (tagId: string) => void;
  onClearHistory: (mediaPath: string) => void;
}

type FilterMode = "all" | "movie" | "tv";

interface TVGroup {
  title: string;
  items: WatchHistoryItem[];
  totalWatchTime: number;
  lastWatched: string | null;
}

function formatTimestamp(position: number): string {
  const h = Math.floor(position / 3600);
  const m = Math.floor((position % 3600) / 60);
  const s = position % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function WatchHistoryList({
  items,
  onMarkWatched,
  onMarkUnwatched,
  onClearHistory,
}: WatchHistoryListProps) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [confirmClear, setConfirmClear] = useState<string | null>(null);

  const movies = useMemo(
    () => items.filter((i) => i.media_type === "movie"),
    [items]
  );

  const tvGroups = useMemo(() => {
    const tvItems = items.filter((i) => i.media_type === "tv");
    const groupMap = new Map<string, TVGroup>();

    for (const item of tvItems) {
      const existing = groupMap.get(item.title);
      if (existing) {
        existing.items.push(item);
        existing.totalWatchTime += item.total_watch_time_secs;
        if (
          item.last_watched &&
          (!existing.lastWatched || item.last_watched > existing.lastWatched)
        ) {
          existing.lastWatched = item.last_watched;
        }
      } else {
        groupMap.set(item.title, {
          title: item.title,
          items: [item],
          totalWatchTime: item.total_watch_time_secs,
          lastWatched: item.last_watched,
        });
      }
    }

    // Sort episodes within each group
    for (const group of groupMap.values()) {
      group.items.sort((a, b) => {
        const sa = a.season ?? 0;
        const sb = b.season ?? 0;
        if (sa !== sb) return sa - sb;
        return (a.episode ?? 0) - (b.episode ?? 0);
      });
    }

    return Array.from(groupMap.values()).sort((a, b) => {
      if (a.lastWatched && b.lastWatched) return b.lastWatched.localeCompare(a.lastWatched);
      if (a.lastWatched) return -1;
      if (b.lastWatched) return 1;
      return 0;
    });
  }, [items]);

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const handleClearClick = (mediaPath: string) => {
    if (confirmClear === mediaPath) {
      onClearHistory(mediaPath);
      setConfirmClear(null);
    } else {
      setConfirmClear(mediaPath);
    }
  };

  const showMovies = filter === "all" || filter === "movie";
  const showTV = filter === "all" || filter === "tv";

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12 text-center">
        <Clock className="h-10 w-10 text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-500">No watch history</p>
        <p className="mt-1 text-xs text-gray-400">
          Playback history will appear here once the player has been used.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        {(["all", "movie", "tv"] as FilterMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            className={clsx(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              filter === mode
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {mode === "all" ? "All" : mode === "movie" ? "Movies" : "TV Shows"}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Movies section */}
      {showMovies && movies.length > 0 && (
        <div>
          {filter === "all" && (
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Film className="h-4 w-4" />
              Movies
            </h3>
          )}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Title
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-24">
                    Resume At
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-24">
                    Watch Time
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-24">
                    Last Played
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-28">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {movies.map((item) => (
                  <MovieRow
                    key={item.media_path}
                    item={item}
                    onMarkWatched={onMarkWatched}
                    onMarkUnwatched={onMarkUnwatched}
                    onClearClick={handleClearClick}
                    confirmClear={confirmClear}
                    onCancelClear={() => setConfirmClear(null)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TV section */}
      {showTV && tvGroups.length > 0 && (
        <div>
          {filter === "all" && (
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Tv className="h-4 w-4" />
              TV Shows
            </h3>
          )}
          <div className="flex flex-col gap-3">
            {tvGroups.map((group) => (
              <TVGroupCard
                key={group.title}
                group={group}
                isExpanded={expandedGroups.has(group.title)}
                onToggle={() => toggleGroup(group.title)}
                onMarkWatched={onMarkWatched}
                onMarkUnwatched={onMarkUnwatched}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Movie row ────────────────────────────────────────────

function MovieRow({
  item,
  onMarkWatched,
  onMarkUnwatched,
  onClearClick,
  confirmClear,
  onCancelClear,
}: {
  item: WatchHistoryItem;
  onMarkWatched: (tagId: string) => void;
  onMarkUnwatched: (tagId: string) => void;
  onClearClick: (mediaPath: string) => void;
  confirmClear: string | null;
  onCancelClear: () => void;
}) {
  const isConfirming = confirmClear === item.media_path;

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900">{item.title}</p>
        <p className="text-xs text-gray-400">
          {item.play_count} {item.play_count === 1 ? "play" : "plays"}
        </p>
      </td>
      <td className="px-4 py-3 text-center">
        <WatchBadge watched={item.watched} />
      </td>
      <td className="px-4 py-3 text-right">
        {item.progress_seconds > 0 && !item.watched ? (
          <span className="inline-flex items-center gap-1 text-xs text-blue-600">
            <Play className="h-3 w-3" />
            {formatTimestamp(item.progress_seconds)}
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right text-sm text-gray-600">
        {formatDuration(item.total_watch_time_secs)}
      </td>
      <td className="px-4 py-3 text-right text-xs text-gray-500">
        {formatDate(item.last_watched)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {item.tag_id && (
            <button
              onClick={() =>
                item.watched
                  ? onMarkUnwatched(item.tag_id!)
                  : onMarkWatched(item.tag_id!)
              }
              className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title={item.watched ? "Mark unwatched" : "Mark watched"}
            >
              {item.watched ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          {isConfirming ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onClearClick(item.media_path)}
                className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100"
              >
                Confirm
              </button>
              <button
                onClick={onCancelClear}
                className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => onClearClick(item.media_path)}
              className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Clear history"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── TV group card ────────────────────────────────────────

function TVGroupCard({
  group,
  isExpanded,
  onToggle,
  onMarkWatched,
  onMarkUnwatched,
}: {
  group: TVGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onMarkWatched: (tagId: string, season?: number, episode?: number) => void;
  onMarkUnwatched: (tagId: string) => void;
}) {
  const watchedCount = group.items.filter((i) => i.watched).length;
  const currentItem = group.items.find(
    (i) => !i.watched && i.progress_seconds > 0
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Group header */}
      <button
        onClick={onToggle}
        className="flex items-center w-full gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {group.title}
          </p>
          <p className="text-xs text-gray-500">
            {watchedCount}/{group.items.length} episodes watched
            {" · "}
            {formatDuration(group.totalWatchTime)} total
            {currentItem && (
              <>
                {" · "}
                <span className="text-blue-600">
                  S{String(currentItem.season ?? 0).padStart(2, "0")}E
                  {String(currentItem.episode ?? 0).padStart(2, "0")} in
                  progress
                </span>
              </>
            )}
          </p>
        </div>
        <span className="text-xs text-gray-400 shrink-0">
          {formatDate(group.lastWatched)}
        </span>
      </button>

      {/* Episode list */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-24">
                  Episode
                </th>
                <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">
                  Status
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-24">
                  Resume At
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">
                  Plays
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {group.items.map((ep) => (
                <tr
                  key={ep.media_path}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2.5 text-sm text-gray-900">
                    S{String(ep.season ?? 0).padStart(2, "0")}E
                    {String(ep.episode ?? 0).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <WatchBadge watched={ep.watched} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {ep.progress_seconds > 0 && !ep.watched ? (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                        <Play className="h-3 w-3" />
                        {formatTimestamp(ep.progress_seconds)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm text-gray-500">
                    {ep.play_count}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {ep.tag_id && (
                      <button
                        onClick={() =>
                          ep.watched
                            ? onMarkUnwatched(ep.tag_id!)
                            : onMarkWatched(ep.tag_id!, ep.season ?? undefined, ep.episode ?? undefined)
                        }
                        className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title={ep.watched ? "Mark unwatched" : "Mark watched"}
                      >
                        {ep.watched ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
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

// ── Shared badge ─────────────────────────────────────────

function WatchBadge({ watched }: { watched: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        watched
          ? "bg-green-50 text-green-700"
          : "bg-gray-100 text-gray-500"
      )}
    >
      {watched ? (
        <>
          <Eye className="h-3 w-3" />
          Watched
        </>
      ) : (
        <>
          <EyeOff className="h-3 w-3" />
          Unwatched
        </>
      )}
    </span>
  );
}
