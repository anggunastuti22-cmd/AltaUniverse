# Alta Universe

A human-centered **personal intelligence and lifestyle ecosystem** of three
connected domains:

- **AltaMind** — understand yourself.
- **AltaWear** — express yourself.
- **AltaLab** — care for yourself.

One identity, one privacy-conscious life system. See
[`docs/product/PRODUCT_VISION.md`](docs/product/PRODUCT_VISION.md).

> **Status:** repository foundation (scaffold). No product features are
> implemented yet — see [`IMPLEMENTATION_ROADMAP.md`](IMPLEMENTATION_ROADMAP.md).

## Monorepo layout

```
apps/
  web/      Next.js — public site + authenticated app
  admin/    Next.js — operator console (no access to private data)
  mobile/   Expo React Native — capture-first app
packages/
  ui/             reusable web + native primitives
  design-tokens/  single source of truth for styling
  database/       typed Supabase client + generated types
  domain/         pure, framework-free domain logic
  validation/     shared Zod schemas
  config/         tsconfig/eslint presets + env validation
supabase/   config, migrations, functions, seed
docs/       product · architecture · database · security · design · decisions
```

## Tech stack

TypeScript (strict) · pnpm workspaces + Turborepo · Next.js 16 · Expo SDK 56 /
React Native · React 19 · Supabase (Postgres, Auth, Storage, Edge Functions) ·
Zod · Vitest · ESLint (flat) + Prettier.

## Quick start

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # fill in publishable key + url
pnpm dev:web                                    # http://localhost:3000
```

Full instructions: [`docs/architecture/DEVELOPMENT_SETUP.md`](docs/architecture/DEVELOPMENT_SETUP.md).

## Common commands

| Command                                     | What it does                       |
| ------------------------------------------- | ---------------------------------- |
| `pnpm dev:web` / `dev:admin` / `dev:mobile` | Start an app                       |
| `pnpm lint`                                 | ESLint across the repo             |
| `pnpm typecheck`                            | `tsc --noEmit` across all packages |
| `pnpm test`                                 | Vitest                             |
| `pnpm check`                                | format + lint + typecheck + test   |
| `SKIP_ENV_VALIDATION=1 pnpm build`          | Build web + admin                  |
| `pnpm db:start` / `db:reset` / `db:types`   | Local Supabase                     |

## Project rules

Permanent rules (strict TS, no secrets in source, migrations-only schema, RLS
mandatory, accessibility, privacy by design, tests before completion, no
production deploy without human approval) live in
[`CLAUDE.md`](CLAUDE.md).
