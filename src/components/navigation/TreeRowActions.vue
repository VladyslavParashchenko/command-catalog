<script setup lang="ts">
import { Pencil, X } from 'lucide-vue-next';

defineProps<{ editLabel: string; deleteLabel: string }>();
const emit = defineEmits<{ edit: []; remove: [] }>();
</script>

<template>
  <span class="ml-auto flex shrink-0 items-center gap-0.5">
    <button
      type="button"
      class="rounded p-1 text-slate-400 transition hover:bg-sky-500/15 hover:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
      :aria-label="editLabel"
      @click.stop="emit('edit')"
    >
      <Pencil :size="14" />
    </button>
    <button
      type="button"
      class="rounded p-1 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
      :aria-label="deleteLabel"
      @click.stop="emit('remove')"
    >
      <X :size="15" />
    </button>
  </span>
</template>
