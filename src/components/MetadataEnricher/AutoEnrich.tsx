import { useState, useCallback } from "react";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useMetadata } from "../../hooks/useMetadata";
import type { MediaItem } from "../../types/media";

type ItemStatus = "pending" | "processing" | "success" | "failed";

interface AutoEnrichProps {
  items: MediaItem[];
}

function StatusIcon({ status }: { status: ItemStatus }) {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4 text-gray-400" />;
    case "processing":
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
}

function statusLabel(status: ItemStatus): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "success":
      return "Success";
    case "failed":
      return "Failed";
  }
}

export default function AutoEnrich({ items }: AutoEnrichProps) {
  const { autoEnrich } = useMetadata();
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({});
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchCurrent, setBatchCurrent] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);

  const enrichSingle = useCallback(
    async (item: MediaItem) => {
      setStatuses((prev) => ({ ...prev, [item.path]: "processing" }));
      try {
        await autoEnrich(item.path);
        setStatuses((prev) => ({ ...prev, [item.path]: "success" }));
      } catch {
        setStatuses((prev) => ({ ...prev, [item.path]: "failed" }));
      }
    },
    [autoEnrich]
  );

  const enrichAll = useCallback(async () => {
    setBatchRunning(true);
    setBatchCurrent(0);
    setBatchTotal(items.length);

    // Initialize all items as pending
    const initial: Record<string, ItemStatus> = {};
    for (const item of items) {
      initial[item.path] = "pending";
    }
    setStatuses(initial);

    for (let i = 0; i < items.length; i++) {
      setBatchCurrent(i + 1);
      setStatuses((prev) => ({ ...prev, [items[i].path]: "processing" }));
      try {
        await autoEnrich(items[i].path);
        setStatuses((prev) => ({ ...prev, [items[i].path]: "success" }));
      } catch {
        setStatuses((prev) => ({ ...prev, [items[i].path]: "failed" }));
      }
    }

    setBatchRunning(false);
  }, [items, autoEnrich]);

  const getStatus = (path: string): ItemStatus | null => {
    return statuses[path] ?? null;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Auto-Enrich Metadata
        </h3>
        <button
          onClick={enrichAll}
          disabled={batchRunning || items.length === 0}
          className={clsx(
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            batchRunning || items.length === 0
              ? "cursor-not-allowed bg-blue-300 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
          )}
        >
          {batchRunning && <Loader2 className="h-4 w-4 animate-spin" />}
          Auto-Enrich All
        </button>
      </div>

      {/* Batch progress */}
      {batchRunning && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Processing {batchCurrent} of {batchTotal}
            </span>
            <span className="font-medium">
              {Math.round((batchCurrent / batchTotal) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${(batchCurrent / batchTotal) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Items list */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm font-medium text-gray-500">
            No media items to enrich
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Add media to your library first.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {items.map((item) => {
              const status = getStatus(item.path);
              const isProcessing = status === "processing";

              return (
                <li
                  key={item.path}
                  className="flex items-center justify-between gap-4 bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {status ? (
                      <StatusIcon status={status} />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.filename}
                      </p>
                      {status && (
                        <p
                          className={clsx(
                            "text-xs",
                            status === "success" && "text-green-600",
                            status === "failed" && "text-red-600",
                            status === "processing" && "text-blue-600",
                            status === "pending" && "text-gray-400"
                          )}
                        >
                          {statusLabel(status)}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => enrichSingle(item)}
                    disabled={isProcessing || batchRunning}
                    className={clsx(
                      "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                      isProcessing || batchRunning
                        ? "cursor-not-allowed bg-gray-100 text-gray-400"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                    )}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Enrich"
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
