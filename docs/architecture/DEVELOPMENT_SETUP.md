# Alta Universe — Development Setup

> Status: Foundation phase
> Last updated: 2026-06-18

This describes how to run the monorepo locally. It documents the **actual**
repository created in the foundation phase (no product features yet).

## 1. Prerequisites

- **Node.js 22** (see `.nvmrc`).
- **pnpm 10** (`corepack enable` will provide it; pinned via `packageManager`).
- **Docker** — only needed to run the local Supabase stack.
- **Supabase CLI** — used via `npx supabase ...` (or install globally).

## 2. Install

```bash
pnpm install
```

The repo uses a **hoisted** node-linker (`.npmrc`) so React Native / Metro and
Expo resolve `react` and `react-native` as singletons across the workspace.

## 3. Workspace layout

```
apps/      web (Next.js) · admin (Next.js) · mobile (Expo)
packages/  ui · design-tokens · database · domain · validation · config
supabase/  config.toml · migrations · functions · seed.sql
```

Shared packages export **TypeScript source** directly (no build step). Next apps
transpile them via `transpilePackages`; Metro transpiles them for mobile.

## 4. Environment variables

Each app has an `.env.example`. Copy it to `.env.local` and fill in values:

```bash
cp apps/web/.env.example    apps/web/.env.local
cp apps/admin/.env.example  apps/admin/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local
```

Rules (enforced by `packages/config` env validation at startup):

- **Web/mobile may only contain the Supabase _publishable_ key** (`NEXT_PUBLIC_*`
  / `EXPO_PUBLIC_*`).
- **Secret keys are server-only** (never `NEXT_PUBLIC`/`EXPO_PUBLIC`). They live
  in the server environment / Edge Functions only.
- Set `SKIP_ENV_VALIDATION=1` for build/CI steps without real values.

## 5. Run the apps

```bash
pnpm dev:web      # Next.js app on http://localhost:3000
pnpm dev:admin    # Admin console on http://localhost:3001
pnpm dev:mobile   # Expo dev server (open in Expo Go / simulator)
```

## 6. Local Supabase

```bash
pnpm db:start     # supabase start (requires Docker)
pnpm db:reset     # apply migrations + seed.sql
pnpm db:types     # regenerate packages/database/src/types.gen.ts
pnpm db:stop      # supabase stop
```

`supabase start` prints the local anon (publishable) and service_role (secret)
keys — use the publishable key for the apps; keep the secret server-side only.

> No migrations exist yet (foundation phase). The core schema arrives in a later
> roadmap phase.

## 7. Quality gates (run before pushing)

```bash
pnpm format:check   # Prettier
pnpm lint           # ESLint (flat config)
pnpm typecheck      # tsc --noEmit across all packages (via Turborepo)
pnpm test           # Vitest (packages)
pnpm check          # all of the above

SKIP_ENV_VALIDATION=1 pnpm build   # next build for web + admin
```

CI (`.github/workflows/ci.yml`) runs the same gates plus a secret scan on every
push and pull request.

## 8. Conventions

- **Strict TypeScript** everywhere; `@typescript-eslint/no-explicit-any` is an
  error (justify unavoidable escapes with an inline disable comment).
- Pure domain logic lives in `packages/domain` and must not import framework
  code — enforced by an architecture boundary test.
- Design tokens are the single source of truth for styling
  (`packages/design-tokens`), injected as CSS variables on web and consumed as
  values on mobile.

## 9. Web auth (Phase 1)

`apps/web` uses Supabase Auth via `@supabase/ssr` (cookie-based sessions):

- `src/lib/supabase/client.ts` (browser), `server.ts` (server components /
  actions / route handlers), `middleware.ts` (`updateSession`).
- `proxy.ts` (Next 16 proxy convention) refreshes the session and guards
  `/home`, `/onboarding`, `/account`.
- Flows: email+password sign-in/sign-up, magic link, sign-out (`app/login`),
  PKCE callback (`app/auth/callback`) and token-hash confirm (`app/auth/confirm`).
- Onboarding (`app/onboarding`) creates the profile + preferences and records
  consent (AI processing **off** by default). Privacy centre
  (`app/account/privacy`) toggles consent (granular, revocable).

**Supabase dashboard config required for auth to work:**

1. Authentication → URL Configuration → set **Site URL** (e.g.
   `http://localhost:3000`) and add **Redirect URLs**:
   `http://localhost:3000/auth/callback`, `http://localhost:3000/auth/confirm`
   (and the production equivalents).
2. `apps/web/.env.local` must contain `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (publishable key only).
