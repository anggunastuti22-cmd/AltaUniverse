# ADR-001: Adopt a TypeScript Monorepo

> Status: Accepted
> Date: 2026-06-18
> Deciders: Product Architecture

## Context

Alta Universe ships three client surfaces — public + authenticated web (Next.js),
mobile (Expo React Native), and a separate admin console (Next.js) — over one
Supabase backend. These surfaces must share an identity model, domain rules
(e.g., cost-per-wear, routine cost, one-check-in-per-day), validation, types, and
design tokens. The product thesis is "one identity across three domains," which
demands that the same rules behave identically everywhere.

Options considered:

1. **Polyrepo** — one repo per app/package. Strong isolation but high friction
   sharing types/logic; version skew between surfaces; duplicated rules drift.
2. **Monorepo (TypeScript)** — all apps and shared packages in one repo with a
   workspace tool.

## Decision

Adopt a single **TypeScript monorepo** using **pnpm workspaces** with
**Turborepo** (proposed) as the task runner. Structure:

```
apps/      web, mobile, admin
packages/  ui, design-tokens, database, domain, validation, analytics, config
supabase/  migrations, functions, seed.sql, config.toml
docs/      product, architecture, database, security, design, decisions
```

Shared logic lives in `packages/`; apps are thin consumers. Dependency direction
is one-way (apps → packages; packages never import apps; `domain` stays I/O-free).

## Consequences

**Positive**

- One source of truth for types, domain rules, validation, and design tokens.
- Atomic changes across backend contract + all consumers in a single PR.
- Consistent tooling (TS strict, lint, test) and cached builds via Turborepo.
- Easier enforcement of architectural rules (import boundaries, no secrets).

**Negative / costs**

- More upfront tooling setup (workspace, task pipeline, CI caching).
- CI must be smart about affected-package builds to stay fast.
- Requires discipline on dependency boundaries to avoid a "big ball of mud."

**Mitigations**

- Enforce import boundaries and no-cycles in CI.
- Keep `domain` pure and well-tested as the architectural anchor.

## Alternatives rejected

- **Polyrepo:** rejected due to logic/type drift across surfaces, which directly
  threatens the "one identity, consistent rules" requirement.
- **Nx instead of Turborepo:** viable; deferred. Turborepo chosen for
  simplicity; revisit if task-graph needs grow.
