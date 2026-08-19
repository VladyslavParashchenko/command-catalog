<script setup lang="ts">
import { Download, Upload } from 'lucide-vue-next';
import packageJson from '../../../package.json';

const emit = defineEmits<{ openExport: []; openImport: [] }>();
const version = packageJson.version;
</script>

<template>
  <div class="mt-3 border-t border-slate-800 pt-3">
    <div class="grid grid-cols-2 gap-1.5">
      <button
        type="button"
        class="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-sm font-medium text-slate-200 transition hover:border-sky-400 hover:text-white focus:outline-none focus:ring-4 focus:ring-sky-400/15"
        @click="emit('openExport')"
      >
        <Download :size="15" /> Export
      </button>
      <button
        type="button"
        class="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-sm font-medium text-slate-200 transition hover:border-sky-400 hover:text-white focus:outline-none focus:ring-4 focus:ring-sky-400/15"
        @click="emit('openImport')"
      >
        <Upload :size="15" /> Import
      </button>
    </div>
    <p class="mt-1 text-center text-[11px] leading-4 text-slate-500">v{{ version }}</p>
  </div>
</template>
