import type { Command } from 'src/types/catalog';

/** The catalog is two levels deep: a category holds commands, and nothing else. */
export type CommandTreeCommand = {
  commandId: string;
  title: string;
  definition: Command;
  path: string;
};
export type CommandTreeCategory = {
  categoryId: string;
  title: string;
  commands: CommandTreeCommand[];
};
export type DeleteTarget =
  { type: 'category'; categoryId: string } | { type: 'command'; commandId: string };
