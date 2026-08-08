---
name: command-catalog-json
description: Use when the user wants a shell command turned into a Command Catalog entry — produces the JSON object that the app's "New command → From JSON" tab accepts.
---

# Command Catalog JSON

Turn a shell command into one JSON object that Command Catalog can import.

## Output rules

Return **only** the JSON object. No prose before or after, no markdown fences, no array — exactly
one object. The app rejects anything else.

Do not include `id` or a category: the app generates the id and the user picks the category in the
form.

## Shape

```json
{
  "name": "Build image",
  "description": "Build a Docker image from a Dockerfile in the given directory.",
  "template": "docker build -t {{image}} {{path}}",
  "options": {
    "image": { "type": "string", "optional": false, "example": "my-app:latest" },
    "path": { "type": "string", "optional": false, "example": "." }
  }
}
```

### Top-level fields

| Field         | Required | Type   | Notes                                                       |
| ------------- | -------- | ------ | ----------------------------------------------------------- |
| `name`        | yes      | string | Short label shown in the sidebar, e.g. `Build image`.       |
| `template`    | yes      | string | The command line with `{{placeholder}}` holes.              |
| `options`     | yes      | object | One entry per placeholder. May be `{}` for a fixed command. |
| `description` | no       | string | One sentence on what the command does. Defaults to empty.   |

### Template and placeholders

Write placeholders as `{{name}}` — **no spaces inside the braces**. `{{ name }}` is not recognised
and would end up in the output literally.

The placeholder names and the keys of `options` must match exactly, in both directions:

- every `{{name}}` in the template needs an `options.name` entry;
- every key in `options` must appear in the template.

Placeholder names may contain only letters, digits and underscores.

Everything that is not a placeholder is emitted verbatim, so pipes, quotes and flags that never
change belong directly in the template: `ps aux | grep {{port}}`.

## Option fields

| Field          | Required | Type                      | Notes                                                     |
| -------------- | -------- | ------------------------- | --------------------------------------------------------- |
| `type`         | yes      | see below                 | One of `string`, `number`, `boolean`, `enum`, `timecode`. |
| `optional`     | yes      | boolean                   | `true` means the user may leave it out.                   |
| `key`          | no       | string                    | Flag emitted before the value, e.g. `-t`, `--output`.     |
| `example`      | no       | string                    | Placeholder text shown in the input.                      |
| `defaultValue` | no       | string, number or boolean | Pre-filled value.                                         |
| `restrictions` | no       | object                    | See each type below.                                      |

### Types

**`string`** — free text. `restrictions` is unused; pass `{}` or omit it.

```json
{ "archive": { "type": "string", "optional": false, "example": "archive.zip" } }
```

**`number`** — numeric input. `restrictions` may carry `min` and `max`, both numbers.

```json
{
  "port": {
    "type": "number",
    "optional": false,
    "example": "3000",
    "restrictions": { "min": 1, "max": 65535 }
  }
}
```

**`boolean`** — a flag. Use it together with `key`: when the user turns it on, the `key` is emitted
and nothing else. `defaultValue` may be `true` or `false`.

```json
{ "recursive": { "key": "-r", "type": "boolean", "optional": true, "defaultValue": true } }
```

**`enum`** — a fixed set of choices. `restrictions.enum` must be a list of strings.

```json
{
  "level": {
    "type": "enum",
    "optional": true,
    "restrictions": { "enum": ["debug", "info", "warn"] }
  }
}
```

**`timecode`** — a `HH:MM:SS` position, for tools like `ffmpeg`.

```json
{ "start": { "key": "-ss", "type": "timecode", "optional": true, "example": "00:01:30" } }
```

## When to use `key`

`key` is for values the tool reads behind a flag. `{{destination}}` with `"key": "-P"` renders as
`-P ~/Videos`. Positional arguments — a file, a URL, a path — have no `key`.

Mark an option `optional: true` whenever the command still runs without it. A flag with a `key` is
almost always optional; the main subject of the command usually is not.

## Fuller example

```json
{
  "name": "Download from YouTube",
  "description": "Download media from a public YouTube video URL.",
  "template": "yt-dlp {{format}} {{destination}} {{url}}",
  "options": {
    "format": {
      "key": "-f",
      "type": "enum",
      "optional": true,
      "restrictions": { "enum": ["best", "bestvideo+bestaudio", "worst"] }
    },
    "destination": { "key": "-P", "type": "string", "optional": true, "example": "~/Videos" },
    "url": {
      "type": "string",
      "optional": false,
      "example": "https://www.youtube.com/watch?v=…"
    }
  }
}
```

## Checklist before answering

1. Exactly one JSON object, nothing around it.
2. No `id`, no category.
3. `name` and `template` are non-empty.
4. Placeholders and `options` keys match both ways, with no spaces inside `{{ }}`.
5. Every option has a valid `type` and a boolean `optional`.
6. `restrictions.enum` is a list of strings; `min` and `max` are numbers.
