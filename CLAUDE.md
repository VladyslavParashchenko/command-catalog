# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev            # Vite dev server
pnpm build          # vue-tsc --noEmit && vite build
pnpm typecheck      # vue-tsc --noEmit
pnpm lint           # eslint .          (pnpm lint:fix to autofix)
pnpm format:check   # prettier --check .  (pnpm format to write)
pnpm test           # vitest run
```

CI runs `typecheck`, `lint`, `format:check`, then `test` — run all four before claiming work is done.

Single test file or case:

```bash
pnpm vitest run tests/lib/command-import.test.ts
pnpm vitest run -t 'rejects an array of commands'
```

## Layout

Tests live in `tests/`, mirroring `src/`, with shared fixtures in `tests/fixtures/`. Nothing under
`src/` is a test file.

Four source layers, and the boundaries are the point:

| Directory         | Holds                                                        |
| ----------------- | ------------------------------------------------------------ |
| `src/data-layer/` | Dexie only — the database class and its record types.        |
| `src/schemes/`    | Validation. What a valid command or catalog file looks like. |
| `src/lib/`        | Operations built on the schemes: import, export, formatting. |
| `src/components/` | UI. Never validates or touches Dexie for catalog data.       |

## Imports

Absolute from the project root, everywhere — `import { db } from 'src/data-layer/database'`. No
relative imports, not even for siblings. The mapping lives in **two** places that nothing keeps in
sync: `resolve.alias` in `vite.config.ts` (build, dev, tests) and `paths` in `tsconfig.json`
(typecheck, IDE). Change both together, for `src/` and `tests/` alike.

## Architecture

**Catalog state** — `src/catalog.ts` owns everything. A single reactive `categories` ref feeds the
computed `commandRoutes`, `commandRegistry` and `commandTree`; components never touch Dexie for
catalog data.

Every write funnels through `saveCatalog`, which **clears and rewrites both tables** in one Dexie
transaction. `order`, `createdAt` and `updatedAt` are derived from array position on each save, so
they exist only in the database (`CategoryRecord`/`CommandRecord`) and never in the domain types.
This is why `replaceCatalog` (import) is three lines.

**Routing** — one dynamic route `/:categoryId/:commandId` in `src/router.ts`. Creating a command
registers nothing; `CommandPage` looks it up in `commandRegistry` and falls back to `EmptyPage` when
the id is gone, which is what keeps a stale URL harmless after a catalog import.

**Validation** — `src/schemes/` is the single source of truth (zod): `command.ts` for a command
definition, `catalog-file.ts` for the export envelope, `parse.ts` for the failure plumbing. Three
entry points build on it — `lib/catalog-import.ts` (whole-catalog file), `lib/command-import.ts`
(the "From JSON" tab) and the manual form in `CatalogEditor.vue`, which calls
`validateCommandInput`. Add a rule to the scheme, not to a caller.

`checkTemplateContract` is deliberately applied only to single-command input, not to catalog files:
an exported file is already-accepted data, and re-checking it would reject catalogs the app itself
produced before the rule existed.

Two constraints on this code:

- **Error wording is part of the contract.** Tests assert exact sentences such as
  `Parameter "port" of command "zip" has a non-numeric "min" restriction.` Schemas are therefore
  built per call, parameterised by caller-supplied labels. Rewording is a deliberate change, not a
  refactor.
- **Parsing is all-or-nothing.** Import replaces the whole catalog, so one bad entry rejects the
  entire file; `run()` surfaces only the first zod issue.

**Templates** — a command renders by substituting `{{name}}` placeholders. The regex in
`schemes/command.ts` must stay identical to the one in `CommandBody.vue`; it deliberately rejects
`{{ name }}` with spaces, because the renderer does too. Placeholders and `options` keys must match
in both directions.

**Modals** — `src/components/ui/Modal.vue` is the shared shell (backdrop, Escape, header, footer
slot). Dialogs live in `App.vue`, not in the sidebar components, because the sidebar is rendered
twice (desktop aside + mobile drawer) — anything owning modal state there would exist in two copies.

**LLM skill file** — `src/assets/command-skill.md` is imported with `?raw` and downloaded from the
JSON tab. It documents the command JSON format for an assistant, so it must be updated whenever the
schema or the tab name changes.

## Gotchas

- `pnpm-workspace.yaml` must keep `allowBuilds: esbuild: true`. An unanswered build prompt there
  makes every `pnpm install` exit non-zero, including in CI.
- The surge deploy job needs `SURGE_DOMAIN` and `SURGE_TOKEN` secrets in the `production`
  environment; `lint` and `test` run without them.
- Presets (`src/composables/use-presets.ts`) are per-device values and are deliberately excluded
  from catalog export.
