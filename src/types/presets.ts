export type PresetValues = Record<string, string | number | boolean>;

export type SavedPreset = {
  id: string;
  commandId: string;
  name: string;
  values: PresetValues;
  enabled: Record<string, boolean>;
  createdAt: number;
  updatedAt: number;
  lastUsedAt?: number;
};

export type PresetState = Pick<SavedPreset, 'values' | 'enabled'>;
