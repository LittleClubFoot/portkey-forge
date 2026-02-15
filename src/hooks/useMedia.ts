import { useEffect } from "react";
import { useMediaStore } from "../stores/mediaStore";
import { useDeviceStore } from "../stores/deviceStore";
import { MediaCategory } from "../types/media";

export function useMedia() {
  const store = useMediaStore();
  const device = useDeviceStore((s) => s.connectedDevice);

  useEffect(() => {
    if (device) {
      store.scanMedia();
      store.loadCategories();
    }
  }, [device?.path]);

  return {
    items: store.mediaItems,
    categories: store.categories,
    isLoading: store.isLoading,
    error: store.error,
    scan: store.scanMedia,
    add: (sourcePath: string, category: MediaCategory) =>
      store.addMedia(sourcePath, category),
    remove: store.removeMedia,
    clearError: store.clearError,
  };
}
