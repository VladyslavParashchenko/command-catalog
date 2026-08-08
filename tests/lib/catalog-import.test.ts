import { describe, expect, it } from 'vitest';
import { serializeCatalog } from 'src/lib/catalog-export';
import { parseCatalogFile } from 'src/lib/catalog-import';
import { catalogFileWith, categories } from 'tests/fixtures/catalog';

function errorOf(text: string): string {
  const result = parseCatalogFile(text);
  if (result.ok) throw new Error('Expected the file to be rejected.');
  return result.error;
}

describe('parseCatalogFile', () => {
  it('round-trips an exported catalog unchanged', () => {
    expect(parseCatalogFile(serializeCatalog(categories))).toEqual({ ok: true, categories });
  });

  it('rejects text that is not JSON', () => {
    expect(errorOf('not json at all')).toBe('The file is not valid JSON.');
  });

  it('rejects JSON that is not an object', () => {
    expect(errorOf('[1, 2, 3]')).toBe('The file must contain a JSON object.');
  });

  it('rejects a foreign JSON file', () => {
    expect(errorOf(JSON.stringify({ name: 'package', version: '1.0.0' }))).toBe(
      'This file is not a command catalog export.',
    );
  });

  it('rejects an unsupported version', () => {
    expect(errorOf(catalogFileWith({ version: 2 }))).toBe('Unsupported export version 2.');
  });

  it('rejects a missing categories array', () => {
    expect(errorOf(catalogFileWith({ categories: {} }))).toBe('"categories" must be an array.');
  });

  it('rejects a category without an id', () => {
    expect(errorOf(catalogFileWith({ categories: [{ name: 'Docker', commands: [] }] }))).toBe(
      'Category #1 is missing a valid "id".',
    );
  });

  it('rejects ids duplicated across categories and commands', () => {
    expect(
      errorOf(catalogFileWith({ categories: [categories[0], { ...categories[0], commands: [] }] })),
    ).toBe('Duplicate id "linux-common" — every category and command needs its own.');
  });

  it('rejects a command without a template', () => {
    const broken = [
      { ...categories[0], commands: [{ ...categories[0].commands[0], template: '' }] },
    ];
    expect(errorOf(catalogFileWith({ categories: broken }))).toBe(
      'Command "zip" is missing a valid "template".',
    );
  });

  it('rejects an unknown parameter type', () => {
    const broken = [
      {
        ...categories[0],
        commands: [
          {
            ...categories[0].commands[0],
            options: { archive: { type: 'date', optional: false } },
          },
        ],
      },
    ];
    expect(errorOf(catalogFileWith({ categories: broken }))).toBe(
      'Parameter "archive" of command "zip" has an unknown type "date".',
    );
  });

  it('rejects a parameter without the optional flag', () => {
    const broken = [
      {
        ...categories[0],
        commands: [{ ...categories[0].commands[0], options: { archive: { type: 'string' } } }],
      },
    ];
    expect(errorOf(catalogFileWith({ categories: broken }))).toBe(
      'Parameter "archive" of command "zip" must have a boolean "optional".',
    );
  });

  it('rejects a non-numeric restriction', () => {
    const broken = [
      {
        ...categories[0],
        commands: [
          {
            ...categories[0].commands[0],
            options: {
              port: { type: 'number', optional: false, restrictions: { min: '1' } },
            },
          },
        ],
      },
    ];
    expect(errorOf(catalogFileWith({ categories: broken }))).toBe(
      'Parameter "port" of command "zip" has a non-numeric "min" restriction.',
    );
  });

  it('accepts a command with no description', () => {
    const withoutDescription = [
      {
        ...categories[0],
        commands: [{ ...categories[0].commands[0], description: undefined }],
      },
    ];
    const result = parseCatalogFile(catalogFileWith({ categories: withoutDescription }));
    expect(result.ok && result.categories[0].commands[0].description).toBe('');
  });

  it('accepts an empty catalog', () => {
    expect(parseCatalogFile(catalogFileWith({ categories: [] }))).toEqual({
      ok: true,
      categories: [],
    });
  });
});
