import { useState, useCallback } from "react";
import { FolderOpen, Upload, CheckCircle, AlertCircle } from "lucide-react";
import clsx from "clsx";
import type { MediaCategory } from "../../types/media";

interface MediaUploaderProps {
  onUpload: (path: string, category: MediaCategory) => void;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

const categoryOptions: { value: MediaCategory; label: string }[] = [
  { value: "movies", label: "Movies" },
  { value: "shows", label: "TV Shows" },
  { value: "music", label: "Music" },
  { value: "other", label: "Other" },
];

export default function MediaUploader({ onUpload }: MediaUploaderProps) {
  const [filePath, setFilePath] = useState("");
  const [category, setCategory] = useState<MediaCategory>("movies");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChooseFile = useCallback(async () => {
    try {
      // Attempt to use Tauri dialog for file selection
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Media Files",
            extensions: [
              "mp4",
              "mkv",
              "avi",
              "mov",
              "wmv",
              "flv",
              "webm",
              "m4v",
              "mp3",
              "flac",
              "wav",
              "aac",
              "ogg",
            ],
          },
          {
            name: "All Files",
            extensions: ["*"],
          },
        ],
      });

      if (selected) {
        const selectedPath =
          typeof selected === "string"
            ? selected
            : (selected as { path: string }).path;
        setFilePath(selectedPath);
        setStatus("idle");
        setErrorMessage("");
      }
    } catch {
      // Tauri dialog not available -- path input is shown as fallback
    }
  }, []);

  const handleSubmit = async () => {
    const trimmedPath = filePath.trim();
    if (!trimmedPath) {
      setStatus("error");
      setErrorMessage("Please provide a file path.");
      return;
    }

    setStatus("uploading");
    setErrorMessage("");

    try {
      await onUpload(trimmedPath, category);
      setStatus("success");
      setFilePath("");
      // Reset success message after a short delay
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to add media file."
      );
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-gray-900">
        Add Media
      </h3>

      <div className="flex flex-col gap-4">
        {/* Category selector */}
        <div>
          <label
            htmlFor="media-category"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="media-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as MediaCategory)}
            className={clsx(
              "w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm",
              "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
              "transition-colors"
            )}
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* File path input with choose button */}
        <div>
          <label
            htmlFor="media-path"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            File Path
          </label>
          <div className="flex gap-2">
            <input
              id="media-path"
              type="text"
              value={filePath}
              onChange={(e) => {
                setFilePath(e.target.value);
                if (status === "error") {
                  setStatus("idle");
                  setErrorMessage("");
                }
              }}
              placeholder="/path/to/media/file.mkv"
              className={clsx(
                "flex-1 rounded-md border bg-white py-2 px-3 text-sm",
                "placeholder:text-gray-400",
                "focus:outline-none focus:ring-1 transition-colors",
                status === "error"
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              )}
            />
            <button
              onClick={handleChooseFile}
              type="button"
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700",
                "hover:bg-gray-50 active:bg-gray-100 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              )}
            >
              <FolderOpen className="h-4 w-4" />
              Choose File
            </button>
          </div>
        </div>

        {/* Upload progress / status */}
        {status === "uploading" && (
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full animate-pulse rounded-full bg-blue-500" style={{ width: "60%" }} />
            </div>
            <span className="text-xs text-gray-500">Adding...</span>
          </div>
        )}

        {/* Success feedback */}
        {status === "success" && (
          <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-700">
              Media added successfully!
            </span>
          </div>
        )}

        {/* Error feedback */}
        {status === "error" && errorMessage && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{errorMessage}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={status === "uploading"}
          className={clsx(
            "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            status === "uploading"
              ? "cursor-not-allowed bg-blue-400 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
          )}
        >
          {status === "uploading" ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Adding...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Add to Library
            </>
          )}
        </button>
      </div>
    </div>
  );
}
