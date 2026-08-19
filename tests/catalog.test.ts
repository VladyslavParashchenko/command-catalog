import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('src/data-layer/database', () => {
  const table = () => ({
    clear: vi.fn(async () => undefined),
    bulkDelete: vi.fn(async () => undefined),
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

const { categories, commandTree, renameCategory, replaceCatalog, updateCommand } =
  await import('src/catalog');

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

const build = {
  name: 'Build image',
  description: '',
  template: 'docker build {{path}}',
  options: { path: { type: 'string' as const, optional: false } },
};
const run = {
  name: 'Run container',
  description: '',
  template: 'docker run {{image}}',
  options: { image: { type: 'string' as const, optional: false } },
};

describe('renameCategory', () => {
  beforeEach(() => {
    categories.value = [
      { id: 'docker', name: 'Docker', commands: [{ id: 'build-image', ...build }] },
    ];
  });

  it('renames without touching the id every command URL is built from', async () => {
    await renameCategory('docker', '  Containers  ');
    expect(categories.value[0]).toMatchObject({ id: 'docker', name: 'Containers' });
    expect(commandTree.value[0]?.commands[0]?.path).toBe('/docker/build-image');
  });
});

describe('updateCommand', () => {
  beforeEach(() => {
    categories.value = [
      {
        id: 'docker',
        name: 'Docker',
        commands: [
          { id: 'build-image', ...build },
          { id: 'run-container', ...run },
        ],
      },
      { id: 'linux', name: 'Linux', commands: [] },
    ];
  });

  it('keeps the id and the position in its category', async () => {
    await updateCommand('build-image', { ...build, name: 'Build' }, 'docker');
    expect(categories.value[0]?.commands.map((command) => command.id)).toEqual([
      'build-image',
      'run-container',
    ]);
    expect(categories.value[0]?.commands[0]).toMatchObject({ id: 'build-image', name: 'Build' });
  });

  it('moves the command when the category changes', async () => {
    await updateCommand('build-image', build, 'linux');
    expect(categories.value[0]?.commands.map((command) => command.id)).toEqual(['run-container']);
    expect(commandTree.value[1]?.commands[0]?.path).toBe('/linux/build-image');
  });

  it('rejects an unknown category', async () => {
    await expect(updateCommand('build-image', build, 'missing')).rejects.toThrow(
      'Category not found',
    );
  });

  it('rejects an unknown command without adding it to the target category', async () => {
    await expect(updateCommand('missing', build, 'linux')).rejects.toThrow('Command not found');
    expect(categories.value[1]?.commands).toEqual([]);
  });
});
