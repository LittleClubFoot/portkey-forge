import { create } from "zustand";
import { WatchHistoryItem } from "../types/watchHistory";
import { invokeCommand } from "../utils/api";

interface WatchHistoryState {
  items: WatchHistoryItem[];
  isLoading: boolean;
  error: string | null;

  loadHistory: () => Promise<void>;
  markWatched: (tagId: string, season?: number, episode?: number) => Promise<void>;
  markUnwatched: (tagId: string) => Promise<void>;
  updateResumePosition: (tagId: string, season: number, episode: number, positionSeconds: number) => Promise<void>;
  clearHistory: (mediaPath: string) => Promise<void>;
  clearError: () => void;
}

export const useWatchHistoryStore = create<WatchHistoryState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  loadHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await invokeCommand<WatchHistoryItem[]>("get_watch_history");
      set({ items, isLoading: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ isLoading: false, error: msg });
    }
  },

  markWatched: async (tagId, season, episode) => {
    try {
      await invokeCommand("mark_watched", {
        tagId,
        season: season ?? null,
        episode: episode ?? null,
      });
      await get().loadHistory();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ error: msg });
    }
  },

  markUnwatched: async (tagId) => {
    try {
      await invokeCommand("mark_unwatched", { tagId });
      await get().loadHistory();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ error: msg });
    }
  },

  updateResumePosition: async (tagId, season, episode, positionSeconds) => {
    try {
      await invokeCommand("update_resume_position", {
        tagId,
        season,
        episode,
        positionSeconds,
      });
      await get().loadHistory();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ error: msg });
    }
  },

  clearHistory: async (mediaPath) => {
    try {
      await invokeCommand("clear_watch_history", { mediaPath });
      await get().loadHistory();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ error: msg });
    }
  },

  clearError: () => set({ error: null }),
}));
