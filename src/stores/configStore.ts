import { create } from "zustand";
import { MediaConfig, AnalyticsData } from "../types/config";
import { invokeCommand } from "../utils/api";

interface ConfigState {
  config: MediaConfig | null;
  analytics: AnalyticsData | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadConfig: () => Promise<void>;
  saveConfig: (config: MediaConfig) => Promise<void>;
  loadAnalytics: () => Promise<void>;
  assignTag: (tagId: string, mediaPath: string) => Promise<void>;
  unassignTag: (tagId: string) => Promise<void>;
  getTagAssignments: () => Promise<Record<string, string>>;
  clearError: () => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: null,
  analytics: null,
  isLoading: false,
  isSaving: false,
  error: null,

  loadConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const config = await invokeCommand<MediaConfig>("load_config");
      set({ config, isLoading: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ isLoading: false, error: msg });
    }
  },

  saveConfig: async (config: MediaConfig) => {
    set({ isSaving: true, error: null });
    try {
      await invokeCommand("save_config", { config });
      set({ config, isSaving: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ isSaving: false, error: msg });
    }
  },

  loadAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const analytics = await invokeCommand<AnalyticsData>("get_analytics");
      set({ analytics, isLoading: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ isLoading: false, error: msg });
    }
  },

  assignTag: async (tagId: string, mediaPath: string) => {
    try {
      const config = await invokeCommand<MediaConfig>("assign_tag", {
        tagId,
        mediaPath,
      });
      set({ config });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ error: msg });
    }
  },

  unassignTag: async (tagId: string) => {
    try {
      const config = await invokeCommand<MediaConfig>("unassign_tag", {
        tagId,
      });
      set({ config });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ error: msg });
    }
  },

  getTagAssignments: async () => {
    return await invokeCommand<Record<string, string>>("get_tag_assignments");
  },

  clearError: () => set({ error: null }),
}));
