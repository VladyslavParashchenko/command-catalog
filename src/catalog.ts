import { computed, ref } from 'vue';
import type { Category, Command } from 'src/types/catalog';
import { db } from 'src/data-layer/database';
import type { CategoryRecord, CommandRecord } from 'src/data-layer/types';
import type { CommandTreeCategory } from 'src/types/commands';

export const categories = ref<Category[]>([]);
export const catalogReady = ref(false);
export const commandRoutes = computed(() =>
  categories.value.flatMap((category) =>
    category.commands.map((command) => ({
      path: `/${category.id}/${command.id}`,
      definition: command,
    })),
  ),
);
export const commandRegistry = computed<Record<string, Command>>(() =>
  Object.fromEntries(commandRoutes.value.map(({ definition }) => [definition.id, definition])),
);
export const commandTree = computed<CommandTreeCategory[]>(() =>
  categories.value.map((category) => ({
    categoryId: category.id,
    title: category.name,
    commands: category.commands.map((command) => ({
      commandId: command.id,
      title: command.name,
      definition: command,
      path: `/${category.id}/${command.id}`,
    })),
  })),
);

export async function initializeCatalog() {
  let categoryRecords = await db.categories.toArray();
  let commandRecords = await db.commands.toArray();
  if (!categoryRecords.length && !commandRecords.length) {
    categoryRecords = await db.categories.toArray();
    commandRecords = await db.commands.toArray();
  }
  categories.value = buildCatalog(categoryRecords, commandRecords);
  catalogReady.value = true;
}

export async function addCategory(name: string) {
  const category: Category = { id: uniqueId(name, 'category'), name: name.trim(), commands: [] };
  categories.value = [...categories.value, category];
  await saveCategories();
  return category;
}

export async function addCommand(categoryId: string, command: Omit<Command, 'id'>) {
  const category = categories.value.find((item) => item.id === categoryId);
  if (!category) throw new Error('Category not found');
  const created: Command = { ...command, id: uniqueId(command.name, 'command') };
  category.commands.push(created);
  categories.value = [...categories.value];
  await saveCategories();
  return created;
}

export async function deleteCategory(categoryId: string) {
  categories.value = categories.value.filter((category) => category.id !== categoryId);
  await saveCategories();
}

export async function deleteCommand(commandId: string) {
  categories.value = categories.value.map((category) => ({
    ...category,
    commands: category.commands.filter((command) => command.id !== commandId),
  }));
  await saveCategories();
}

export async function replaceCatalog(items: Category[]) {
  await saveCatalog(items);
  categories.value = items;
}

async function saveCategories() {
  await saveCatalog(categories.value);
}
async function saveCatalog(items: Category[]): Promise<void> {
  const now = Date.now();
  await db.transaction('rw', db.categories, db.commands, async () => {
    await db.categories.clear();
    await db.commands.clear();

    const categoryRecords: CategoryRecord[] = [];
    const commandRecords: CommandRecord[] = [];
    items.forEach((category, categoryIndex) => {
      const timestamp = now + categoryIndex;
      categoryRecords.push({
        id: category.id,
        name: category.name,
        order: categoryIndex,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      category.commands.forEach((command, commandIndex) =>
        commandRecords.push({
          ...command,
          categoryId: category.id,
          order: commandIndex,
          createdAt: timestamp + commandIndex,
          updatedAt: timestamp + commandIndex,
        }),
      );
    });
    await db.categories.bulkPut(categoryRecords);
    await db.commands.bulkPut(commandRecords);
  });
}
function buildCatalog(
  categoryRecords: CategoryRecord[],
  commandRecords: CommandRecord[],
): Category[] {
  const commandsByCategory = new Map<string, Command[]>();
  commandRecords
    .sort((a, b) => a.order - b.order)
    .forEach((record) => {
      const commands = commandsByCategory.get(record.categoryId) ?? [];
      commands.push({
        id: record.id,
        name: record.name,
        description: record.description,
        template: record.template,
        options: record.options,
      });
      commandsByCategory.set(record.categoryId, commands);
    });
  return categoryRecords
    .sort((a, b) => a.order - b.order)
    .map(({ id, name }) => ({ id, name, commands: commandsByCategory.get(id) ?? [] }));
}
function uniqueId(name: string, fallback: string) {
  const base =
    name
      .trim()
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || fallback;
  const existing = new Set([
    ...categories.value.map((category) => category.id),
    ...categories.value.flatMap((category) => category.commands.map((command) => command.id)),
  ]);
  let id = base;
  let suffix = 2;
  while (existing.has(id)) id = `${base}-${suffix++}`;
  return id;
}
