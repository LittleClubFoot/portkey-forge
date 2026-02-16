import { useState } from "react";
import { Film, Plus, LayoutGrid, List } from "lucide-react";
import { useMedia } from "../hooks/useMedia";
import { useMetadataStore } from "../stores/metadataStore";
import { useDeviceStore } from "../stores/deviceStore";
import MediaGrid from "../components/MediaLibrary/MediaGrid";
import MediaDetails from "../components/MediaLibrary/MediaDetails";
import MediaUploader from "../components/MediaLibrary/MediaUploader";
import Modal from "../components/common/Modal";
import ErrorMessage from "../components/common/ErrorMessage";
import { MediaItem, MediaCategory } from "../types/media";

export default function MediaLibraryPage() {
  const { items, isLoading, error, scan, remove, clearError } = useMedia();
  const device = useDeviceStore((s) => s.connectedDevice);
  const enrichedItems = useMetadataStore((s) => s.enrichedItems);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showUploader, setShowUploader] = useState(false);

  if (!device) {
    return (
      <div className="text-center py-16">
        <Film size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="page-header">Vault</h2>
        <p className="text-gray-500">Link a Portkey Player to browse its vault.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="page-header mb-0">Vault</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:text-gray-600"}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg ${viewMode === "list" ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:text-gray-600"}`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setShowUploader(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Plus size={16} />
            Add Media
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={clearError} onRetry={scan} />}

      {isLoading ? (
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Scanning media files...</p>
        </div>
      ) : (
        <div className="flex gap-6">
          <div className={selectedItem ? "flex-1" : "w-full"}>
            <MediaGrid
              items={items}
              onSelect={setSelectedItem}
              selectedPath={selectedItem?.path ?? null}
              viewMode={viewMode}
              onRemove={(item) => remove(item.path)}
            />
          </div>
          {selectedItem && (
            <div className="w-96 shrink-0">
              <MediaDetails
                item={selectedItem}
                enrichedItem={enrichedItems.get(selectedItem.path) ?? null}
                onRemove={() => {
                  remove(selectedItem.path);
                  setSelectedItem(null);
                }}
              />
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={showUploader}
        onClose={() => setShowUploader(false)}
        title="Add Media"
        size="md"
      >
        <MediaUploader
          onUpload={(path: string, category: MediaCategory) => {
            setShowUploader(false);
          }}
        />
      </Modal>
    </div>
  );
}
