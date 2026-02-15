import { useEffect, useCallback } from "react";
import { useDeviceStore } from "../stores/deviceStore";

export function useDevice() {
  const store = useDeviceStore();

  const pollDevices = useCallback(async () => {
    await store.detectDevices();
  }, [store.detectDevices]);

  // Poll for devices on mount if not connected
  useEffect(() => {
    if (!store.connectedDevice) {
      pollDevices();
      const interval = setInterval(pollDevices, 5000);
      return () => clearInterval(interval);
    }
  }, [store.connectedDevice, pollDevices]);

  return {
    device: store.connectedDevice,
    availableDevices: store.availableDevices,
    isScanning: store.isScanning,
    error: store.error,
    connect: store.connectToDevice,
    disconnect: store.disconnectDevice,
    refresh: store.refreshDeviceInfo,
    eject: store.safeEject,
    setApiKey: store.setTMDBApiKey,
    clearError: store.clearError,
    rescan: pollDevices,
  };
}
