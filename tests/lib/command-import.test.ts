import { describe, expect, it } from 'vitest';
import { parseCommandJson, validateCommandInput } from 'src/lib/command-import';

const valid = {
  name: 'Build image',
  description: 'Build a Docker image.',
  template: 'docker build -t {{image}} {{path}}',
  options: {
    image: { type: 'string', optional: false, example: 'my-app:latest' },
    path: { type: 'string', optional: false, example: '.' },
  },
};

function errorOf(input: unknown): string {
  const result = parseCommandJson(typeof input === 'string' ? input : JSON.stringify(input));
  if (result.ok) throw new Error('Expected the JSON to be rejected.');
  return result.error;
}

describe('parseCommandJson', () => {
  it('accepts a well-formed command', () => {
    const result = parseCommandJson(JSON.stringify(valid));
    expect(result).toEqual({ ok: true, command: valid });
  });

  it('accepts enum choices with separate keys and labels', () => {
    const command = {
      ...valid,
      template: 'yt-dlp -f {{format}}',
      options: {
        format: {
          type: 'enum',
          optional: false,
          restrictions: {
            enum: [
              { key: 'bestvideo+bestaudio', label: 'Best video and audio' },
              { key: 'worst', label: 'Lowest quality' },
            ],
          },
        },
      },
    };
    const result = parseCommandJson(JSON.stringify(command));
    expect(result.ok && result.command.options.format.restrictions?.enum).toEqual(
      command.options.format.restrictions.enum,
    );
  });

  it('normalizes legacy enum strings to key and label pairs', () => {
    const command = {
      ...valid,
      template: 'tool --level {{level}}',
      options: {
        level: { type: 'enum', optional: false, restrictions: { enum: ['debug', 'info'] } },
      },
    };
    const result = parseCommandJson(JSON.stringify(command));
    expect(result.ok && result.command.options.level.restrictions?.enum).toEqual([
      { key: 'debug', label: 'debug' },
      { key: 'info', label: 'info' },
    ]);
  });

  it('rejects enum choices with duplicate keys', () => {
    const command = {
      ...valid,
      template: 'tool --level {{level}}',
      options: {
        level: {
          type: 'enum',
          optional: false,
          restrictions: {
            enum: [
              { key: 'debug', label: 'Debug logging' },
              { key: 'debug', label: 'Duplicate key' },
            ],
          },
        },
      },
    };
    expect(errorOf(command)).toBe('Parameter "level" of the command has duplicate enum keys.');
  });

  it('rejects enum choices with an empty key or label', () => {
    const command = {
      ...valid,
      template: 'tool --level {{level}}',
      options: {
        level: {
          type: 'enum',
          optional: false,
          restrictions: { enum: [{ key: '', label: 'Debug logging' }] },
        },
      },
    };
    expect(errorOf(command)).toBe(
      'Parameter "level" of the command has an enum choice with an empty key or label.',
    );
  });

  it('defaults a missing description to an empty string', () => {
    const result = parseCommandJson(
      JSON.stringify({ name: valid.name, template: valid.template, options: valid.options }),
    );
    expect(result.ok && result.command.description).toBe('');
  });

  it('ignores an id, which the catalog generates', () => {
    const result = parseCommandJson(JSON.stringify({ ...valid, id: 'supplied-by-the-llm' }));
    expect(result.ok && 'id' in result.command).toBe(false);
  });

  it('asks for input when the field is empty', () => {
    expect(errorOf('   ')).toBe('Paste a command JSON object first.');
  });

  it('rejects text that is not JSON', () => {
    expect(errorOf('Here is your command: {')).toBe('This is not valid JSON.');
  });

  it('rejects an array of commands', () => {
    expect(errorOf([valid])).toBe('Paste a single command object, not an array.');
  });

  it('rejects a missing template', () => {
    expect(
      errorOf({ name: valid.name, description: valid.description, options: valid.options }),
    ).toBe('The command is missing a valid "template".');
  });

  it('rejects an unknown parameter type', () => {
    const broken = { ...valid, options: { ...valid.options, image: { type: 'date' } } };
    expect(errorOf(broken)).toBe('Parameter "image" of the command has an unknown type "date".');
  });

  it('rejects a placeholder with no matching option', () => {
    const broken = { ...valid, template: 'docker build -t {{image}} {{context}}' };
    expect(errorOf(broken)).toBe('The template uses "context", missing from "options".');
  });

  it('rejects an option that the template never uses', () => {
    const broken = {
      ...valid,
      options: { ...valid.options, tag: { type: 'string', optional: true } },
    };
    expect(errorOf(broken)).toBe('"options" declares "tag", unused in the template.');
  });

  it('rejects placeholders written with spaces, which the renderer does not match', () => {
    const broken = { ...valid, template: 'docker build -t {{ image }} {{path}}' };
    expect(errorOf(broken)).toBe('"options" declares "image", unused in the template.');
  });

  it('rejects a parameter name that cannot appear in a template', () => {
    const broken = {
      ...valid,
      template: 'docker build {{path}}',
      options: { path: valid.options.path, 'image-tag': { type: 'string', optional: true } },
    };
    expect(errorOf(broken)).toBe(
      'Parameter "image-tag" cannot be used in a template — use only letters, numbers or underscores.',
    );
  });

  it('applies the same rules to a command assembled by the form', () => {
    const fromForm = {
      name: 'Build image',
      description: '',
      template: 'docker build {{path}}',
      options: {
        path: { key: undefined, example: undefined, type: 'string', optional: false },
        tag: { type: 'string', optional: true },
      },
    };
    const result = validateCommandInput(fromForm);
    expect(result.ok ? 'accepted' : result.error).toBe(
      '"options" declares "tag", unused in the template.',
    );
  });

  it('accepts a command with no parameters at all', () => {
    const fixed = { name: 'List pods', template: 'kubectl get pods', options: {} };
    const result = parseCommandJson(JSON.stringify(fixed));
    expect(result.ok && result.command.template).toBe('kubectl get pods');
  });

  it('accepts an output-file parameter referencing another parameter', () => {
    const command = {
      ...valid,
      template: 'convert {{input}} {{output}}',
      options: {
        input: valid.options.path,
        output: { type: 'output-file', source: 'input', suffix: 'converted', optional: false },
      },
    };
    expect(parseCommandJson(JSON.stringify(command)).ok).toBe(true);
  });

  it('rejects an output-file parameter with a missing source', () => {
    const command = {
      ...valid,
      template: 'convert {{input}}',
      options: {
        input: valid.options.path,
        output: { type: 'output-file', source: 'missing', suffix: 'converted', optional: false },
      },
    };
    expect(errorOf(command)).toContain('references missing source "missing"');
  });
});
