<script setup lang="ts">
import { computed, ref } from 'vue';
import { AlertTriangle, Upload } from 'lucide-vue-next';
import type { Category } from 'src/types/catalog';
import { parseCatalogFile } from 'src/lib/catalog-import';
import { summarizeCatalog } from 'src/lib/catalog-summary';
import Modal from 'src/components/ui/Modal.vue';

const props = defineProps<{ categories: Category[] }>();
const emit = defineEmits<{ replace: [categories: Category[]] }>();

const isOpen = ref(false);
const picker = ref<HTMLInputElement | null>(null);
const pending = ref<{ fileName: string; categories: Category[] } | null>(null);
const error = ref('');
// Counts nested dragenter/dragleave pairs so hovering a child element does not clear the highlight.
const dragDepth = ref(0);

const isDragging = computed(() => dragDepth.value > 0);
const current = computed(() => summarizeCatalog(props.categories));
const incoming = computed(() => (pending.value ? summarizeCatalog(pending.value.categories) : ''));

function open() {
  reset();
  isOpen.value = true;
}
function close() {
  isOpen.value = false;
  reset();
}
function reset() {
  pending.value = null;
  error.value = '';
  dragDepth.value = 0;
}

async function handleFile(file: File) {
  dragDepth.value = 0;
  const result = parseCatalogFile(await file.text());
  if (!result.ok) {
    pending.value = null;
    error.value = result.error;
    return;
  }
  error.value = '';
  pending.value = { fileName: file.name, categories: result.categories };
}

function onFileChosen(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  // Reset first, so picking the same file twice in a row still fires a change event.
  input.value = '';
  if (file) handleFile(file);
}
function onDrop(event: DragEvent) {
  const file = event.dataTransfer?.files?.[0];
  if (file) handleFile(file);
  else dragDepth.value = 0;
}

function confirmImport() {
  if (!pending.value) return;
  emit('replace', pending.value.categories);
  close();
}

defineExpose({ open });
</script>

<template>
  <Modal
    :open="isOpen"
    label="Import catalog"
    title="Import catalog"
    :description="pending ? 'Check what you are about to replace.' : 'This replaces everything.'"
    :tone="pending ? 'amber' : 'sky'"
    @close="close"
  >
    <template #icon>
      <AlertTriangle v-if="pending" :size="20" />
      <Upload v-else :size="20" />
    </template>

    <div v-if="!pending" class="grid gap-4 px-6 py-5">
      <p class="text-base text-slate-700">
        Importing a catalog file
        <strong class="font-bold text-slate-900">replaces</strong> every category and command on
        this device. There is no undo — export first if you want a backup.
      </p>

      <div
        :class="[
          'grid cursor-pointer place-items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition',
          isDragging
            ? 'border-sky-500 bg-sky-50'
            : 'border-slate-300 bg-slate-50 hover:border-sky-400 hover:bg-sky-50/40',
        ]"
        role="button"
        tabindex="0"
        aria-label="Choose a catalog file"
        @click="picker?.click()"
        @keydown.enter.prevent="picker?.click()"
        @keydown.space.prevent="picker?.click()"
        @dragenter.prevent="dragDepth++"
        @dragover.prevent
        @dragleave.prevent="dragDepth--"
        @drop.prevent="onDrop"
      >
        <Upload :size="26" class="text-slate-400" />
        <p class="text-base font-bold text-slate-800">Drop a catalog file here</p>
        <p class="text-sm font-medium text-slate-500">or click to choose a .json file</p>
      </div>

      <p
        v-if="error"
        class="rounded-xl bg-rose-50 px-4 py-3 text-base font-medium text-rose-800 ring-1 ring-rose-200"
      >
        {{ error }}
      </p>

      <input
        ref="picker"
        type="file"
        accept="application/json,.json"
        class="hidden"
        @change="onFileChosen"
      />
    </div>

    <div v-else class="grid gap-4 px-6 py-5">
      <p class="text-base text-slate-700">
        <span class="font-bold text-slate-900">{{ pending.fileName }}</span> is a valid catalog
        file. Applying it replaces your current catalog.
      </p>
      <dl class="grid gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200 sm:grid-cols-2">
        <div class="min-w-0">
          <dt class="text-xs font-bold uppercase tracking-wider text-slate-500">Now</dt>
          <dd class="mt-1 font-semibold text-base text-slate-900">{{ current }}</dd>
        </div>
        <div class="min-w-0">
          <dt class="text-xs font-bold uppercase tracking-wider text-slate-500">After import</dt>
          <dd class="mt-1 font-semibold text-base text-slate-900">{{ incoming }}</dd>
        </div>
      </dl>
      <button
        type="button"
        class="justify-self-start text-base font-semibold text-sky-700 underline-offset-2 hover:underline"
        @click="reset"
      >
        Choose another file
      </button>
    </div>

    <template #footer>
      <button
        type="button"
        class="h-11 rounded-xl border border-slate-300 px-5 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
        @click="close"
      >
        Cancel
      </button>
      <button
        v-if="pending"
        type="button"
        class="h-11 rounded-xl bg-rose-600 px-5 text-base font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-200"
        @click="confirmImport"
      >
        Replace catalog
      </button>
    </template>
  </Modal>
</template>
