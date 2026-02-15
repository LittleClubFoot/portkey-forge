import { invoke } from "@tauri-apps/api/core";

export async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    console.error(`Command ${command} failed:`, error);
    throw new Error(
      `Failed to execute ${command}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
