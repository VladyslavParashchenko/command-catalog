<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue';
import { filterCategories, flattenVisibleRows } from 'src/lib/command-tree';
import { useExpandedCategories } from 'src/composables/use-expanded-categories';
import { useTreeKeyboardNavigation } from 'src/composables/use-tree-keyboard-navigation';
import type { CommandTreeCategory, DeleteTarget, EditTarget } from 'src/types/commands';
import CommandTreeToolbar from 'src/components/navigation/CommandTreeToolbar.vue';
import CommandTreeCategoryNode from 'src/components/navigation/CommandTreeCategory.vue';

const props = defineProps<{ categories: CommandTreeCategory[]; activeCommandId?: string }>();
const emit = defineEmits<{
  select: [id: string];
  close: [];
  createCategory: [];
  remove: [DeleteTarget];
  edit: [EditTarget];
}>();
const query = defineModel<string>({ default: '' });
const editMode = ref(false);
const tree = ref<HTMLElement>();

const { expanded, toggle, reveal } = useExpandedCategories(toRef(props, 'categories'));

const filtered = computed(() => filterCategories(props.categories, query.value));
/** While searching every matching category is forced open, without persisting it. */
const visibleExpanded = computed(() =>
  query.value.trim()
    ? new Set(filtered.value.map((category) => category.categoryId))
    : expanded.value,
);
const visibleRows = computed(() => flattenVisibleRows(filtered.value, visibleExpanded.value));

function select(commandId: string) {
  reveal(commandId);
  query.value = '';
  emit('select', commandId);
  emit('close');
}

const { onKeydown } = useTreeKeyboardNavigation({
  rows: visibleRows,
  container: tree,
  isExpanded: (categoryId) => visibleExpanded.value.has(categoryId),
  toggle,
  select,
});

watch(
  () => props.activeCommandId,
  (id) => {
    if (id) reveal(id);
  },
  { immediate: true },
);
</script>
<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <CommandTreeToolbar
      v-model="query"
      v-model:edit-mode="editMode"
      @create-category="emit('createCategory')"
    />
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
        @edit="emit('edit', $event)"
      />
      <p v-if="query.trim() && !filtered.length" class="px-3 py-3 text-sm text-indigo-200">
        No commands found.
      </p>
    </div>
  </div>
</template>
