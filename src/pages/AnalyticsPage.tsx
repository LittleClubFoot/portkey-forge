import { useState, useEffect } from "react";
import { ScrollText } from "lucide-react";
import { useDeviceStore } from "../stores/deviceStore";
import { useWatchHistoryStore } from "../stores/watchHistoryStore";
import Dashboard from "../components/Analytics/Dashboard";
import WatchHistoryList from "../components/WatchHistory/WatchHistoryList";

export default function AnalyticsPage() {
  const device = useDeviceStore((s) => s.connectedDevice);
  const [activeTab, setActiveTab] = useState<"dashboard" | "history">("dashboard");

  const { items, isLoading, loadHistory, markWatched, markUnwatched, clearHistory } =
    useWatchHistoryStore();

  useEffect(() => {
    if (device && activeTab === "history") {
      loadHistory();
    }
  }, [device, activeTab, loadHistory]);

  if (!device) {
    return (
      <div className="text-center py-16">
        <ScrollText size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="page-header">Chronicle</h2>
        <p className="text-gray-500">Link a Portkey Player to view playback history.</p>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard" as const, label: "Dashboard" },
    { id: "history" as const, label: "Watch History" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="page-header">Chronicle</h2>

      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && <Dashboard />}
      {activeTab === "history" && (
        isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <WatchHistoryList
            items={items}
            onMarkWatched={markWatched}
            onMarkUnwatched={markUnwatched}
            onClearHistory={clearHistory}
          />
        )
      )}
    </div>
  );
}
