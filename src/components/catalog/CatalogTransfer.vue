<script setup lang="ts">
import { Download, Upload } from 'lucide-vue-next';

const emit = defineEmits<{ openExport: []; openImport: [] }>();
</script>

<template>
  <div class="mt-4 grid grid-cols-2 gap-2 border-t border-slate-800 pt-4">
    <button
      type="button"
      class="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 text-sm font-medium text-slate-200 transition hover:border-sky-400 hover:text-white focus:outline-none focus:ring-4 focus:ring-sky-400/15"
      @click="emit('openExport')"
    >
      <Download :size="16" /> Export
    </button>
    <button
      type="button"
      class="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 text-sm font-medium text-slate-200 transition hover:border-sky-400 hover:text-white focus:outline-none focus:ring-4 focus:ring-sky-400/15"
      @click="emit('openImport')"
    >
      <Upload :size="16" /> Import
    </button>
  </div>
</template>
