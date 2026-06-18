# ADR-002: Use Supabase (Postgres, Auth, Storage, Edge Functions)

> Status: Accepted
> Date: 2026-06-18
> Deciders: Product Architecture

## Context

Alta Universe stores deeply personal data across three domains and must enforce
strict per-user privacy, support multiple client surfaces, handle file uploads
(wardrobe/skin images), run privileged server logic (export, deletion, future
opt-in AI), and keep schema changes tracked in Git. A small team needs to move
fast without operating bespoke infrastructure.

Requirements driving the choice:
- Relational data with strong integrity (many FKs across domains).
- **Row Level Security** as the primary authorization mechanism.
- Managed auth producing one identity (the Alta ID).
- Private file storage with per-user scoping.
- Server-side functions for secret-bearing/privileged operations.
- Migrations tracked in version control.

Options considered:
1. **Supabase** — managed Postgres + Auth + Storage + Edge Functions, RLS-native.
2. **Firebase** — managed, but document store; RLS-equivalent rules are less
   suited to our relational, cross-domain model.
3. **Custom backend** (Node/API + self-managed Postgres) — maximum control, high
   operational burden, slower to MVP.

## Decision

Use **Supabase** as the backend platform:

- **Postgres** with **RLS** on every user-exposed table as the core
  authorization layer.
- **Supabase Auth** for identity (one Alta ID; see ADR-003).
- **Supabase Storage** with private, per-user buckets for images.
- **Supabase Edge Functions** for privileged/secret-bearing operations (export,
  deletion orchestration, future opt-in AI) using the service role.
- **Migrations in `supabase/migrations/`** tracked in Git; RLS policies live in
  the same migrations. No ad-hoc dashboard schema changes.

## Consequences

**Positive**
- RLS gives us least-privilege, per-user isolation enforced at the database, not
  just in app code — directly satisfies our privacy principles.
- One platform covers auth, data, storage, and server logic → fast to MVP.
- Postgres relational model fits the cross-domain FK-heavy schema.
- Local dev parity via Supabase CLI; seed with development-only data.

**Negative / costs**
- Vendor coupling to Supabase APIs/conventions.
- Service-role key must be tightly controlled (server-only; never in clients).
- Edge Function runtime constraints for heavier workloads (acceptable at MVP).
- RLS policies require disciplined authoring and testing.

**Mitigations**
- Keep data access behind shared helpers in `packages/database`; logic in
  `packages/domain` is pure, reducing direct coupling.
- Enforce "service-role key server-only" via config schema + CI checks.
- RLS test suite gates every user table (see `../database/RLS_STRATEGY.md`).
- Standard SQL migrations ease a future migration off the platform if needed.

## Explicit non-choices

- ❌ Google Sheets (or any spreadsheet) as a primary database — prohibited.
- ❌ Storing secrets in clients or the repo.
- ❌ Schema changes outside of tracked migrations.
