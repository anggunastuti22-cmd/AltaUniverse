# Database tests

pgTAP tests for the Alta Universe schema: RLS ownership, cross-user/anon denial,
public catalogue access, admin boundary, storage ownership, and account-deletion
behavior.

## Running

**With Docker (canonical):**

```bash
supabase start
supabase test db
```

**Without Docker:**

```bash
pnpm db:test:local        # supabase/tests/run-local.sh
```

`run-local.sh` starts a throwaway PostgreSQL cluster, applies `_shim.sql`,
the migrations, and the `*.test.sql` files. Requires PostgreSQL server binaries
and the pgTAP extension (`postgresql-NN-pgtap`).

## Files

- `_shim.sql` — TEST ONLY. Emulates the Supabase preamble (roles `anon` /
  `authenticated` / `service_role`, the `auth` schema + `auth.uid()`, and the
  `storage` schema). Never applied to a real database.
- `rls.test.sql` — table-level RLS behavior.
- `storage.test.sql` — storage object ownership & visibility.
- `deletion.test.sql` — account-deletion cascade + audit retention.
