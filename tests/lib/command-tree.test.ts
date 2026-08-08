import { describe, expect, it } from 'vitest';
import {
  filterCategories,
  findCategoryIdByCommand,
  flattenVisibleRows,
} from 'src/lib/command-tree';
import type { CommandTreeCategory } from 'src/types/commands';
import { categories } from 'tests/fixtures/catalog';

const tree: CommandTreeCategory[] = [
  {
    categoryId: 'linux-common',
    title: 'Linux common',
    commands: [
      {
        commandId: 'zip',
        title: 'Zip',
        definition: categories[0].commands[0],
        path: '/linux-common/zip',
      },
    ],
  },
  { categoryId: 'empty', title: 'Empty', commands: [] },
];

describe('filterCategories', () => {
  it('returns the input untouched for a blank query', () => {
    expect(filterCategories(tree, '   ')).toBe(tree);
  });

  it('matches on the command description, case-insensitively', () => {
    const result = filterCategories(tree, 'ZIP ARCHIVE');
    expect(result).toHaveLength(1);
    expect(result[0].commands.map((command) => command.commandId)).toEqual(['zip']);
  });

  it('drops categories left without a matching command', () => {
    expect(filterCategories(tree, 'nothing-matches')).toEqual([]);
  });
});

describe('flattenVisibleRows', () => {
  it('lists category rows only while collapsed', () => {
    expect(flattenVisibleRows(tree, new Set())).toEqual([
      { id: 'linux-common', categoryId: 'linux-common', commandId: undefined },
      { id: 'empty', categoryId: 'empty', commandId: undefined },
    ]);
  });

  it('inlines the commands of an expanded category in visual order', () => {
    expect(flattenVisibleRows(tree, new Set(['linux-common']))).toEqual([
      { id: 'linux-common', categoryId: 'linux-common', commandId: undefined },
      { id: 'zip', categoryId: 'linux-common', commandId: 'zip' },
      { id: 'empty', categoryId: 'empty', commandId: undefined },
    ]);
  });
});

describe('findCategoryIdByCommand', () => {
  it('finds the owning category', () => {
    expect(findCategoryIdByCommand(tree, 'zip')).toBe('linux-common');
  });

  it('returns undefined for an unknown command', () => {
    expect(findCategoryIdByCommand(tree, 'gone')).toBeUndefined();
  });
});
