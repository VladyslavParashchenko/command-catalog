import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('src/data-layer/database', () => {
  const table = () => ({
    clear: vi.fn(async () => undefined),
    bulkPut: vi.fn(async () => undefined),
    toArray: vi.fn(async () => []),
    get: vi.fn(async () => undefined),
    put: vi.fn(async () => undefined),
  });
  return {
    db: {
      categories: table(),
      commands: table(),
      presets: table(),
      settings: table(),
      transaction: vi.fn(async (_mode, ...rest) => {
        const work = rest[rest.length - 1] as () => Promise<void>;
        await work();
      }),
    },
  };
});

const { categories, commandTree, replaceCatalog } = await import('src/catalog');

const imported = [
  {
    id: 'docker',
    name: 'Docker',
    commands: [
      {
        id: 'build-image',
        name: 'Build image',
        description: '',
        template: 'docker build {{path}}',
        options: { path: { type: 'string' as const, optional: false } },
      },
    ],
  },
];

describe('replaceCatalog', () => {
  beforeEach(() => {
    categories.value = [{ id: 'old', name: 'Old', commands: [] }];
  });

  it('swaps the catalog', async () => {
    await replaceCatalog(imported);
    expect(categories.value).toEqual(imported);
  });

  it('rebuilds the navigation tree the sidebar renders', async () => {
    await replaceCatalog(imported);
    expect(commandTree.value).toEqual([
      expect.objectContaining({
        categoryId: 'docker',
        title: 'Docker',
        commands: [
          expect.objectContaining({ commandId: 'build-image', path: '/docker/build-image' }),
        ],
      }),
    ]);
  });
});
