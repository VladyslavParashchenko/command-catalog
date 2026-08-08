import { nextTick, type Ref } from 'vue';
import type { CommandTreeRow } from 'src/types/commands';

type TreeKeyboardOptions = {
  /** Focusable rows in visual order. */
  rows: Ref<CommandTreeRow[]>;
  /** The element carrying `role="tree"`; rows are found inside it by `data-tree-id`. */
  container: Ref<HTMLElement | undefined>;
  isExpanded: (categoryId: string) => boolean;
  toggle: (categoryId: string) => void;
  select: (commandId: string) => void;
};

/** Arrow/Home/End/Enter handling for a `role="tree"`, per the ARIA tree view pattern. */
export function useTreeKeyboardNavigation(options: TreeKeyboardOptions) {
  const { rows, container, isExpanded, toggle, select } = options;

  function focusRow(id: string): void {
    container.value?.querySelector<HTMLElement>(`[data-tree-id="${id}"]`)?.focus();
  }

  function onKeydown(event: KeyboardEvent): void {
    const currentId = (document.activeElement as HTMLElement)?.dataset.treeId;
    if (!currentId) return;
    const list = rows.value;
    const index = list.findIndex((row) => row.id === currentId);
    const current = list[index];
    if (!current) return;
    let target = current;

    if (event.key === 'ArrowDown') target = list[Math.min(index + 1, list.length - 1)];
    if (event.key === 'ArrowUp') target = list[Math.max(index - 1, 0)];
    if (event.key === 'Home') target = list[0];
    if (event.key === 'End') target = list[list.length - 1];
    if (event.key === 'ArrowRight' && !current.commandId) {
      if (!isExpanded(current.categoryId)) toggle(current.categoryId);
      else target = list[index + 1] ?? current;
    }
    if (event.key === 'ArrowLeft') {
      if (current.commandId) target = list.find((row) => row.id === current.categoryId) ?? current;
      else if (isExpanded(current.categoryId)) toggle(current.categoryId);
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

  return { onKeydown, focusRow };
}
