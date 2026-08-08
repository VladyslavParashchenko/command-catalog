import type { Category } from 'src/types/catalog';

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

export function summarizeCatalog(categories: Category[]) {
  const commands = categories.reduce((total, category) => total + category.commands.length, 0);
  return `${plural(categories.length, 'category', 'categories')} / ${plural(commands, 'command', 'commands')}`;
}
