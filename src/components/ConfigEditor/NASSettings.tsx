import { useState, useEffect } from "react";
import { Server, Wifi, Eye, EyeOff } from "lucide-react";
import { useConfig } from "../../hooks/useConfig";
import type { NASConfig } from "../../types/config";

type ConnectionStatus = "idle" | "testing" | "success" | "error";

export default function NASSettings() {
  const { config, save, isSaving } = useConfig();

  const [host, setHost] = useState("");
  const [port, setPort] = useState(445);
  const [sharePath, setSharePath] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const [saved, setSaved] = useState(false);

  // Sync form state from config
  useEffect(() => {
    if (config?.nas) {
      const nas = config.nas;
      setHost(nas.host);
      setPort(nas.port);
      setSharePath(nas.share_path);
      setUsername(nas.username ?? "");
      setPassword(nas.password ?? "");
    }
  }, [config]);

  const handleTestConnection = async () => {
    setConnectionStatus("testing");
    // Simulated connection test
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (host.trim()) {
      setConnectionStatus("success");
    } else {
      setConnectionStatus("error");
    }
    setTimeout(() => setConnectionStatus("idle"), 3000);
  };

  const handleSave = async () => {
    if (!config) return;

    const nasConfig: NASConfig = {
      host: host.trim(),
      port,
      share_path: sharePath.trim(),
      username: username.trim() || undefined,
      password: password || undefined,
    };

    await save({ ...config, nas: nasConfig });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = async () => {
    if (!config) return;

    setHost("");
    setPort(445);
    setSharePath("");
    setUsername("");
    setPassword("");

    const { nas: _, ...rest } = config;
    await save({ ...rest, nas: undefined } as typeof config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-500">
        <p className="text-sm">No configuration loaded. Connect a device first.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
          <Server className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            NAS Connection
          </h2>
          <p className="text-sm text-gray-500">
            Configure network-attached storage for media access.
          </p>
        </div>
      </div>

      {/* Connection Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Wifi className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">
            Connection Details
          </h3>
        </div>

        {/* Host & Port */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label
              htmlFor="nas-host"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Host
            </label>
            <input
              id="nas-host"
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="192.168.1.100 or nas.local"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900
                         placeholder:text-gray-400
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="nas-port"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Port
            </label>
            <input
              id="nas-port"
              type="number"
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              min={1}
              max={65535}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Share Path */}
        <div>
          <label
            htmlFor="nas-share"
            className="block text-xs font-medium text-gray-500 mb-1"
          >
            Share Path
          </label>
          <input
            id="nas-share"
            type="text"
            value={sharePath}
            onChange={(e) => setSharePath(e.target.value)}
            placeholder="/media/videos"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900
                       placeholder:text-gray-400
                       focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Username */}
        <div>
          <label
            htmlFor="nas-username"
            className="block text-xs font-medium text-gray-500 mb-1"
          >
            Username (optional)
          </label>
          <input
            id="nas-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900
                       placeholder:text-gray-400
                       focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="nas-password"
            className="block text-xs font-medium text-gray-500 mb-1"
          >
            Password (optional)
          </label>
          <div className="relative">
            <input
              id="nas-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-900
                         placeholder:text-gray-400
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400
                         hover:text-gray-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Test Connection */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">
              Test Connection
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Verify that the NAS is reachable with the current settings.
            </p>
          </div>
          <button
            onClick={handleTestConnection}
            disabled={connectionStatus === "testing" || !host.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-gray-200 px-4 py-2 text-sm
                       font-medium text-gray-800 hover:bg-gray-300 active:bg-gray-400 transition-colors
                       disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Wifi className="h-4 w-4" />
            {connectionStatus === "testing" ? "Testing..." : "Test Connection"}
          </button>
        </div>
        {connectionStatus === "success" && (
          <p className="mt-3 text-sm text-green-600 font-medium">
            Connection successful!
          </p>
        )}
        {connectionStatus === "error" && (
          <p className="mt-3 text-sm text-red-600 font-medium">
            Connection failed. Please check the host and try again.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving || !host.trim()}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm
                     font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleClear}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-md bg-red-600 px-5 py-2.5 text-sm
                     font-medium text-white hover:bg-red-700 active:bg-red-800 transition-colors
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">
            Saved successfully!
          </span>
        )}
      </div>
    </div>
  );
}
