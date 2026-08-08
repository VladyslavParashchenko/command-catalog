import type { Category, Command } from 'src/types/catalog';
import { parseCommandBody } from 'src/schemes/command';
import { fail, isFilledString, isRecord } from 'src/schemes/parse';

export const catalogFileFormat = 'command-catalog';
export const catalogFileVersion = 1;

export type CatalogFile = {
  format: typeof catalogFileFormat;
  version: typeof catalogFileVersion;
  exportedAt: string;
  categories: Category[];
};

export function parseCatalogPayload(raw: unknown): Category[] {
  if (!isRecord(raw)) fail('The file must contain a JSON object.');
  if (raw.format !== catalogFileFormat) fail('This file is not a command catalog export.');
  if (raw.version !== catalogFileVersion)
    fail(`Unsupported export version ${JSON.stringify(raw.version)}.`);
  if (!Array.isArray(raw.categories)) fail('"categories" must be an array.');

  // Categories and commands share one id namespace, matching how routes and ids are generated.
  const seenIds = new Set<string>();
  return raw.categories.map((entry, index) => parseCategory(entry, index, seenIds));
}

function parseCategory(raw: unknown, index: number, seenIds: Set<string>): Category {
  const label = `Category #${index + 1}`;
  if (!isRecord(raw)) fail(`${label} must be an object.`);
  const id = takeId(raw.id, label, seenIds);
  if (!isFilledString(raw.name)) fail(`Category "${id}" is missing a valid "name".`);
  if (!Array.isArray(raw.commands)) fail(`Category "${id}" must have a "commands" array.`);

  return {
    id,
    name: raw.name,
    commands: raw.commands.map((entry, commandIndex) =>
      parseCommand(entry, id, commandIndex, seenIds),
    ),
  };
}

function parseCommand(
  raw: unknown,
  categoryId: string,
  index: number,
  seenIds: Set<string>,
): Command {
  const label = `Command #${index + 1} in category "${categoryId}"`;
  if (!isRecord(raw)) fail(`${label} must be an object.`);
  const id = takeId(raw.id, label, seenIds);
  return {
    id,
    ...parseCommandBody(raw, { subject: `Command "${id}"`, owner: `command "${id}"` }),
  };
}

function takeId(raw: unknown, label: string, seenIds: Set<string>): string {
  if (!isFilledString(raw)) fail(`${label} is missing a valid "id".`);
  if (seenIds.has(raw)) fail(`Duplicate id "${raw}" — every category and command needs its own.`);
  seenIds.add(raw);
  return raw;
}
