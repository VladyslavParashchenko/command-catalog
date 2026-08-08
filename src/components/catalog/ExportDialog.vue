<script setup lang="ts">
import { computed, ref } from 'vue';
import { Download } from 'lucide-vue-next';
import type { Category } from 'src/types/catalog';
import { catalogFileName, serializeCatalog } from 'src/lib/catalog-export';
import { summarizeCatalog } from 'src/lib/catalog-summary';
import Modal from 'src/components/ui/Modal.vue';

const props = defineProps<{ categories: Category[] }>();

const isOpen = ref(false);
const summary = computed(() => summarizeCatalog(props.categories));
const fileName = computed(() => catalogFileName());

function open() {
  isOpen.value = true;
}
function close() {
  isOpen.value = false;
}
function download() {
  const url = URL.createObjectURL(
    new Blob([serializeCatalog(props.categories)], { type: 'application/json' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = catalogFileName();
  link.click();
  URL.revokeObjectURL(url);
  close();
}

defineExpose({ open });
</script>

<template>
  <Modal
    :open="isOpen"
    label="Export catalog"
    title="Export catalog"
    description="Nothing on this device changes."
    @close="close"
  >
    <template #icon><Download :size="20" /></template>

    <div class="grid gap-4 px-6 py-5">
      <p class="text-base text-slate-700">
        Downloads your whole catalog as a JSON file — every category, command and parameter. Use it
        as a backup or to move the catalog to another browser or machine.
      </p>
      <p class="text-base text-slate-700">
        Saved presets are not included: they hold values you filled in on this device.
      </p>
      <dl class="grid gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200 sm:grid-cols-2">
        <div class="min-w-0">
          <dt class="text-xs font-bold uppercase tracking-wider text-slate-500">Contents</dt>
          <dd class="mt-1 font-semibold text-base text-slate-900">{{ summary }}</dd>
        </div>
        <div class="min-w-0">
          <dt class="text-xs font-bold uppercase tracking-wider text-slate-500">File</dt>
          <dd class="mt-1 truncate font-mono text-sm text-slate-900">{{ fileName }}</dd>
        </div>
      </dl>
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
        type="button"
        class="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-5 text-base font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200"
        @click="download"
      >
        <Download :size="18" /> Download
      </button>
    </template>
  </Modal>
</template>
