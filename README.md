# Command Catalog

Каталог shell-команд на Vue 3, TypeScript, Vite, Vue Router і Tailwind CSS. UI використовує shadcn-vue-підхід: доступні primitive-компоненти з `src/components/ui` та composable Tailwind-класи без Ionic або Material UI.

## Запуск

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
```

Для автоматичного виправлення стилю доступні `pnpm lint:fix` та `pnpm format`.

## Git hooks

Після `pnpm install` hooks активуються автоматично через `prepare`. Якщо потрібно активувати їх вручну:

```bash
pnpm hooks:install
```

Перед комітом prek перевіряє форматування й ESLint лише staged-файлів. Також він запускає commitlint для повідомлення коміту: використовуйте Conventional Commits, наприклад `feat: add command import` або `fix: validate duplicate options`.

## Структура

- `src/types/catalog.ts` — типи категорій, команд і параметрів шаблону.
- Імпорти абсолютні від кореня проєкту (`src/types/catalog`), без відносних шляхів.
- `src/schemes/` — схеми валідації, `src/lib/` — import/export і форматування, `src/data-layer/` — лише Dexie.
- `tests/` дзеркалить `src/`; спільні фікстури лежать у `tests/fixtures/`.
- `src/catalog.ts` — початковий каталог, реактивний registry і рекурсивне дерево навігації; зміни зберігаються у `localStorage`.
- `src/router.ts` — один динамічний маршрут `/:categoryId/:commandId`.
- `src/components/navigation/CommandTree.vue` — recursive tree, пошук, keyboard navigation і localStorage expanded state.
- `src/pages/CommandPage.vue` — динамічна сторінка, що знаходить команду за параметрами маршруту.
- `src/components/command-page/` — контейнер, заголовок і форма, яка будується з `command.options`.
- `src/components/catalog/CatalogEditor.vue` — форма створення категорій, команд і їх параметрів.
- `src/components/ui/` — маленькі доступні UI primitives у стилі shadcn-vue.

Для створених команд маршрути автоматично мають вигляд `/:categoryId/:commandId`.
