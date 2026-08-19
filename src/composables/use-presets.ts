import { ref, watch, type Ref } from 'vue';
import { db } from 'src/data-layer/database';
import type { PresetState, SavedPreset } from 'src/types/presets';

export function usePresets(commandId: Ref<string>) {
  const presets = ref<SavedPreset[]>([]);
  const isLoading = ref(false);
  let loadRequest = 0;

  async function loadPresets() {
    const request = ++loadRequest;
    const requestedCommandId = commandId.value;
    isLoading.value = true;
    try {
      const stored = await db.presets.where('commandId').equals(requestedCommandId).toArray();
      if (request === loadRequest && commandId.value === requestedCommandId) {
        presets.value = stored.sort((a, b) => b.createdAt - a.createdAt);
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function savePreset(name: string, state: PresetState): Promise<SavedPreset> {
    const timestamp = Date.now();
    const preset: SavedPreset = {
      id: `${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
      commandId: commandId.value,
      name,
      ...state,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await db.presets.put(preset);
    presets.value = [preset, ...presets.value];
    return preset;
  }

  watch(commandId, loadPresets, { immediate: true });

  return { presets, isLoading, loadPresets, savePreset };
}
