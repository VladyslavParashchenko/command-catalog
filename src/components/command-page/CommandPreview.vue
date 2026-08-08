<script setup lang="ts">
import { Check, Copy } from 'lucide-vue-next';

defineProps<{
  command: string;
  copied: boolean;
}>();

const emit = defineEmits<{ copy: [] }>();
</script>

<template>
  <div class="rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-lg shadow-slate-950/10">
    <div
      class="flex items-center gap-3 rounded-xl bg-slate-900/60 px-4 py-3 text-sm text-slate-100"
    >
      <code class="min-w-0 flex-1 break-words font-mono leading-6">{{ command }}</code>
      <button
        type="button"
        class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-300"
        :aria-label="copied ? 'Command copied' : 'Copy command'"
        @click="emit('copy')"
      >
        <Check v-if="copied" :size="16" />
        <Copy v-else :size="16" />
      </button>
    </div>
  </div>
</template>
