import { useMemo } from "react";
import { Trophy, Download } from "lucide-react";
import type { WatchCount } from "../../types/config";
import { formatMinutes } from "../../utils/formatters";

interface PlayHistoryProps {
  mostWatched: WatchCount[];
}

const RANK_COLORS: Record<number, string> = {
  1: "text-yellow-500", // gold
  2: "text-gray-400",   // silver
  3: "text-amber-700",  // bronze
};

const RANK_BG: Record<number, string> = {
  1: "bg-yellow-50",
  2: "bg-gray-50",
  3: "bg-amber-50",
};

export default function PlayHistory({ mostWatched }: PlayHistoryProps) {
  const sorted = useMemo(
    () =>
      [...mostWatched].sort((a, b) => b.count - a.count),
    [mostWatched]
  );

  const maxCount = useMemo(
    () => (sorted.length > 0 ? sorted[0].count : 1),
    [sorted]
  );

  const handleExportCsv = () => {
    const header = "Rank,Title,Watch Count,Total Minutes\n";
    const rows = sorted
      .map(
        (item, i) =>
          `${i + 1},"${item.title.replace(/"/g, '""')}",${item.count},${item.total_minutes}`
      )
      .join("\n");

    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "play_history.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center">
        <p className="text-sm text-gray-500">No play history data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">
            Most Watched
          </h3>
        </div>
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 rounded-md bg-gray-200 px-3 py-1.5 text-xs
                     font-medium text-gray-700 hover:bg-gray-300 active:bg-gray-400 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-16">
                Rank
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Title
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-28">
                Count
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-32">
                Total Time
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;
              const barWidth = Math.round((item.count / maxCount) * 100);

              return (
                <tr
                  key={item.title}
                  className={`border-b border-gray-50 ${
                    isTopThree ? RANK_BG[rank] ?? "" : ""
                  } hover:bg-gray-50 transition-colors`}
                >
                  {/* Rank */}
                  <td className="px-5 py-3">
                    <span
                      className={`text-sm font-bold ${
                        isTopThree
                          ? RANK_COLORS[rank] ?? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {isTopThree ? (
                        <span className="inline-flex items-center gap-1">
                          <Trophy className="h-3.5 w-3.5" />
                          {rank}
                        </span>
                      ) : (
                        rank
                      )}
                    </span>
                  </td>

                  {/* Title with bar indicator */}
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.title}
                      </p>
                      <div className="mt-1 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full transition-all ${
                            rank === 1
                              ? "bg-yellow-400"
                              : rank === 2
                                ? "bg-gray-400"
                                : rank === 3
                                  ? "bg-amber-600"
                                  : "bg-blue-400"
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Watch Count */}
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {item.count.toLocaleString()}
                    </span>
                  </td>

                  {/* Total Minutes */}
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm text-gray-600">
                      {formatMinutes(item.total_minutes)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
