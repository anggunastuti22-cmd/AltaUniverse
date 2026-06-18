# Alta Universe — Schema & RLS Policy Reference

> Status: Implemented (MVP data foundation)
> Last updated: 2026-06-18

Authoritative reference for the migrations under `supabase/migrations/`. This
phase implements the MVP data model only (no AI). All schema changes are
migrations (CLAUDE.md §3); RLS ships in the same migrations (ADR-002).

> Naming note: this phase uses the table names specified for the data-foundation
> task (e.g. `profiles`, `user_preferences`, `wear_usage_logs`,
> `lab_skin_profiles`). These supersede the earlier illustrative `core_*` names
> in `INITIAL_DATA_MODEL.md`.

## Migration list

| File                               | Contents                                                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `0001_init_extensions_helpers.sql` | `pgcrypto`; enum types; `set_updated_at()`, `setup_owned_table()` helpers                                           |
| `0002_core.sql`                    | profiles, user_preferences, user_consents, user_roles, `is_admin()`, notifications, media_assets, audit_events      |
| `0003_altamind.sql`                | mind_life_domains, mind_checkins, mind_journal_entries, mind_goals, mind_weekly_reviews, mind_decisions             |
| `0004_altawear.sql`                | wear_style_profiles, wear_items, wear_item_images, wear_outfits, wear_outfit_items, wear_usage_logs, wear_wishlist  |
| `0005_altalab.sql`                 | lab_products, lab_user_products, lab_skin_profiles, lab_routines, lab_routine_steps, lab_skin_logs, lab_experiments |
| `0006_storage.sql`                 | storage buckets + object-level policies                                                                             |

## Table summary (27 tables)

| Table                | Class            | Owner key          | Notes / retention                                              |
| -------------------- | ---------------- | ------------------ | -------------------------------------------------------------- |
| profiles             | private          | `id`=auth.uid      | one per user; cascade on account deletion                      |
| user_preferences     | private          | user_id            | one per user                                                   |
| user_consents        | private          | user_id            | unique (user_id, consent_type); AI off by default              |
| user_roles           | privileged       | user_id (read own) | writes via service role only (no self-grant)                   |
| notifications        | private          | user_id            | system-inserted; templated text only                           |
| media_assets         | mixed            | user_id / admin    | avatars (user) + content-assets (admin, public when published) |
| audit_events         | server-only      | —                  | append-only; retained past deletion (actor set null)           |
| mind_life_domains    | private          | user_id            |                                                                |
| mind_checkins        | private          | user_id            | unique (user_id, checkin_date) — one/day                       |
| mind_journal_entries | private (high)   | user_id            | never enters analytics                                         |
| mind_goals           | private          | user_id            |                                                                |
| mind_weekly_reviews  | private          | user_id            | unique (user_id, week_start)                                   |
| mind_decisions       | private (high)   | user_id            | JSONB options/factors (array-constrained); reflective only     |
| wear_style_profiles  | private          | user_id            | one per user                                                   |
| wear_items           | private          | user_id            | price feeds derived cost-per-wear                              |
| wear_item_images     | private          | user_id            | wardrobe-images bucket; cascade w/ item                        |
| wear_outfits         | private          | user_id            |                                                                |
| wear_outfit_items    | private          | user_id            | unique (outfit_id, item_id); cascade                           |
| wear_usage_logs      | private          | user_id            | cascade w/ item/outfit                                         |
| wear_wishlist        | private          | user_id            | reflection, not a buy button                                   |
| lab_products         | public catalogue | —                  | public read of published; admin write                          |
| lab_user_products    | private          | user_id            | catalogue link is RESTRICT                                     |
| lab_skin_profiles    | private (high)   | user_id            | self-reported, NOT a diagnosis                                 |
| lab_routines         | private          | user_id            |                                                                |
| lab_routine_steps    | private          | user_id            | unique (routine_id, step_order); cascade                       |
| lab_skin_logs        | private (high)   | user_id            | skin-images bucket; never enters analytics                     |
| lab_experiments      | private          | user_id            |                                                                |

All tables have `created_at` + `updated_at` (trigger-maintained), UUID PKs, and
`user_id` → `auth.users(id)` (cascade) except `audit_events` (set null) and the
public `lab_products`.

## Policy matrix

Roles: `anon` (unauthenticated), `authenticated` (signed-in user; an **admin**
is an authenticated user whose `user_roles` row makes `is_admin()` true),
`service_role` (server/Edge Functions; BYPASSRLS).

| Table group                                                                                                                                                    | anon                          | authenticated (owner) | authenticated (other user) | admin (authenticated)                             | service_role        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | --------------------- | -------------------------- | ------------------------------------------------- | ------------------- |
| Private tables (mind*\*, wear*_, lab*user_products, lab_skin*_, lab_routines/steps, lab_experiments, profiles, user_preferences, user_consents, notifications) | no grant → denied             | full CRUD on own rows | denied (filtered/blocked)  | **no special access** (treated as any other user) | full (server path)  |
| user_roles                                                                                                                                                     | denied                        | read own only         | denied                     | read own only                                     | full (grants roles) |
| lab_products (catalogue)                                                                                                                                       | read published                | read published        | read published             | read all + write                                  | full                |
| media_assets                                                                                                                                                   | read published content-assets | CRUD own media        | denied for others          | manage content-assets                             | full                |
| audit_events                                                                                                                                                   | denied                        | denied                | denied                     | denied                                            | read/append only    |

Owner predicate is `user_id = auth.uid()` (or `id = auth.uid()` for profiles).
Admins deliberately have **no policy** on private tables, so admin access to
private journal/skin content is structurally impossible — privileged work goes
through the audited service-role server path.

## Storage buckets & policies

| Bucket            | Public? | Read                                                                | Write                         |
| ----------------- | ------- | ------------------------------------------------------------------- | ----------------------------- |
| `avatars`         | yes     | public                                                              | owner folder only (`<uid>/…`) |
| `wardrobe-images` | no      | owner folder only                                                   | owner folder only             |
| `skin-images`     | no      | owner folder only (no public URLs)                                  | owner folder only             |
| `content-assets`  | no      | public **only when** the matching `media_assets` row `is_published` | admin only                    |

Ownership is enforced by `(storage.foldername(name))[1] = auth.uid()::text`.

## Tests

pgTAP tests under `supabase/tests/` cover: owner access, cross-user denial,
unauthenticated denial, public catalogue access, admin boundary, role
self-grant denial, service-role access, audit isolation, storage ownership, and
account-deletion cascade + audit retention.

- With Docker: `supabase test db`.
- Without Docker: `pnpm db:test:local` (spins up a throwaway PostgreSQL cluster
  and applies `_shim.sql`, which emulates Supabase's `auth`/`storage` preamble).

## Type generation

- With Docker: `pnpm db:types` (`supabase gen types typescript --local`).
- Without Docker: `DATABASE_URL=… pnpm db:types:local` (introspects a running
  Postgres via `psql`). Output: `packages/database/src/types.gen.ts`.
