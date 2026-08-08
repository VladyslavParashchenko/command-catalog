import { onMounted, ref, watch, type Ref } from 'vue';
import { db } from 'src/data-layer/database';
import { findCategoryIdByCommand } from 'src/lib/command-tree';
import type { CommandTreeCategory } from 'src/types/commands';

export const expandedSettingKey = 'command-catalog:tree-expanded';

/**
 * Owns which categories are open in the tree and mirrors that set into
 * `db.settings`, so the sidebar reopens the way the user left it.
 */
export function useExpandedCategories(categories: Ref<CommandTreeCategory[]>) {
  const expanded = ref<Set<string>>(new Set());

  async function save(): Promise<void> {
    await db.settings.put({ key: expandedSettingKey, value: [...expanded.value] });
  }

  async function load(): Promise<Set<string>> {
    const record = await db.settings.get(expandedSettingKey);
    const value = record?.value;
    return new Set(
      Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [],
    );
  }

  /** Forgets ids of categories that no longer exist, e.g. after a catalog import. */
  function prune(): void {
    if (!categories.value.length) return;
    const existing = new Set(categories.value.map((category) => category.categoryId));
    const kept = new Set([...expanded.value].filter((id) => existing.has(id)));
    if (kept.size === expanded.value.size) return;
    expanded.value = kept;
    save();
  }

  function toggle(categoryId: string): void {
    const next = new Set(expanded.value);
    if (next.has(categoryId)) next.delete(categoryId);
    else next.add(categoryId);
    expanded.value = next;
    save();
  }

  /** Opens the category owning `commandId` so the command is visible. */
  function reveal(commandId: string): void {
    const categoryId = findCategoryIdByCommand(categories.value, commandId);
    if (!categoryId || expanded.value.has(categoryId)) return;
    expanded.value = new Set(expanded.value).add(categoryId);
    save();
  }

  watch(categories, prune);
  onMounted(async () => {
    expanded.value = await load();
    prune();
  });

  return { expanded, toggle, reveal };
}
