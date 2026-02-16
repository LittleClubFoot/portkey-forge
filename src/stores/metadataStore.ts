import { create } from "zustand";
import { EnrichedMediaItem, TMDBSearchResult, ParsedFilename } from "../types/media";
import { invokeCommand } from "../utils/api";

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
