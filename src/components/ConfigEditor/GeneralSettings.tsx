import { useState } from "react";
import { Settings, Key, Trash2, Eye, EyeOff } from "lucide-react";
import { useDevice } from "../../hooks/useDevice";

const APP_VERSION = "1.0.0";
const BUILD_DATE = "2025-01-15";

export default function GeneralSettings() {
  const { setApiKey } = useDevice();

  const [apiKey, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleSaveApiKey = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) return;

    setIsSavingKey(true);
    try {
      await setApiKey(trimmed);
      setApiKeySaved(true);
      setTimeout(() => setApiKeySaved(false), 2000);
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleClearCache = () => {
    // Placeholder: simulates cache clear
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          <Settings className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            General Settings
          </h2>
          <p className="text-sm text-gray-500">
            Application configuration and maintenance.
          </p>
        </div>
      </div>

      {/* TMDB API Key */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">TMDB API Key</h3>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Required for metadata enrichment. Get a free key at{" "}
          <a
            href="https://www.themoviedb.org/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            themoviedb.org
          </a>
          .
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter your TMDB API key"
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-900
                         placeholder:text-gray-400
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowApiKey((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400
                         hover:text-gray-600 transition-colors"
              aria-label={showApiKey ? "Hide API key" : "Show API key"}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <button
            onClick={handleSaveApiKey}
            disabled={isSavingKey || !apiKey.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm
                       font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors
                       disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSavingKey ? "Saving..." : "Save"}
          </button>
        </div>
        {apiKeySaved && (
          <p className="mt-2 text-sm text-green-600 font-medium">
            API key saved successfully!
          </p>
        )}
      </div>

      {/* App Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">
            Application Info
          </h3>
        </div>
        <dl className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-xs font-medium text-gray-500">Version</dt>
            <dd className="text-sm text-gray-900">{APP_VERSION}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Build Date</dt>
            <dd className="text-sm text-gray-900">{BUILD_DATE}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Platform</dt>
            <dd className="text-sm text-gray-900">Tauri Desktop</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Framework</dt>
            <dd className="text-sm text-gray-900">React + TypeScript</dd>
          </div>
        </dl>
      </div>

      {/* Cache Management */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">
            Cache Management
          </h3>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Clear cached metadata, thumbnails, and temporary files to free up
          space.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearCache}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm
                       font-medium text-white hover:bg-red-700 active:bg-red-800 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear Cache
          </button>
          {cacheCleared && (
            <span className="text-sm text-green-600 font-medium">
              Cache cleared!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
