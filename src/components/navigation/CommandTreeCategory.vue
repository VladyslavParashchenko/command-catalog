<script setup lang="ts">
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-vue-next';
import type { CommandTreeCategory, DeleteTarget, EditTarget } from 'src/types/commands';
import CommandTreeItem from 'src/components/navigation/CommandTreeItem.vue';
import TreeRowActions from 'src/components/navigation/TreeRowActions.vue';

defineProps<{
  category: CommandTreeCategory;
  expanded: boolean;
  activeCommandId?: string;
  editMode?: boolean;
}>();
const emit = defineEmits<{
  toggle: [id: string];
  select: [id: string];
  remove: [DeleteTarget];
  edit: [EditTarget];
}>();
</script>

<template>
  <div class="mb-1">
    <div
      role="treeitem"
      :data-tree-id="category.categoryId"
      :aria-expanded="expanded"
      aria-level="1"
      tabindex="-1"
      class="tree-row group font-semibold select-none"
      @click="emit('toggle', category.categoryId)"
    >
      <component
        :is="expanded ? ChevronDown : ChevronRight"
        :size="16"
        class="shrink-0 text-slate-400 transition-transform group-hover:text-slate-200"
      />
      <component
        :is="expanded ? FolderOpen : Folder"
        :size="18"
        class="shrink-0 text-sky-400 transition-colors group-hover:text-sky-300"
      />
      <span class="truncate text-slate-200 group-hover:text-white">{{ category.title }}</span>

      <span
        v-if="!editMode && category.commands.length"
        class="ml-auto shrink-0 rounded-full bg-slate-800/90 px-2 py-0.5 text-xs font-medium text-slate-400 border border-slate-700/50 group-hover:border-slate-600 group-hover:text-slate-300"
      >
        {{ category.commands.length }}
      </span>

      <TreeRowActions
        v-if="editMode"
        :edit-label="`Edit category ${category.title}`"
        :delete-label="`Delete category ${category.title}`"
        @edit="emit('edit', { type: 'category', categoryId: category.categoryId })"
        @remove="emit('remove', { type: 'category', categoryId: category.categoryId })"
      />
    </div>

    <div
      v-if="expanded"
      role="group"
      class="ml-3.5 mt-1 border-l border-slate-700/60 pl-3 space-y-1"
    >
      <CommandTreeItem
        v-for="command in category.commands"
        :key="command.commandId"
        :command="command"
        :active="activeCommandId === command.commandId"
        :edit-mode="editMode"
        @select="emit('select', $event)"
        @edit="emit('edit', { type: 'command', commandId: $event })"
        @remove="emit('remove', { type: 'command', commandId: $event })"
      />
    </div>
  </div>
</template>
