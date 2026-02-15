import { useState, useEffect, useMemo } from "react";
import { Tag, Link, Unlink } from "lucide-react";
import { useTags } from "../../hooks/useTags";
import { useConfig } from "../../hooks/useConfig";
import type { MediaEntry } from "../../types/config";

export default function TagAssignment() {
  const { tags, assign, unassign } = useTags();
  const { config } = useConfig();

  const [tagIdInput, setTagIdInput] = useState("");
  const [selectedMediaPath, setSelectedMediaPath] = useState<string | null>(
    null
  );
  const [isAssigning, setIsAssigning] = useState(false);

  // Build a lookup from tag ID to media entry for display purposes
  const assignedEntries = useMemo(() => {
    if (!config) return [];
    const entries: { tagId: string; media: MediaEntry }[] = [];
    for (const [tagId, mediaPath] of Object.entries(tags)) {
      const media = config.media.find((m) => m.path === mediaPath);
      if (media) {
        entries.push({ tagId, media });
      }
    }
    return entries;
  }, [tags, config]);

  // Media items that have no tag assigned
  const unassignedMedia = useMemo(() => {
    if (!config) return [];
    const assignedPaths = new Set(Object.values(tags));
    return config.media.filter((m) => !assignedPaths.has(m.path));
  }, [config, tags]);

  const handleAssign = async () => {
    if (!tagIdInput.trim() || !selectedMediaPath) return;
    setIsAssigning(true);
    try {
      await assign(tagIdInput.trim(), selectedMediaPath);
      setTagIdInput("");
      setSelectedMediaPath(null);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async (tagId: string) => {
    await unassign(tagId);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tag ID input */}
      <div className="flex items-center gap-3">
        <Tag className="h-5 w-5 text-gray-500 shrink-0" />
        <label
          htmlFor="tag-id-input"
          className="text-sm font-medium text-gray-700 shrink-0"
        >
          Tag ID
        </label>
        <input
          id="tag-id-input"
          type="text"
          value={tagIdInput}
          onChange={(e) => setTagIdInput(e.target.value)}
          placeholder="Enter or scan tag ID..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column: unassigned media */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Unassigned Media
          </h3>
          <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white">
            {unassignedMedia.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">
                All media items have been assigned to tags.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {unassignedMedia.map((media) => (
                  <li
                    key={media.path}
                    onClick={() => setSelectedMediaPath(media.path)}
                    className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
                      selectedMediaPath === media.path
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : "border-l-4 border-l-transparent"
                    }`}
                  >
                    {media.poster ? (
                      <img
                        src={media.poster}
                        alt={media.title}
                        className="h-10 w-7 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-10 w-7 items-center justify-center rounded bg-gray-100 shrink-0">
                        <Tag className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {media.title}
                      </p>
                      {media.year && (
                        <p className="text-xs text-gray-500">{media.year}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Assign button */}
          <button
            onClick={handleAssign}
            disabled={!tagIdInput.trim() || !selectedMediaPath || isAssigning}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Link className="h-4 w-4" />
            {isAssigning ? "Assigning..." : "Assign"}
          </button>
        </div>

        {/* Right column: assigned tags */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Assigned Tags
          </h3>
          <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white">
            {assignedEntries.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">
                No tags have been assigned yet.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {assignedEntries.map(({ tagId, media }) => (
                  <li
                    key={tagId}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <Tag className="h-4 w-4 text-blue-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {media.title}
                      </p>
                      <p className="text-xs font-mono text-gray-500">
                        {tagId}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnassign(tagId)}
                      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 active:bg-red-100"
                      title="Unassign tag"
                    >
                      <Unlink className="h-3.5 w-3.5" />
                      Unassign
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
