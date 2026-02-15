import { create } from "zustand";
import { MediaItem, EnrichedMediaItem, MediaCategory, TMDBSearchResult, ParsedFilename } from "../types/media";
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

// Separate store for metadata operations to keep concerns separate
interface MetadataState {
  searchResults: TMDBSearchResult[];
  enrichedItems: Map<string, EnrichedMediaItem>;
  batchProgress: { current: number; total: number } | null;
  isSearching: boolean;
  isEnriching: boolean;
  error: string | null;

  parseFilename: (filename: string) => Promise<ParsedFilename>;
  searchTMDB: (query: string, year?: number, mediaType?: string) => Promise<void>;
  autoEnrich: (videoPath: string) => Promise<EnrichedMediaItem>;
  enrichWithSelection: (videoPath: string, tmdbId: number, mediaType: string) => Promise<EnrichedMediaItem>;
  batchEnrich: (videoPaths: string[]) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
}

export const useMetadataStore = create<MetadataState>((set, get) => ({
  searchResults: [],
  enrichedItems: new Map(),
  batchProgress: null,
  isSearching: false,
  isEnriching: false,
  error: null,

  parseFilename: async (filename: string) => {
    return await invokeCommand<ParsedFilename>("parse_filename", { filename });
  },

  searchTMDB: async (query: string, year?: number, mediaType?: string) => {
    set({ isSearching: true, error: null });
    try {
      const results = await invokeCommand<TMDBSearchResult[]>("search_tmdb", {
        query,
        year: year ?? null,
        mediaType: mediaType ?? "all",
      });
      set({ searchResults: results, isSearching: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ isSearching: false, error: msg });
    }
  },

  autoEnrich: async (videoPath: string) => {
    set({ isEnriching: true, error: null });
    try {
      const result = await invokeCommand<EnrichedMediaItem>("auto_enrich_video", {
        videoPath,
      });
      const enriched = new Map(get().enrichedItems);
      enriched.set(videoPath, result);
      set({ enrichedItems: enriched, isEnriching: false });
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ isEnriching: false, error: msg });
      throw e;
    }
  },

  enrichWithSelection: async (videoPath: string, tmdbId: number, mediaType: string) => {
    set({ isEnriching: true, error: null });
    try {
      const result = await invokeCommand<EnrichedMediaItem>("enrich_with_selection", {
        videoPath,
        tmdbId,
        mediaType,
      });
      const enriched = new Map(get().enrichedItems);
      enriched.set(videoPath, result);
      set({ enrichedItems: enriched, isEnriching: false });
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ isEnriching: false, error: msg });
      throw e;
    }
  },

  batchEnrich: async (videoPaths: string[]) => {
    set({ batchProgress: { current: 0, total: videoPaths.length }, isEnriching: true, error: null });
    try {
      const results = await invokeCommand<Array<EnrichedMediaItem | null>>("batch_enrich", {
        videoPaths,
      });
      const enriched = new Map(get().enrichedItems);
      results.forEach((result, idx) => {
        if (result) {
          enriched.set(videoPaths[idx], result);
        }
      });
      set({ enrichedItems: enriched, batchProgress: null, isEnriching: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ batchProgress: null, isEnriching: false, error: msg });
    }
  },

  clearResults: () => set({ searchResults: [] }),
  clearError: () => set({ error: null }),
}));
