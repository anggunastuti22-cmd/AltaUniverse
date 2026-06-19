# Alta Universe — Row Level Security (RLS) Strategy

> Status: Implemented (MVP) — policies ship in `supabase/migrations/` (0001–0013)
> and are verified by pgTAP (`supabase/tests/`, incl. a schema-wide RLS coverage
> test). Conceptual table names below map to live names per the table in
> `INITIAL_DATA_MODEL.md` (e.g. `ops_audit_log`→`audit_events`, private
> `core_*`→`profiles`/`user_*`, `ops_products`→`lab_products`).
> Last updated: 2026-06-19

RLS is **mandatory** on every user-exposed table. This document defines the
default policies, role model, and verification approach. Policies ship as part
of migrations (ADR-002), never added manually in production.

## 1. Principles

1. **Deny by default.** Enable RLS on every table; grant nothing implicitly.
2. **Owner-scoped access.** A user can touch only rows where
   `user_id = auth.uid()`.
3. **Admin has no private data grant.** Admin operates on operational/public
   tables and anonymized views only.
4. **Privileged work runs server-side.** The service role (Edge Functions) is
   the only context that can act broadly, and it is audited.
5. **Policies are code.** They live in migrations and are tested.

## 2. Role model

| Role               | Who                     | Capability                                                                                       |
| ------------------ | ----------------------- | ------------------------------------------------------------------------------------------------ |
| `anon`             | Unauthenticated visitor | Read published public content only.                                                              |
| `authenticated`    | Signed-in user          | CRUD own rows via RLS on private tables; read public content.                                    |
| `operator` (admin) | Platform operator       | CRUD operational/public tables; read anonymized reporting views. **No grant on private tables.** |
| `service_role`     | Edge Functions only     | Elevated; used for export/deletion/audited tasks. Never in clients.                              |

## 3. Default policy patterns

### 3.1 Private, owner-scoped table (the common case)

```sql
alter table mind_journal_entries enable row level security;

create policy "own_select" on mind_journal_entries
  for select using (user_id = auth.uid());

create policy "own_insert" on mind_journal_entries
  for insert with check (user_id = auth.uid());

create policy "own_update" on mind_journal_entries
  for update using (user_id = auth.uid())
             with check (user_id = auth.uid());

create policy "own_delete" on mind_journal_entries
  for delete using (user_id = auth.uid());
```

This pattern applies to all `mind_*`, `wear_*`, `lab_*`, and private `core_*`
tables.

### 3.2 Child tables (join/owned rows)

Child rows also carry `user_id` and use the same owner-scoped policies, so a
single predicate (`user_id = auth.uid()`) enforces ownership without expensive
parent lookups. Foreign keys still guarantee referential integrity to the
parent.

### 3.3 Public content (read-only to everyone)

```sql
alter table ops_articles enable row level security;

create policy "public_read_published" on ops_articles
  for select using (status = 'published');

-- writes restricted to operator role via grants + policy
create policy "operator_write" on ops_articles
  for all using (auth.jwt() ->> 'role' = 'operator')
          with check (auth.jwt() ->> 'role' = 'operator');
```

### 3.4 Operational tables (operator-managed)

Same shape as public content: public read on the published subset, writes gated
to the operator role. Private user tables are **never** granted to the operator
role at all.

## 4. Storage (image) policies

- Private buckets for `wear_item_images` and `lab_observations` images.
- Object paths are prefixed by `user_id` (e.g., `wear/{user_id}/{item_id}/...`).
- Storage policies require the path's user segment to equal `auth.uid()` for
  read/write.
- Access is via short-lived signed URLs; no public bucket for private images.

## 5. Privileged operations (service role)

- **Data export** and **account deletion** run in Edge Functions using the
  service role, which can read/aggregate/delete a user's rows after verifying
  the request belongs to that user.
- Every such operation writes an `ops_audit_log` entry.
- The service-role key exists only in the server environment, never shipped to
  any client (enforced by `CLAUDE.md` rules and config schema).

## 6. Admin and analytics

- Admin reads analytics **only** from anonymized reporting views that exclude
  `user_id` and all private text/images.
- The operator role has **no select grant** on any private table; even a bug in
  the admin app cannot read private data because the grant does not exist.

## 7. Verification (definition of "RLS done")

For every private table:

1. RLS is enabled.
2. A user can read/write **only** their own rows (positive + negative tests).
3. `anon` cannot read it at all.
4. The `operator` role cannot read it at all.
5. Storage objects follow the same ownership rule.

Tests live alongside migrations / in a dedicated test area and run in CI. A
table without passing RLS tests is **not** considered shippable.

## 8. Change management

- Adding a table = adding its RLS policies in the **same** migration.
- A migration that adds a user-exposed table without RLS fails review.
- Loosening any private-data policy requires an ADR and explicit human approval.
