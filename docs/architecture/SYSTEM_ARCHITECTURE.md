# Alta Universe — System Architecture

> Status: Draft 1 (architecture & planning phase)
> Last updated: 2026-06-18

## 1. Overview

Alta Universe is a **TypeScript monorepo** delivering three client surfaces
(web, mobile, admin) on top of a shared Supabase backend, with domain logic,
types, validation, and design tokens shared across all clients.

```
                         ┌───────────────────────────────────────┐
                         │              Clients                    │
                         │                                         │
   Public + App web ───▶ │  apps/web  (Next.js)                    │
   Mobile          ───▶ │  apps/mobile (Expo React Native)        │
   Operators       ───▶ │  apps/admin (Next.js, separate)         │
                         └───────────────┬─────────────────────────┘
                                         │  shared packages
                         ┌───────────────▼─────────────────────────┐
                         │  packages/ domain · validation · ui ·    │
                         │  design-tokens · database · analytics ·  │
                         │  config                                  │
                         └───────────────┬─────────────────────────┘
                                         │  Supabase client + RLS
                         ┌───────────────▼─────────────────────────┐
                         │              Supabase                    │
                         │  Auth · Postgres (RLS) · Storage ·       │
                         │  Edge Functions                          │
                         └─────────────────────────────────────────┘
```

## 2. Technology choices

| Concern          | Choice                                 | Rationale (see ADRs)                                       |
| ---------------- | -------------------------------------- | ---------------------------------------------------------- |
| Repo model       | TypeScript monorepo                    | One identity/domain logic shared across surfaces. ADR-001. |
| Public + app web | Next.js                                | SSR/ISR for public pages; app router for authed app.       |
| Mobile           | Expo React Native                      | Single RN codebase; OTA updates; native capture flows.     |
| Admin            | Next.js (separate app)                 | Hard separation from user surfaces; own role/deploy.       |
| Database         | Supabase Postgres                      | Relational, RLS-native, migrations in Git. ADR-002.        |
| Auth             | Supabase Auth                          | Managed identity; one Alta ID. ADR-003.                    |
| File storage     | Supabase Storage                       | Private buckets for item/skin images.                      |
| Server logic     | Supabase Edge Functions                | Privileged/secret-bearing operations off the client.       |
| Package/build    | pnpm workspaces + Turborepo (proposed) | Fast, cacheable monorepo builds.                           |

## 3. Surfaces

### 3.1 `apps/web` — public site + authenticated app

- **Public:** Alta Universe homepage, three domain landing pages, product/program
  pages, articles. Mostly static/ISR; no private data.
- **Authenticated:** Alta Home, three domain workspaces, account & privacy
  centre. Talks to Supabase with the user's session; RLS enforces scope.

### 3.2 `apps/mobile` — Expo React Native

- Capture-first: daily check-in, quick journal, outfit logging, skin logging,
  routine reminders, notification centre.
- Uses the same shared `domain`/`validation`/`types` packages and the same
  Supabase project.

### 3.3 `apps/admin` — operator console

- Content management, product/affiliate catalogue, program management,
  aggregated analytics, support tools.
- **Runs as a separate application** with operator authentication and a
  least-privilege server context. **Never** holds keys that bypass RLS for
  private user content. See `WEB_MOBILE_ADMIN_BOUNDARIES.md`.

## 4. Shared packages

| Package                  | Responsibility                                                               |
| ------------------------ | ---------------------------------------------------------------------------- |
| `packages/database`      | Generated DB types, typed Supabase client factory, query helpers.            |
| `packages/domain`        | Pure domain logic (cost-per-wear, routine cost, weekly-reset rules). No I/O. |
| `packages/validation`    | Zod schemas shared by clients and Edge Functions.                            |
| `packages/ui`            | Reusable, accessible React/React Native-friendly components.                 |
| `packages/design-tokens` | Colors, typography, spacing — single source of truth.                        |
| `packages/analytics`     | Privacy-safe event contracts; **no private text**, ever.                     |
| `packages/config`        | Shared TS config, lint config, env schema (no secrets).                      |

Principle: **logic lives in packages; apps are thin.** A rule (e.g., "one
check-in per day") is implemented once and reused everywhere.

## 5. Data flow & trust model

1. Clients authenticate via Supabase Auth → receive a scoped JWT.
2. Clients read/write Postgres **through RLS** using the anon/auth key only.
3. Operations that need elevated privilege or secrets (export bundling,
   deletion orchestration, any future AI call) run in **Edge Functions** with
   the service role, never in the client.
4. Files go to **private Storage buckets** with per-user path scoping and
   signed URLs.
5. Analytics events carry **metadata only**; private text is excluded by
   contract and by review.

Trust boundary: the client is untrusted. RLS + Edge Functions are the
enforcement layer. The service-role key exists **only** server-side in Edge
Functions.

## 6. Environments

- **local** — Supabase CLI local stack; seed via `supabase/seed.sql` with
  development-only data.
- **staging** — full environment for testing; no production data.
- **production** — gated; no deploy without explicit human approval (see
  `CLAUDE.md`).

## 7. Schema & migrations

- All schema changes are migrations under `supabase/migrations/`, tracked in
  Git, applied in order. No ad-hoc dashboard changes. (ADR-002.)
- RLS policies are part of migrations, not an afterthought.

## 8. AI architecture (deferred, opt-in)

- AI is **not** in the first vertical slice.
- When introduced: invoked only via Edge Functions, only with explicit per-user
  consent, with prompts/outputs that never claim diagnosis and never make final
  decisions. Inputs are minimized; private text is sent only with consent.
- Latest, most capable Claude models are the default when AI is added.

## 9. Cross-cutting concerns

- **Security/Privacy:** `../security/PRIVACY_AND_SECURITY.md`.
- **Repo layout:** `REPOSITORY_STRUCTURE.md`.
- **Surface boundaries:** `WEB_MOBILE_ADMIN_BOUNDARIES.md`.
- **Data model:** `../database/INITIAL_DATA_MODEL.md`, `../database/RLS_STRATEGY.md`.

## 10. Open architectural questions

- Turborepo vs. Nx for the monorepo task runner (leaning Turborepo).
- Whether admin reads analytics from materialized views vs. a separate
  reporting schema (leaning reporting views with no PII).
- Notification delivery provider for mobile push (deferred to roadmap phase).
