<script setup lang="ts">
import { computed } from 'vue';
import { Terminal } from 'lucide-vue-next';
import type { CommandTreeCommand } from 'src/types/commands';
import TreeRowActions from 'src/components/navigation/TreeRowActions.vue';

const props = defineProps<{
  command: CommandTreeCommand;
  active?: boolean;
  editMode?: boolean;
}>();
const emit = defineEmits<{ select: [id: string]; remove: [id: string]; edit: [id: string] }>();

const rowClass = computed(() => [
  'group relative flex min-h-[38px] items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-all cursor-pointer outline-none select-none focus-visible:ring-2 focus-visible:ring-sky-400',
  props.active
    ? 'bg-sky-600 text-white font-medium shadow-md shadow-sky-500/25'
    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white',
]);
const iconClass = computed(() => [
  'shrink-0 transition-colors',
  props.active ? 'text-sky-100' : 'text-slate-400 group-hover:text-sky-400',
]);
</script>

<template>
  <div
    role="treeitem"
    :data-tree-id="command.commandId"
    :aria-selected="active"
    aria-level="2"
    tabindex="-1"
    :class="rowClass"
    :title="command.definition.description"
    @click="emit('select', command.commandId)"
  >
    <Terminal :size="15" :class="iconClass" />
    <span class="truncate">{{ command.title }}</span>
    <TreeRowActions
      v-if="editMode"
      :edit-label="`Edit command ${command.title}`"
      :delete-label="`Delete command ${command.title}`"
      @edit="emit('edit', command.commandId)"
      @remove="emit('remove', command.commandId)"
    />
  </div>
</template>
