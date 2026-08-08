import Dexie, { type Table } from 'dexie';
import type { SavedPreset } from 'src/types/presets';
import type { CategoryRecord, CommandRecord, SettingRecord } from 'src/data-layer/types';

export const databaseName = 'command-catalog';

export class CommandCatalogDatabase extends Dexie {
  categories!: Table<CategoryRecord, string>;
  commands!: Table<CommandRecord, string>;
  presets!: Table<SavedPreset, string>;
  settings!: Table<SettingRecord, string>;

  constructor() {
    super(databaseName);
    this.version(1).stores({
      categories: 'id, order',
      commands: 'id, categoryId, [categoryId+order]',
      presets: 'id, commandId, [commandId+name], lastUsedAt',
      settings: 'key',
    });
  }
}

export const db = new CommandCatalogDatabase();
