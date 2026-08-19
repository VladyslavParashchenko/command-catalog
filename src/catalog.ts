import { computed, ref } from 'vue';
import type { Category, Command } from 'src/types/catalog';
import { db } from 'src/data-layer/database';
import type { CategoryRecord, CommandRecord } from 'src/data-layer/types';
import type { CommandTreeCategory } from 'src/types/commands';

export const categories = ref<Category[]>([]);
export const catalogReady = ref(false);
let catalogInitialization: Promise<void> | undefined;
let catalogWriteQueue = Promise.resolve();
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

export function initializeCatalog() {
  if (catalogInitialization) return catalogInitialization;

  catalogInitialization = (async () => {
    const [categoryRecords, commandRecords] = await Promise.all([
      db.categories.toArray(),
      db.commands.toArray(),
    ]);
    categories.value = buildCatalog(categoryRecords, commandRecords);
    catalogReady.value = true;
  })();

  return catalogInitialization;
}

async function ensureCatalogInitialized() {
  await initializeCatalog();
}

export async function addCategory(name: string) {
  await ensureCatalogInitialized();
  const category: Category = { id: uniqueId(name, 'category'), name: name.trim(), commands: [] };
  categories.value = [...categories.value, category];
  await saveCategories();
  return category;
}

export async function addCommand(categoryId: string, command: Omit<Command, 'id'>) {
  await ensureCatalogInitialized();
  const category = categories.value.find((item) => item.id === categoryId);
  if (!category) throw new Error('Category not found');
  const created: Command = { ...command, id: uniqueId(command.name, 'command') };
  category.commands.push(created);
  categories.value = [...categories.value];
  await saveCategories();
  return created;
}

export async function renameCategory(categoryId: string, name: string) {
  await ensureCatalogInitialized();
  categories.value = categories.value.map((category) =>
    category.id === categoryId ? { ...category, name: name.trim() } : category,
  );
  await saveCategories();
}

export async function updateCommand(
  commandId: string,
  command: Omit<Command, 'id'>,
  categoryId: string,
) {
  await ensureCatalogInitialized();
  const target = categories.value.find((item) => item.id === categoryId);
  if (!target) throw new Error('Category not found');
  const source = categories.value.find((category) =>
    category.commands.some((item) => item.id === commandId),
  );
  if (!source) throw new Error('Command not found');
  const updated: Command = { ...command, id: commandId };
  categories.value = categories.value.map((category) => {
    const kept = category.commands.filter((item) => item.id !== commandId);
    if (category.id !== categoryId) return { ...category, commands: kept };
    const index = category.commands.findIndex((item) => item.id === commandId);
    if (index === -1) return { ...category, commands: [...kept, updated] };
    kept.splice(index, 0, updated);
    return { ...category, commands: kept };
  });
  await saveCategories();
  return updated;
}

export async function deleteCategory(categoryId: string) {
  await ensureCatalogInitialized();
  categories.value = categories.value.filter((category) => category.id !== categoryId);
  await saveCategories();
}

export async function deleteCommand(commandId: string) {
  await ensureCatalogInitialized();
  categories.value = categories.value.map((category) => ({
    ...category,
    commands: category.commands.filter((command) => command.id !== commandId),
  }));
  await saveCategories();
}

export async function replaceCatalog(items: Category[]) {
  await ensureCatalogInitialized();
  await saveCatalog(items);
  categories.value = items;
}

async function saveCategories() {
  await saveCatalog(categories.value);
}
async function saveCatalog(items: Category[]): Promise<void> {
  const write = catalogWriteQueue.then(async () => {
    const now = Date.now();
    await db.transaction('rw', db.categories, db.commands, async () => {
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

      const [storedCategories, storedCommands] = await Promise.all([
        db.categories.toArray(),
        db.commands.toArray(),
      ]);
      const categoryIds = new Set(categoryRecords.map(({ id }) => id));
      const commandIds = new Set(commandRecords.map(({ id }) => id));
      await db.categories.bulkDelete(
        storedCategories.filter(({ id }) => !categoryIds.has(id)).map(({ id }) => id),
      );
      await db.commands.bulkDelete(
        storedCommands.filter(({ id }) => !commandIds.has(id)).map(({ id }) => id),
      );
      await db.categories.bulkPut(categoryRecords);
      await db.commands.bulkPut(commandRecords);
    });
  });

  catalogWriteQueue = write.catch(() => undefined);
  await write;
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
