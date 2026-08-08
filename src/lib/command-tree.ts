import type { CommandTreeCategory, CommandTreeRow } from 'src/types/commands';

/**
 * Keeps only the commands matching `query` by name or description, and drops
 * the categories left without any. An empty query returns the input untouched.
 */
export function filterCategories(
  categories: CommandTreeCategory[],
  query: string,
): CommandTreeCategory[] {
  const needle = query.trim().toLocaleLowerCase();
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

/** Flattens the tree into the rows a user can actually focus, in visual order. */
export function flattenVisibleRows(
  categories: CommandTreeCategory[],
  expanded: ReadonlySet<string>,
): CommandTreeRow[] {
  return categories.flatMap((category) => [
    { id: category.categoryId, categoryId: category.categoryId, commandId: undefined },
    ...(expanded.has(category.categoryId)
      ? category.commands.map((command) => ({
          id: command.commandId,
          categoryId: category.categoryId,
          commandId: command.commandId,
        }))
      : []),
  ]);
}

export function findCategoryIdByCommand(
  categories: CommandTreeCategory[],
  commandId: string,
): string | undefined {
  return categories.find((category) =>
    category.commands.some((command) => command.commandId === commandId),
  )?.categoryId;
}
