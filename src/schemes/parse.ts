import type { z } from 'zod';

class ParseError extends Error {}

export function fail(message: string): never {
  throw new ParseError(message);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isFilledString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function toResult<T>(parse: () => T): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: parse() };
  } catch (error) {
    if (error instanceof ParseError) return { ok: false, error: error.message };
    throw error;
  }
}

export function run<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) fail(result.error.issues[0].message);
  return result.data;
}
