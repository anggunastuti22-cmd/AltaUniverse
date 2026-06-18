-- 0001_init_extensions_helpers.sql
-- Alta Universe data foundation: extensions, enum types, and shared helpers.
--
-- Conventions (CLAUDE.md §3, docs/database/*):
--   * UUID primary keys (gen_random_uuid()).
--   * Every private table carries user_id -> auth.users(id) and is RLS-owner-scoped.
--   * created_at / updated_at on every table; updated_at maintained by trigger.
--   * Enums only for stable-lifecycle value sets; CHECK constraints elsewhere.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enum types (stable lifecycles). New values can be added with ALTER TYPE.
-- ---------------------------------------------------------------------------
create type app_role as enum ('admin');
create type consent_type as enum ('ai_processing', 'analytics', 'notifications');
create type theme_preference as enum ('system', 'light', 'dark');
create type measurement_units as enum ('metric', 'imperial');
create type notification_type as enum ('routine_reminder', 'weekly_review', 'system');
create type storage_bucket as enum ('avatars', 'wardrobe-images', 'skin-images', 'content-assets');
create type goal_status as enum ('active', 'paused', 'achieved', 'dropped');
create type decision_status as enum ('open', 'resolved', 'archived');
create type skin_type as enum ('dry', 'oily', 'combination', 'normal', 'sensitive');
create type routine_time as enum ('am', 'pm');
create type wishlist_status as enum ('considering', 'purchased', 'dismissed');
create type experiment_status as enum ('planned', 'active', 'concluded', 'abandoned');

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin check is defined in 0002_core.sql (after user_roles exists), because a
-- LANGUAGE sql function body is validated against referenced tables at creation.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Helper to apply the standard owner-scoped setup to a private table that has
-- a `user_id` column: enable RLS, grant CRUD to `authenticated`, create the
-- four owner policies, and attach the updated_at trigger. Reduces repetition
-- and guarantees every private table is protected identically.
-- ---------------------------------------------------------------------------
create or replace function public.setup_owned_table(tbl regclass)
returns void
language plpgsql
as $$
declare
  t text := tbl::text;
begin
  execute format('alter table %s enable row level security', t);
  execute format('grant select, insert, update, delete on %s to authenticated', t);
  execute format('grant all on %s to service_role', t);

  execute format(
    'create policy owner_select on %s for select to authenticated using (user_id = auth.uid())', t);
  execute format(
    'create policy owner_insert on %s for insert to authenticated with check (user_id = auth.uid())', t);
  execute format(
    'create policy owner_update on %s for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  execute format(
    'create policy owner_delete on %s for delete to authenticated using (user_id = auth.uid())', t);

  execute format(
    'create trigger trg_set_updated_at before update on %s for each row execute function public.set_updated_at()', t);
end;
$$;
revoke all on function public.setup_owned_table(regclass) from public;
