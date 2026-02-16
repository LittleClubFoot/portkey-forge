import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useMedia } from "../hooks/useMedia";
import { useMetadataStore } from "../stores/mediaStore";
import { useDeviceStore } from "../stores/deviceStore";
import AutoEnrich from "../components/MetadataEnricher/AutoEnrich";
import ManualSearch from "../components/MetadataEnricher/ManualSearch";
import ErrorMessage from "../components/common/ErrorMessage";

export default function MetadataPage() {
  const device = useDeviceStore((s) => s.connectedDevice);
  const { items } = useMedia();
  const enrichWithSelection = useMetadataStore((s) => s.enrichWithSelection);
  const error = useMetadataStore((s) => s.error);
  const clearError = useMetadataStore((s) => s.clearError);
  const [activeTab, setActiveTab] = useState<"auto" | "manual">("auto");
  const [selectedVideoPath, setSelectedVideoPath] = useState<string>("");

  if (!device) {
    return (
      <div className="text-center py-16">
        <Sparkles size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="page-header">Enchant</h2>
        <p className="text-gray-500">Link a Portkey Player to enchant media with metadata.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="page-header">Enchant</h2>

      {error && <ErrorMessage message={error} onDismiss={clearError} />}

      {/* Tab switcher */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("auto")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "auto"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Auto Enrich
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "manual"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Manual Search
        </button>
      </div>

      {activeTab === "auto" ? (
        <AutoEnrich items={items} />
      ) : (
        <div className="space-y-4">
          {/* Video selector */}
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select a video file
            </label>
            <select
              value={selectedVideoPath}
              onChange={(e) => setSelectedVideoPath(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a video...</option>
              {items.map((item) => (
                <option key={item.path} value={item.path}>
                  {item.filename}
                </option>
              ))}
            </select>
          </div>

          {selectedVideoPath && (
            <ManualSearch
              videoPath={selectedVideoPath}
              onSelect={(tmdbId, mediaType) => {
                enrichWithSelection(selectedVideoPath, tmdbId, mediaType);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
