import { useDevice } from "../../hooks/useDevice";
import { formatBytes } from "../../utils/formatters";
import { HardDrive, Database, Film, Usb, RefreshCw } from "lucide-react";

export default function DeviceInfo() {
  const { device, disconnect, eject, refresh } = useDevice();

  if (!device) {
    return null;
  }

  const usedBytes = device.total_space_bytes - device.available_space_bytes;
  const usagePercent =
    device.total_space_bytes > 0
      ? Math.round((usedBytes / device.total_space_bytes) * 100)
      : 0;

  return (
    <div className="w-full max-w-lg mx-auto rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <HardDrive className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {device.name}
            </h2>
            <p className="text-xs text-gray-500 truncate">{device.path}</p>
          </div>
        </div>
        <button
          onClick={refresh}
          className="flex-shrink-0 rounded-md p-2 text-gray-400 hover:bg-gray-100
                     hover:text-gray-600 transition-colors"
          aria-label="Refresh player info"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Storage Bar */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Storage</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all ${
              usagePercent > 90
                ? "bg-red-500"
                : usagePercent > 70
                  ? "bg-yellow-500"
                  : "bg-blue-600"
            }`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs text-gray-500">
          <span>
            {formatBytes(usedBytes)} used of {formatBytes(device.total_space_bytes)}
          </span>
          <span>{formatBytes(device.available_space_bytes)} free</span>
        </div>
      </div>

      {/* Video Count */}
      <div className="mb-6 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
        <Film className="h-5 w-5 text-gray-500" />
        <div>
          <p className="text-sm font-medium text-gray-800">
            {device.video_count} {device.video_count === 1 ? "video" : "videos"}
          </p>
          <p className="text-xs text-gray-500">Found on player</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={disconnect}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2
                     text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300
                     active:bg-gray-400 transition-colors"
        >
          Unlink
        </button>
        <button
          onClick={eject}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2
                     text-sm font-medium bg-blue-600 text-white hover:bg-blue-700
                     active:bg-blue-800 transition-colors"
        >
          <Usb className="h-4 w-4" />
          Release
        </button>
      </div>
    </div>
  );
}
