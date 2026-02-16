import { create } from "zustand";
import { MediaItem, MediaCategory } from "../types/media";
import { invokeCommand } from "../utils/api";

interface MediaState {
  mediaItems: MediaItem[];
  categories: string[];
  isLoading: boolean;
  error: string | null;

  scanMedia: () => Promise<void>;
  addMedia: (sourcePath: string, category: MediaCategory) => Promise<string>;
  removeMedia: (mediaPath: string) => Promise<void>;
  loadCategories: () => Promise<void>;
  clearError: () => void;
}

export const useMediaStore = create<MediaState>((set) => ({
  mediaItems: [],
  categories: [],
  isLoading: false,
  error: null,

  scanMedia: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await invokeCommand<MediaItem[]>("scan_media");
      set({ mediaItems: items, isLoading: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ isLoading: false, error: msg });
    }
  },

  addMedia: async (sourcePath: string, category: MediaCategory) => {
    const dest = await invokeCommand<string>("add_media", {
      sourcePath,
      category,
    });
    const items = await invokeCommand<MediaItem[]>("scan_media");
    set({ mediaItems: items });
    return dest;
  },

  removeMedia: async (mediaPath: string) => {
    await invokeCommand("remove_media", { mediaPath });
    const items = await invokeCommand<MediaItem[]>("scan_media");
    set({ mediaItems: items });
  },

  loadCategories: async () => {
    try {
      const categories = await invokeCommand<string[]>("get_media_categories");
      set({ categories });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ error: msg });
    }
  },

  clearError: () => set({ error: null }),
}));
