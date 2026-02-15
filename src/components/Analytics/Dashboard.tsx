import { BarChart3, Clock, Film, Activity } from "lucide-react";
import { useConfig } from "../../hooks/useConfig";
import { formatMinutes } from "../../utils/formatters";
import UsageCharts from "./UsageCharts";
import PlayHistory from "./PlayHistory";

export default function Dashboard() {
  const { analytics, isLoading, loadAnalytics } = useConfig();

  if (!analytics) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-12 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 mb-4">
            <BarChart3 className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Analytics
          </h2>
          <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
            Load analytics to view watch history, usage patterns, and content
            statistics.
          </p>
          <button
            onClick={loadAnalytics}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm
                       font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors
                       disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Activity className="h-4 w-4" />
            {isLoading ? "Loading..." : "Load Analytics"}
          </button>
        </div>
      </div>
    );
  }

  const uniqueContentCount = analytics.most_watched.length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
          <BarChart3 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Analytics Dashboard
          </h2>
          <p className="text-sm text-gray-500">
            Overview of viewing activity and usage patterns.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Watch Time */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
              <Clock className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">
                Total Watch Time
              </p>
              <p className="text-xl font-bold text-gray-900">
                {formatMinutes(analytics.total_watch_time_mins)}
              </p>
            </div>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <Activity className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">
                Total Sessions
              </p>
              <p className="text-xl font-bold text-gray-900">
                {analytics.total_sessions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Unique Content */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Film className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">
                Unique Content
              </p>
              <p className="text-xl font-bold text-gray-900">
                {uniqueContentCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <UsageCharts dailyUsage={analytics.daily_usage} />

      {/* Play History */}
      <PlayHistory mostWatched={analytics.most_watched} />
    </div>
  );
}
