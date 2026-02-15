import { useEffect } from "react";
import { useConfigStore } from "../stores/configStore";
import { useDeviceStore } from "../stores/deviceStore";

export function useConfig() {
  const store = useConfigStore();
  const device = useDeviceStore((s) => s.connectedDevice);

  useEffect(() => {
    if (device) {
      store.loadConfig();
    }
  }, [device?.path]);

  return {
    config: store.config,
    analytics: store.analytics,
    isLoading: store.isLoading,
    isSaving: store.isSaving,
    error: store.error,
    load: store.loadConfig,
    save: store.saveConfig,
    loadAnalytics: store.loadAnalytics,
    clearError: store.clearError,
  };
}
