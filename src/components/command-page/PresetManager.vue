<script setup lang="ts">
import { ref, toRef } from 'vue';
import { Save } from 'lucide-vue-next';
import { usePresets } from 'src/composables/use-presets';
import type { PresetState, SavedPreset } from 'src/types/presets';

type PresetManagerProps = {
  commandId: string;
  getState: () => PresetState | undefined;
};
type PresetManagerEmits = {
  restore: [preset: SavedPreset];
};

const props = defineProps<PresetManagerProps>();
const emit = defineEmits<PresetManagerEmits>();
const { presets, savePreset } = usePresets(toRef(props, 'commandId'));
const selectedPresetId = ref('');
const isSaveOpen = ref(false);
const presetName = ref('');
const error = ref('');

function selectPreset() {
  const preset = presets.value.find((item) => item.id === selectedPresetId.value);
  if (preset) emit('restore', preset);
}
function openSave() {
  presetName.value = '';
  error.value = '';
  isSaveOpen.value = true;
}
function closeSave() {
  isSaveOpen.value = false;
  error.value = '';
}
async function submitSave() {
  const name = presetName.value.trim();
  const state = props.getState();
  if (!name) {
    error.value = 'Enter a name for this preset.';
    return;
  }
  if (!state) {
    error.value = 'The command form is not ready yet.';
    return;
  }
  try {
    await savePreset(name, state);
    closeSave();
  } catch {
    error.value = 'Unable to save this preset.';
  }
}
</script>

<template>
  <div class="flex shrink-0 items-center gap-2">
    <select
      v-model="selectedPresetId"
      aria-label="Select saved preset"
      class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 outline-none transition hover:border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      @change="selectPreset"
    >
      <option value="">Select preset</option>
      <option v-for="preset in presets" :key="preset.id" :value="preset.id">
        {{ preset.name }}
      </option>
    </select>
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
      @click="openSave"
    >
      <Save :size="16" /> Save
    </button>
  </div>

  <Teleport to="body">
    <div v-if="isSaveOpen" class="fixed inset-0 z-50 grid place-items-center p-4">
      <div class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" @click="closeSave"></div>
      <form
        class="relative z-10 grid w-full max-w-md gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        @submit.prevent="submitSave"
      >
        <div>
          <h2 class="text-xl font-semibold tracking-tight text-slate-900">Save preset</h2>
          <p class="mt-1 text-sm text-slate-500">Save the current input values for later.</p>
        </div>
        <label class="grid gap-2">
          <span class="text-sm font-semibold text-slate-700">Name</span>
          <input
            v-model="presetName"
            autofocus
            placeholder="e.g. Production build"
            class="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
        </label>
        <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            @click="closeSave"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200"
          >
            Save preset
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
