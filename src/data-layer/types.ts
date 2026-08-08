import type { Command } from 'src/types/catalog';

export type CategoryRecord = {
  id: string;
  name: string;
  order: number;
  createdAt: number;
  updatedAt: number;
};

export type CommandRecord = Command & {
  categoryId: string;
  order: number;
  createdAt: number;
  updatedAt: number;
};

export type SettingRecord = {
  key: string;
  value: unknown;
};
