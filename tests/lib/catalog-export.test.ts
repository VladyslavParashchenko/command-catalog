import { describe, expect, it } from 'vitest';
import type { Category } from 'src/types/catalog';
import type { CatalogFile } from 'src/schemes/catalog-file';
import { catalogFileName, serializeCatalog } from 'src/lib/catalog-export';
import { categories } from 'tests/fixtures/catalog';

describe('serializeCatalog', () => {
  it('writes the format envelope', () => {
    const file: CatalogFile = JSON.parse(
      serializeCatalog(categories, new Date('2026-08-08T10:30:00.000Z')),
    );
    expect(file.format).toBe('command-catalog');
    expect(file.version).toBe(1);
    expect(file.exportedAt).toBe('2026-08-08T10:30:00.000Z');
  });

  it('omits record-only fields that the database rebuilds on import', () => {
    const withRecordFields = [
      { ...categories[0], order: 0, createdAt: 1, updatedAt: 2 },
    ] as unknown as Category[];
    const file = JSON.parse(serializeCatalog(withRecordFields));
    expect(Object.keys(file.categories[0])).toEqual(['id', 'name', 'commands']);
  });
});

describe('catalogFileName', () => {
  it('stamps the export date', () => {
    expect(catalogFileName(new Date('2026-08-08T10:30:00.000Z'))).toBe(
      'command-catalog-2026-08-08.json',
    );
  });
});
