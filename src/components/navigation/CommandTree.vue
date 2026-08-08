<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { FolderPlus, Pencil } from 'lucide-vue-next';
import { db } from 'src/data-layer/database';
import type { CommandTreeCategory, DeleteTarget } from 'src/types/commands';
import Input from 'src/components/ui/Input.vue';
import CommandTreeCategoryNode from 'src/components/navigation/CommandTreeCategory.vue';

const props = defineProps<{ categories: CommandTreeCategory[]; activeCommandId?: string }>();
const emit = defineEmits<{
  select: [id: string];
  close: [];
  createCategory: [];
  remove: [DeleteTarget];
}>();
const query = defineModel<string>({ default: '' });
// Deliberately not persisted: leaving delete buttons armed across sessions invites accidents.
const editMode = ref(false);
const expanded = ref<Set<string>>(new Set());
const tree = ref<HTMLElement>();

const filtered = computed(() => filterCategories(props.categories, query.value));
const visibleExpanded = computed(() => {
  if (!query.value.trim()) return expanded.value;
  return new Set(filtered.value.map((category) => category.categoryId));
});
/** Rows in the order they are focusable, so keyboard navigation is a walk over one array. */
const visibleRows = computed(() =>
  filtered.value.flatMap((category) => [
    { id: category.categoryId, categoryId: category.categoryId, commandId: undefined },
    ...(visibleExpanded.value.has(category.categoryId)
      ? category.commands.map((command) => ({
          id: command.commandId,
          categoryId: category.categoryId,
          commandId: command.commandId,
        }))
      : []),
  ]),
);

async function loadExpanded(): Promise<Set<string>> {
  const record = await db.settings.get('command-catalog:tree-expanded');
  const value = record?.value;
  return new Set(
    Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [],
  );
}
async function saveExpanded(): Promise<void> {
  await db.settings.put({ key: 'command-catalog:tree-expanded', value: [...expanded.value] });
}
/**
 * Expanded ids are persisted per device, so an import leaves ids of categories that no longer
 * exist. Dropping them keeps the saved state in step with the catalog actually on screen.
 */
function pruneExpanded() {
  if (!props.categories.length) return;
  const existing = new Set(props.categories.map((category) => category.categoryId));
  const kept = new Set([...expanded.value].filter((id) => existing.has(id)));
  if (kept.size === expanded.value.size) return;
  expanded.value = kept;
  saveExpanded();
}
function toggle(categoryId: string) {
  const next = new Set(expanded.value);
  if (next.has(categoryId)) next.delete(categoryId);
  else next.add(categoryId);
  expanded.value = next;
  saveExpanded();
}
function reveal(commandId: string) {
  const owner = props.categories.find((category) =>
    category.commands.some((command) => command.commandId === commandId),
  );
  if (!owner || expanded.value.has(owner.categoryId)) return;
  expanded.value = new Set(expanded.value).add(owner.categoryId);
  saveExpanded();
}
function select(commandId: string) {
  reveal(commandId);
  query.value = '';
  emit('select', commandId);
  emit('close');
}
function filterCategories(categories: CommandTreeCategory[], value: string) {
  const needle = value.trim().toLocaleLowerCase();
  if (!needle) return categories;
  return categories
    .map((category) => ({
      ...category,
      commands: category.commands.filter((command) =>
        [command.definition.name, command.definition.description]
          .join(' ')
          .toLocaleLowerCase()
          .includes(needle),
      ),
    }))
    .filter((category) => category.commands.length);
}

watch(
  () => props.activeCommandId,
  (id) => {
    if (id) reveal(id);
  },
  { immediate: true },
);
// The catalog can be swapped wholesale by an import, not just grown by an edit.
watch(() => props.categories, pruneExpanded);
onMounted(async () => {
  expanded.value = await loadExpanded();
  pruneExpanded();
});

function focusRow(id: string) {
  tree.value?.querySelector<HTMLElement>(`[data-tree-id="${id}"]`)?.focus();
}
function onKeydown(event: KeyboardEvent) {
  const currentId = (document.activeElement as HTMLElement)?.dataset.treeId;
  if (!currentId) return;
  const rows = visibleRows.value;
  const index = rows.findIndex((row) => row.id === currentId);
  const current = rows[index];
  if (!current) return;
  let target = rows[index];

  if (event.key === 'ArrowDown') target = rows[Math.min(index + 1, rows.length - 1)];
  if (event.key === 'ArrowUp') target = rows[Math.max(index - 1, 0)];
  if (event.key === 'Home') target = rows[0];
  if (event.key === 'End') target = rows[rows.length - 1];
  if (event.key === 'ArrowRight' && !current.commandId) {
    if (!visibleExpanded.value.has(current.categoryId)) toggle(current.categoryId);
    else target = rows[index + 1] ?? current;
  }
  if (event.key === 'ArrowLeft') {
    if (current.commandId) target = rows.find((row) => row.id === current.categoryId) ?? current;
    else if (visibleExpanded.value.has(current.categoryId)) toggle(current.categoryId);
  }
  if (event.key === 'Enter' || event.key === ' ') {
    if (current.commandId) select(current.commandId);
    else toggle(current.categoryId);
  }
  if (target !== current) {
    event.preventDefault();
    nextTick(() => focusRow(target.id));
  }
}
</script>
<template>
  <div class="flex min-h-0 flex-1 flex-col">
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
        :class="[
          'grid h-12 w-12 shrink-0 place-items-center rounded-xl border shadow-sm transition focus:outline-none focus:ring-4 focus:ring-sky-400/15',
          editMode
            ? 'border-rose-400 bg-rose-500/15 text-rose-300'
            : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-sky-400 hover:text-white',
        ]"
        :aria-pressed="editMode"
        :aria-label="editMode ? 'Leave edit mode' : 'Edit catalog'"
        :title="editMode ? 'Leave edit mode' : 'Edit catalog'"
        @click="editMode = !editMode"
      >
        <Pencil :size="18" />
      </button>
    </div>
    <div
      ref="tree"
      role="tree"
      aria-label="Commands"
      class="mt-5 min-h-0 overflow-y-auto pr-1"
      tabindex="0"
      @keydown="onKeydown"
    >
      <CommandTreeCategoryNode
        v-for="category in filtered"
        :key="category.categoryId"
        :category="category"
        :expanded="visibleExpanded.has(category.categoryId)"
        :active-command-id="activeCommandId"
        :edit-mode="editMode"
        @toggle="toggle"
        @select="select"
        @remove="emit('remove', $event)"
      />
      <p v-if="query.trim() && !filtered.length" class="px-3 py-3 text-sm text-indigo-200">
        No commands found.
      </p>
    </div>
  </div>
</template>
