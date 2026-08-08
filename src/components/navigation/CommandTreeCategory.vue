<script setup lang="ts">
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Pencil,
  Terminal,
  X,
} from 'lucide-vue-next';
import type { CommandTreeCategory, DeleteTarget, EditTarget } from 'src/types/commands';

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

      <span v-if="editMode" class="ml-auto flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          class="rounded p-1 text-slate-400 transition hover:bg-sky-500/15 hover:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
          :aria-label="`Edit category ${category.title}`"
          @click.stop="emit('edit', { type: 'category', categoryId: category.categoryId })"
        >
          <Pencil :size="14" />
        </button>
        <button
          type="button"
          class="rounded p-1 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
          :aria-label="`Delete category ${category.title}`"
          @click.stop="emit('remove', { type: 'category', categoryId: category.categoryId })"
        >
          <X :size="15" />
        </button>
      </span>
    </div>

    <div
      v-if="expanded"
      role="group"
      class="ml-3.5 mt-1 border-l border-slate-700/60 pl-3 space-y-1"
    >
      <div
        v-for="command in category.commands"
        :key="command.commandId"
        role="treeitem"
        :data-tree-id="command.commandId"
        :aria-selected="activeCommandId === command.commandId"
        aria-level="2"
        tabindex="-1"
        :class="[
          'group relative flex min-h-[38px] items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-all cursor-pointer outline-none select-none focus-visible:ring-2 focus-visible:ring-sky-400',
          activeCommandId === command.commandId
            ? 'bg-sky-600 text-white font-medium shadow-md shadow-sky-500/25'
            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white',
        ]"
        :title="command.definition.description"
        @click="emit('select', command.commandId)"
      >
        <Terminal
          :size="15"
          :class="[
            'shrink-0 transition-colors',
            activeCommandId === command.commandId
              ? 'text-sky-100'
              : 'text-slate-400 group-hover:text-sky-400',
          ]"
        />
        <span class="truncate">{{ command.title }}</span>
        <span v-if="editMode" class="ml-auto flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            class="rounded p-1 text-slate-400 transition hover:bg-sky-500/15 hover:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
            :aria-label="`Edit command ${command.title}`"
            @click.stop="emit('edit', { type: 'command', commandId: command.commandId })"
          >
            <Pencil :size="14" />
          </button>
          <button
            type="button"
            class="rounded p-1 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
            :aria-label="`Delete command ${command.title}`"
            @click.stop="emit('remove', { type: 'command', commandId: command.commandId })"
          >
            <X :size="15" />
          </button>
        </span>
      </div>
    </div>
  </div>
</template>
