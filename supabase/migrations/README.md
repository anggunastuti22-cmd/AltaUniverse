# Supabase migrations

All schema changes are SQL migrations, tracked in Git and applied in order
(CLAUDE.md §3, ADR-002).

## Rules

- **Migrations only.** No ad-hoc dashboard changes.
- **Never edit an applied migration** — add a new one.
- **RLS is authored in the same migration** that creates a user-exposed table
  (see `docs/database/RLS_STRATEGY.md`).
- After any migration, regenerate database types: `pnpm db:types`.

## Workflow

```bash
# Create a new migration
supabase migration new <name>

# Apply migrations + seed to the local stack
supabase db reset

# Regenerate typed schema for packages/database
pnpm db:types
```

No migrations exist yet — the core schema is introduced in a later phase
(see `IMPLEMENTATION_ROADMAP.md`). This foundation phase only sets up the
tooling and folder structure.
