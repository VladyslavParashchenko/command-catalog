import type { Category } from 'src/types/catalog';
import { parseCatalogPayload } from 'src/schemes/catalog-file';
import { toResult } from 'src/schemes/parse';

export type CatalogImportResult =
  { ok: true; categories: Category[] } | { ok: false; error: string };

export function parseCatalogFile(text: string): CatalogImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'The file is not valid JSON.' };
  }

  const result = toResult(() => parseCatalogPayload(raw));
  return result.ok ? { ok: true, categories: result.value } : result;
}
