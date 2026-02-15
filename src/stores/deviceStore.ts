import { create } from "zustand";
import { DeviceInfo } from "../types/device";
import { invokeCommand } from "../utils/api";

interface DeviceState {
  connectedDevice: DeviceInfo | null;
  availableDevices: string[];
  isScanning: boolean;
  error: string | null;

  detectDevices: () => Promise<string[]>;
  connectToDevice: (path: string) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  refreshDeviceInfo: () => Promise<void>;
  safeEject: () => Promise<void>;
  setTMDBApiKey: (key: string) => Promise<void>;
  clearError: () => void;
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  connectedDevice: null,
  availableDevices: [],
  isScanning: false,
  error: null,

  detectDevices: async () => {
    set({ isScanning: true, error: null });
    try {
      const devices = await invokeCommand<string[]>("detect_devices");
      set({ availableDevices: devices, isScanning: false });
      return devices;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ isScanning: false, error: msg });
      return [];
    }
  },

  connectToDevice: async (path: string) => {
    set({ error: null });
    try {
      const info = await invokeCommand<DeviceInfo>("connect_to_device", {
        devicePath: path,
      });
      set({ connectedDevice: info });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ error: msg });
    }
  },

  disconnectDevice: async () => {
    try {
      await invokeCommand("disconnect_device");
    } finally {
      set({ connectedDevice: null });
    }
  },

  refreshDeviceInfo: async () => {
    try {
      const info = await invokeCommand<DeviceInfo>("get_device_info");
      set({ connectedDevice: info });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ error: msg });
    }
  },

  safeEject: async () => {
    try {
      await invokeCommand("safe_eject_device");
      set({ connectedDevice: null });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ error: msg });
    }
  },

  setTMDBApiKey: async (key: string) => {
    await invokeCommand("set_tmdb_api_key", { apiKey: key });
  },

  clearError: () => set({ error: null }),
}));
