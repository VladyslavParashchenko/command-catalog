import type { Category } from 'src/types/catalog';

export const categories: Category[] = [
  {
    id: 'linux-common',
    name: 'Linux common',
    commands: [
      {
        id: 'zip',
        name: 'Zip',
        description: 'Create a ZIP archive.',
        template: 'zip {{recursive}} {{archive}}',
        options: {
          recursive: { key: '-r', type: 'boolean', optional: true, defaultValue: true },
          archive: { example: 'archive.zip', type: 'string', optional: false, restrictions: {} },
        },
      },
    ],
  },
];

export function catalogFileWith(overrides: Record<string, unknown>) {
  return JSON.stringify({
    format: 'command-catalog',
    version: 1,
    exportedAt: '2026-08-08T00:00:00.000Z',
    categories,
    ...overrides,
  });
}
