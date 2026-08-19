<div align="center">
  <img src="public/favicon.svg" width="96" height="96" alt="Command Catalog logo" />
  <h1>Command Catalog</h1>
  <p>Visual shell command builder and CLI utility catalog.</p>
  <p><a href="https://command-catalog.surge.sh/">Try Command Catalog online</a></p>
</div>

---

Command Catalog turns complex CLI commands (like `ffmpeg`, `docker`, `git`, or `kubectl`) into interactive web forms with live command syntax previews.

## Features

- **Visual Builder**: Convert command flags, arguments, numbers, and dropdowns into interactive inputs with live code previews.
- **Offline & Local-First**: Runs entirely in the browser using IndexedDB. No external servers or telemetry.
- **PWA Support**: Installable as a standalone app on desktop and mobile.
- **Import & Export**: Backup and share your catalog via JSON files.
- **AI Skill Integration**: Export catalog definitions to let LLM assistants generate compatible command templates.

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm

### Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/command-catalog.git
cd command-catalog

# Install dependencies
pnpm install

# Run dev server
pnpm dev
```

### Build & Test

```bash
pnpm build     # Build production bundle
pnpm test      # Run tests with Vitest
pnpm lint      # Run ESLint
pnpm format    # Format with Prettier
```

## License

[MIT](LICENSE)
