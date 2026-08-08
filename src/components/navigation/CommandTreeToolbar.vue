<script setup lang="ts">
import { computed } from 'vue';
import { FolderPlus, Pencil } from 'lucide-vue-next';
import Input from 'src/components/ui/Input.vue';

const query = defineModel<string>({ default: '' });
const editMode = defineModel<boolean>('editMode', { default: false });
const emit = defineEmits<{ createCategory: [] }>();

const editModeLabel = computed(() => (editMode.value ? 'Leave edit mode' : 'Edit catalog'));
const editModeClass = computed(() => [
  'grid h-12 w-12 shrink-0 place-items-center rounded-xl border shadow-sm transition focus:outline-none focus:ring-4 focus:ring-sky-400/15',
  editMode.value
    ? 'border-rose-400 bg-rose-500/15 text-rose-300'
    : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-sky-400 hover:text-white',
]);
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="min-w-0 flex-1">
      <Input v-model="query" placeholder="Search commands…" aria-label="Search commands" />
    </div>
    <button
      type="button"
      class="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 shadow-sm transition hover:border-sky-400 hover:text-white focus:outline-none focus:ring-4 focus:ring-sky-400/15"
      aria-label="New category"
      title="New category"
      @click="emit('createCategory')"
    >
      <FolderPlus :size="20" />
    </button>
    <button
      type="button"
      :class="editModeClass"
      :aria-pressed="editMode"
      :aria-label="editModeLabel"
      :title="editModeLabel"
      @click="editMode = !editMode"
    >
      <Pencil :size="18" />
    </button>
  </div>
</template>
