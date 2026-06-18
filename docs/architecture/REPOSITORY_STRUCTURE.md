# Alta Universe — Repository Structure

> Status: Draft 1 (architecture & planning phase)
> Last updated: 2026-06-18

## 1. Target layout

```
alta-universe/
├── apps/
│   ├── web/            # Next.js — public site + authenticated app
│   ├── mobile/         # Expo React Native — capture-first mobile app
│   └── admin/          # Next.js — operator console (separate app)
│
├── packages/
│   ├── ui/             # Reusable, accessible UI components
│   ├── design-tokens/  # Colors, type, spacing — single source of truth
│   ├── database/       # Generated DB types + typed Supabase client helpers
│   ├── domain/         # Pure domain logic (no I/O)
│   ├── validation/     # Shared Zod schemas
│   ├── analytics/      # Privacy-safe event contracts
│   └── config/         # Shared tsconfig, eslint, env schema
│
├── supabase/
│   ├── migrations/     # Ordered SQL migrations (schema + RLS)
│   ├── functions/      # Edge Functions (privileged/server logic)
│   ├── seed.sql        # Development-only seed data
│   └── config.toml     # Supabase project config
│
├── docs/
│   ├── product/        # Vision, scope, journeys, domain boundaries
│   ├── architecture/   # System, repo, surface boundaries
│   ├── database/       # Data model, RLS strategy
│   ├── security/       # Privacy & security
│   ├── design/         # Design handoff requirements
│   └── decisions/      # ADRs
│
├── CLAUDE.md           # Permanent project rules
├── IMPLEMENTATION_ROADMAP.md
├── package.json        # Workspace root
├── pnpm-workspace.yaml
└── turbo.json          # (proposed) task pipeline
```

## 2. Tooling conventions

- **Package manager:** pnpm workspaces.
- **Task runner:** Turborepo (proposed) for cached builds/tests across packages.
- **Language:** TypeScript everywhere, `strict` mode on (see `CLAUDE.md`).
- **Linting/formatting:** shared ESLint + Prettier configs from
  `packages/config`.
- **Validation:** Zod schemas in `packages/validation`, reused by clients and
  Edge Functions.

## 3. Dependency direction (allowed imports)

```
apps/*      ──▶ packages/*        (apps depend on packages)
packages/ui ──▶ packages/design-tokens
packages/database ──▶ (generated types only)
packages/domain   ──▶ (pure; depends on validation/types only)
packages/*  ──▶  ✗ apps/*         (packages NEVER import apps)
domain      ──▶  ✗ database       (no I/O in domain)
```

Rules:
- Apps are thin; they orchestrate packages.
- `domain` is pure and I/O-free so it is trivially testable.
- No circular dependencies; enforced in CI.

## 4. Naming & ownership

- Each domain's database objects are namespaced by domain prefix
  (e.g., `mind_*`, `wear_*`, `lab_*`, `core_*`) — see data model doc.
- Shared components live in `packages/ui`; app-specific components stay in the
  app.
- One source of truth per concern: tokens in `design-tokens`, rules in
  `domain`, schemas in `validation`.

## 5. Environment & secrets

- Env vars are described by a schema in `packages/config`; **no secret values**
  live in the repo.
- Local development uses `.env.local` files that are git-ignored.
- The Supabase **service-role key** is used only inside Edge Functions /
  server contexts, never bundled into a client. (See `CLAUDE.md`.)

## 6. Migrations & generated artifacts

- Schema changes: add a migration in `supabase/migrations/`. Never edit applied
  migrations; add a new one.
- DB types in `packages/database` are **generated** from the schema and checked
  in; regenerate after each migration.

## 7. Testing layout

- Unit tests colocated with source (`*.test.ts`), heaviest in `domain` and
  `validation`.
- RLS/policy tests live alongside migrations or in a dedicated `supabase/tests`
  area.
- App-level E2E added per roadmap phase.

## 8. What does NOT belong in the repo

- Production data or real user data of any kind.
- Secrets, keys, tokens, `.env` files with values.
- Generated build output (`.next/`, `dist/`, native build artifacts).
- A Google Sheet (or any spreadsheet) as a primary data store.
