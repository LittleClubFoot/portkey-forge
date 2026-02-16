import { useDevice } from "../../hooks/useDevice";
import { RefreshCw, Usb, Search } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";

export default function DeviceList() {
  const { availableDevices, isScanning, connect, rescan, error } = useDevice();

  return (
    <div className="w-full max-w-lg mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-500" />
          Discovered Players
        </h2>
        <button
          onClick={rescan}
          disabled={isScanning}
          className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium
                     bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400
                     transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isScanning ? "animate-spin" : ""}`} />
          Rescan
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isScanning ? (
        <div className="py-12">
          <LoadingSpinner size="md" message="Scanning for players..." />
        </div>
      ) : availableDevices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Usb className="h-10 w-10 mb-3" />
          <p className="text-sm font-medium text-gray-600 mb-1">No players found</p>
          <p className="text-xs text-gray-400 text-center max-w-xs">
            Connect a Portkey Player via USB and click Rescan to discover it.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {availableDevices.map((devicePath) => (
            <li
              key={devicePath}
              className="flex items-center justify-between rounded-lg border border-gray-200
                         bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow-md
                         transition-all cursor-pointer"
              onClick={() => connect(devicePath)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  connect(devicePath);
                }
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Usb className="h-5 w-5 flex-shrink-0 text-gray-500" />
                <span className="text-sm font-medium text-gray-800 truncate">
                  {devicePath}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  connect(devicePath);
                }}
                className="ml-4 flex-shrink-0 inline-flex items-center rounded-md px-3 py-1.5
                           text-sm font-medium bg-blue-600 text-white hover:bg-blue-700
                           active:bg-blue-800 transition-colors"
              >
                Link
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
