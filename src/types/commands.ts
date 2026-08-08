import type { Command } from 'src/types/catalog';

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
export type EditTarget = DeleteTarget;
