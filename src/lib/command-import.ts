import type { Command } from 'src/types/catalog';
import { checkTemplateContract, parseCommandBody } from 'src/schemes/command';
import { fail, isRecord, toResult } from 'src/schemes/parse';

export type CommandImportResult =
  { ok: true; command: Omit<Command, 'id'> } | { ok: false; error: string };

export function parseCommandJson(text: string): CommandImportResult {
  if (!text.trim()) return { ok: false, error: 'Paste a command JSON object first.' };

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'This is not valid JSON.' };
  }

  return validateCommandInput(raw);
}

export function validateCommandInput(raw: unknown): CommandImportResult {
  const result = toResult(() => parseCommand(raw));
  return result.ok ? { ok: true, command: result.value } : result;
}

function parseCommand(raw: unknown): Omit<Command, 'id'> {
  if (Array.isArray(raw)) fail('Paste a single command object, not an array.');
  if (!isRecord(raw)) fail('The JSON must be a command object.');

  const command = parseCommandBody(raw, { subject: 'The command', owner: 'the command' });
  checkTemplateContract(command);
  return command;
}
