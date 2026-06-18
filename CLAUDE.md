# CLAUDE.md — Alta Universe Project Rules

> These are **permanent** project rules. They apply to every contributor and to
> any AI assistance. Changing a rule requires a documented decision (ADR) and
> explicit human approval. When in doubt, choose the more private, more
> conservative option.

## 0. What Alta Universe is (and is not)

Alta Universe is a human-centered personal intelligence and lifestyle ecosystem
of three connected domains: **AltaMind** (understand yourself), **AltaWear**
(express yourself), **AltaLab** (care for yourself).

It is **not** a productivity app, a generic journal, a fashion store, a beauty
review platform, a medical diagnosis system, or an AI that makes final life
decisions. See `docs/product/PRODUCT_VISION.md` and
`docs/product/DOMAIN_BOUNDARIES.md`. Features that push toward those anti-goals
require an ADR before any work.

## 1. Language & code quality

- **Strict TypeScript** everywhere (`strict: true`). Avoid `any`; justify any
  unavoidable escape hatch in a comment.
- Shared logic lives in `packages/` (domain, validation, types, ui,
  design-tokens). **Apps are thin.** Do not duplicate rules across surfaces.
- `packages/domain` is **pure** (no I/O) and must be unit-tested.
- One-way dependency direction: apps → packages; packages never import apps;
  no circular dependencies.

## 2. Secrets

- **No secrets in source code** or the repository — ever.
- Env vars are described by a schema in `packages/config`; values stay in
  git-ignored local files or the server environment.
- The Supabase **service-role key** and any provider keys are **server-only**
  (Edge Functions). Never bundle them into web/mobile/admin clients.
- Secret scanning runs in CI and must pass.

## 3. Database & schema

- **Migrations only.** All schema changes are SQL migrations in
  `supabase/migrations/`, tracked in Git, applied in order. No ad-hoc dashboard
  changes. Never edit an applied migration; add a new one.
- **RLS is mandatory.** Every user-exposed table enables Row Level Security with
  owner-scoped policies (`user_id = auth.uid()`), authored in the **same**
  migration that creates the table. See `docs/database/RLS_STRATEGY.md`.
- DB types in `packages/database` are generated from the schema and regenerated
  after each migration.
- **No Google Sheets (or any spreadsheet) as a primary database.**

## 4. Privacy by design

- User-owned private data; least-privilege access everywhere.
- **Admin cannot read private entries by default** — enforced structurally
  (separate app, no grant on private tables, RLS on).
- **No private text or images in analytics**, ever. Analytics use the contract
  in `packages/analytics` (metadata/aggregates only).
- Users can **export and delete** their data; these run via audited Edge
  Functions, never via admin browsing.
- **Audit privileged operations** (`ops_audit_log`).
- See `docs/security/PRIVACY_AND_SECURITY.md`.

## 5. AI rules

- AI processing is **opt-in** and **off by default**; nothing AI-driven runs
  without explicit per-user consent.
- **No hidden AI decisions.** When AI is involved, it is clearly labeled in the
  UI and its outputs are framed as reflection/education.
- **AI must not diagnose medical conditions** or make final decisions for the
  user.
- All AI calls run server-side (Edge Functions); prompts/keys never in clients;
  inputs are minimized.
- When AI is added, default to the latest, most capable Claude models.

## 6. UI & design

- **Accessibility is required:** target WCAG 2.1 AA (contrast, keyboard, focus,
  labels, touch targets, reduced motion, theme/text-size respect).
- **Responsive design** on all surfaces (mobile-first web; capture-optimized
  mobile; desktop-first admin that still works on tablet).
- **Reusable components** belong in `packages/ui`; consume tokens from
  `packages/design-tokens`. Don't reinvent primitives per app.
- No dark patterns, no streak pressure, no consumption nudges.

## 7. Testing & completion

- **Tests are written before a task/phase is considered complete.**
- Every user table must have **passing RLS tests** (owner-only; anon denied;
  operator denied) before it ships.
- Heaviest test coverage in `packages/domain` and `packages/validation`.
- Lint, typecheck, and tests must be green in CI.

## 8. Development data

- Use **development/synthetic data only** during development and testing.
- **No production or real user data** in dev, test, fixtures, or seeds.
- Seed via `supabase/seed.sql` with development-only data.

## 9. Deployment

- **No production deployment without explicit human approval.** Automation may
  prepare/stage, but a human authorizes any production release.

## 10. Working method

- Architecture/decisions are documented before implementation; irreversible
  product decisions get an ADR in `docs/decisions/`.
- Stay within the stated MVP scope (`docs/product/MVP_SCOPE.md`); do not add
  features beyond it without a decision.
- Build one connected system — not multiple disconnected apps.
- Follow the phased plan in `IMPLEMENTATION_ROADMAP.md`; each phase is
  independently testable with explicit acceptance criteria.

## 11. Key references

- Product: `docs/product/*`
- Architecture: `docs/architecture/*`
- Database: `docs/database/*`
- Security: `docs/security/PRIVACY_AND_SECURITY.md`
- Design: `docs/design/DESIGN_HANDOFF_REQUIREMENTS.md`
- Decisions: `docs/decisions/ADR-00{1,2,3}-*.md`
- Roadmap: `IMPLEMENTATION_ROADMAP.md`
