import { useState, useCallback } from "react";
import { Wifi, CheckCircle, AlertTriangle } from "lucide-react";
import { invokeCommand } from "../../utils/api";

type WriterStatus = "no_writer" | "ready" | "writing" | "success" | "error";

interface TagWriterProps {
  tagId: string | null;
}

const statusConfig: Record<
  WriterStatus,
  { label: string; color: string; bgColor: string }
> = {
  no_writer: {
    label: "No writer detected",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
  },
  ready: {
    label: "Ready",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  writing: {
    label: "Writing...",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  success: {
    label: "Success",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  error: {
    label: "Error",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
};

function StatusIcon({ status }: { status: WriterStatus }) {
  switch (status) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "error":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    default:
      return <Wifi className="h-5 w-5 text-gray-400" />;
  }
}

export default function TagWriter({ tagId }: TagWriterProps) {
  const [status, setStatus] = useState<WriterStatus>("no_writer");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleWrite = useCallback(async () => {
    if (!tagId) return;

    setStatus("writing");
    setErrorMessage(null);

    try {
      // Calls a Tauri command (not yet implemented) that communicates
      // with the RFID writer hardware over USB serial.
      await invokeCommand("write_tag", { tagId });
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setErrorMessage(
        e instanceof Error ? e.message : "Failed to write tag."
      );
    }
  }, [tagId]);

  const cfg = statusConfig[status];
  const canWrite = tagId !== null && status !== "writing" && status !== "no_writer";

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Wifi className="h-5 w-5 text-gray-700" />
        <h3 className="text-base font-semibold text-gray-900">
          RFID Tag Writer
        </h3>
      </div>

      {/* Status indicator */}
      <div
        className={`flex items-center gap-3 rounded-md px-4 py-3 ${cfg.bgColor}`}
      >
        <StatusIcon status={status} />
        <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
      </div>

      {/* Error message */}
      {status === "error" && errorMessage && (
        <div className="flex items-start gap-2 rounded-md bg-red-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Current tag ID */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Tag ID to Write
        </span>
        {tagId ? (
          <span className="rounded-md bg-gray-100 px-3 py-2 font-mono text-sm text-gray-900">
            {tagId}
          </span>
        ) : (
          <span className="text-sm italic text-gray-400">
            No tag ID selected
          </span>
        )}
      </div>

      {/* Write button */}
      <button
        onClick={handleWrite}
        disabled={!canWrite}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Wifi className="h-4 w-4" />
        {status === "writing" ? "Writing..." : "Write Tag"}
      </button>

      {/* Info text */}
      <p className="text-xs leading-relaxed text-gray-500">
        Writes the selected tag ID to a T5577 RFID card using the connected USB
        writer. Place a blank T5577 card on the writer before pressing
        &ldquo;Write Tag&rdquo;. The actual USB serial communication is handled
        by the Rust backend.
      </p>
    </div>
  );
}
