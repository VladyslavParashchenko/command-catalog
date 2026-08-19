import { z } from 'zod';
import type { Command, EnumChoice, TemplateOption } from 'src/types/catalog';
import { fail, run } from 'src/schemes/parse';

export type CommandLabels = {
  subject: string;
  owner: string;
};

export const optionTypes: TemplateOption['type'][] = [
  'string',
  'number',
  'boolean',
  'enum',
  'timecode',
];

// Must stay in step with the renderer in CommandBody.vue, which accepts no spaces inside braces.
const placeholderPattern = /\{\{(\w+)\}\}/g;

function filledString(message: string) {
  return z.string({ error: message }).refine((value) => value.trim().length > 0, {
    error: message,
  });
}

export function parseCommandBody(raw: unknown, labels: CommandLabels): Omit<Command, 'id'> {
  const { subject, owner } = labels;
  const body = run(
    z.object({
      name: filledString(`${subject} is missing a valid "name".`),
      template: filledString(`${subject} is missing a valid "template".`),
      description: z.string({ error: `${subject} has a non-string "description".` }).optional(),
      options: z.record(z.string(), z.unknown(), {
        error: `${subject} must have an "options" object.`,
      }),
    }),
    raw,
  );

  return {
    name: body.name,
    description: body.description ?? '',
    template: body.template,
    options: Object.fromEntries(
      Object.entries(body.options).map(([name, option]) => [
        name,
        parseOption(option, `Parameter "${name}" of ${owner}`),
      ]),
    ),
  };
}

export function checkTemplateContract(command: Omit<Command, 'id'>) {
  const invalid = Object.keys(command.options).filter((name) => !/^\w+$/.test(name));
  if (invalid.length)
    fail(
      `Parameter ${list(invalid)} cannot be used in a template — use only letters, numbers or underscores.`,
    );

  const used = new Set([...command.template.matchAll(placeholderPattern)].map(([, name]) => name));
  const declared = Object.keys(command.options);

  const undeclared = [...used].filter((name) => !declared.includes(name));
  if (undeclared.length) fail(`The template uses ${list(undeclared)}, missing from "options".`);

  const unused = declared.filter((name) => !used.has(name));
  if (unused.length) fail(`"options" declares ${list(unused)}, unused in the template.`);
}

function parseOption(raw: unknown, label: string): TemplateOption {
  const option = run(
    z.object(
      {
        type: z.enum(optionTypes as [TemplateOption['type'], ...TemplateOption['type'][]], {
          error: (issue) => `${label} has an unknown type ${JSON.stringify(issue.input)}.`,
        }),
        optional: z.boolean({ error: `${label} must have a boolean "optional".` }),
        key: z.string({ error: `${label} has a non-string "key".` }).optional(),
        example: z.string({ error: `${label} has a non-string "example".` }).optional(),
        defaultValue: z
          .union([z.string(), z.number(), z.boolean()], {
            error: `${label} has an unsupported "defaultValue".`,
          })
          .optional(),
        restrictions: restrictionsSchema(label).optional(),
      },
      { error: `${label} must be an object.` },
    ),
    raw,
  );

  const enumValues = option.restrictions?.enum;
  if (!enumValues) return option as TemplateOption;

  return {
    ...option,
    restrictions: {
      ...option.restrictions,
      enum: normalizeEnumChoices(enumValues, label),
    },
  } as TemplateOption;
}

function restrictionsSchema(label: string) {
  const enumMessage = `${label} has an invalid "enum" restriction.`;
  return z.object(
    {
      min: z.number({ error: `${label} has a non-numeric "min" restriction.` }).optional(),
      max: z.number({ error: `${label} has a non-numeric "max" restriction.` }).optional(),
      enum: z
        .union([
          z.array(z.string({ error: enumMessage }), { error: enumMessage }),
          z.array(
            z.object(
              {
                key: z.string({ error: enumMessage }),
                label: z.string({ error: enumMessage }),
              },
              { error: enumMessage },
            ),
            { error: enumMessage },
          ),
        ])
        .optional(),
    },
    { error: `${label} has non-object "restrictions".` },
  );
}

export function normalizeEnumChoices(value: unknown, label = 'Enum'): EnumChoice[] {
  if (!Array.isArray(value)) fail(`${label} has an invalid "enum" restriction.`);

  const normalized = value.map((item) => {
    if (typeof item === 'string') return { key: item.trim(), label: item.trim() };
    if (!item || typeof item !== 'object') fail(`${label} has an invalid "enum" restriction.`);
    const choice = item as { key?: unknown; label?: unknown };
    if (typeof choice.key !== 'string' || typeof choice.label !== 'string')
      fail(`${label} has an invalid "enum" restriction.`);
    return { key: choice.key.trim(), label: choice.label.trim() };
  });
  if (normalized.some(({ key, label: choiceLabel }) => !key || !choiceLabel)) {
    fail(`${label} has an enum choice with an empty key or label.`);
  }
  if (new Set(normalized.map(({ key }) => key)).size !== normalized.length) {
    fail(`${label} has duplicate enum keys.`);
  }
  return normalized;
}

function list(names: string[]) {
  return names.map((name) => `"${name}"`).join(', ');
}
