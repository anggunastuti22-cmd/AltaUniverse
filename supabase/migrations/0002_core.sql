-- 0002_core.sql
-- Alta Core: identity, preferences, consent, roles, notifications, media, audit.
--
-- Retention/deletion: all user-owned rows cascade-delete when the auth.users
-- row is removed (account deletion). audit_events are retained with the actor
-- reference nulled (see below).

-- ---------------------------------------------------------------------------
-- profiles — one unified profile per Alta ID (id == auth.users.id).
-- ---------------------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  locale      text not null default 'en' check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  timezone    text not null default 'UTC' check (char_length(timezone) between 1 and 64),
  avatar_path text,
  onboarded_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table profiles is 'One profile per user. Deleted on account deletion (cascade from auth.users).';

alter table profiles enable row level security;
grant select, insert, update on profiles to authenticated;
grant all on profiles to service_role;
create policy owner_select on profiles for select to authenticated using (id = auth.uid());
create policy owner_insert on profiles for insert to authenticated with check (id = auth.uid());
create policy owner_update on profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create trigger trg_set_updated_at before update on profiles for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- user_preferences — one row per user.
-- ---------------------------------------------------------------------------
create table user_preferences (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  theme       theme_preference not null default 'system',
  measurement_units measurement_units not null default 'metric',
  notify_routine_reminders boolean not null default true,
  notify_weekly_review boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table user_preferences is 'Per-user settings. Deleted on account deletion.';
select public.setup_owned_table('user_preferences');

-- ---------------------------------------------------------------------------
-- user_consents — granular, revocable consent. AI off by default (CLAUDE.md §5).
-- ---------------------------------------------------------------------------
create table user_consents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  consent_type consent_type not null,
  granted     boolean not null default false,
  granted_at  timestamptz,
  revoked_at  timestamptz,
  policy_version text not null default '2026-06-18',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, consent_type)
);
comment on table user_consents is 'Current consent state per type. Deleted on account deletion; export before deletion for compliance (Edge Function, phase 7).';
select public.setup_owned_table('user_consents');

-- ---------------------------------------------------------------------------
-- user_roles — explicit privileged roles (admin). Managed by service role only;
-- users may read their own roles but never self-grant.
-- ---------------------------------------------------------------------------
create table user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
comment on table user_roles is 'Privileged role grants. Writable only via service role (no self-grant).';
create index idx_user_roles_user on user_roles (user_id);

alter table user_roles enable row level security;
grant select on user_roles to authenticated;
grant all on user_roles to service_role;
-- Users can see their own role rows; no insert/update/delete for authenticated.
create policy owner_select on user_roles for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- is_admin() — defined here, now that user_roles exists. SECURITY DEFINER so it
-- reads user_roles without being blocked by that table's RLS (and without
-- granting users read of others). Never used to grant access to private
-- journal/skin content (see docs/database/RLS_STRATEGY.md).
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- notifications — system-generated; user reads/marks/deletes; insert = service.
-- ---------------------------------------------------------------------------
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  type        notification_type not null,
  title       text not null check (char_length(title) between 1 and 200),
  body        text check (body is null or char_length(body) <= 1000),
  read_at     timestamptz,
  scheduled_for timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table notifications is 'User notifications. Templated content only (no private free text). Deleted on account deletion; time-boxed purge of read items handled operationally.';
create index idx_notifications_user_created on notifications (user_id, created_at desc);
create index idx_notifications_unread on notifications (user_id) where read_at is null;

alter table notifications enable row level security;
grant select, update, delete on notifications to authenticated;
grant all on notifications to service_role;
create policy owner_select on notifications for select to authenticated using (user_id = auth.uid());
create policy owner_update on notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy owner_delete on notifications for delete to authenticated using (user_id = auth.uid());
create trigger trg_set_updated_at before update on notifications for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- media_assets — registry for avatars (per-user) and content-assets (admin).
-- Image rows for wardrobe/skin live in their own domain tables; this table
-- backs the avatars and content-assets buckets.
-- ---------------------------------------------------------------------------
create table media_assets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete cascade,
  bucket      storage_bucket not null,
  path        text not null,
  content_type text,
  byte_size   bigint check (byte_size is null or byte_size >= 0),
  is_published boolean not null default false,
  title       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (bucket, path),
  -- content-assets are admin-owned (user_id null); everything else is user-owned.
  constraint media_owner_or_content check (
    (bucket = 'content-assets') or (user_id is not null)
  )
);
comment on table media_assets is 'File registry. User media deleted on account deletion; content-assets are admin-managed and public only when is_published.';
create index idx_media_assets_user on media_assets (user_id);
create index idx_media_assets_pub on media_assets (bucket, is_published);

alter table media_assets enable row level security;
grant select, insert, update, delete on media_assets to authenticated;
grant select on media_assets to anon;
grant all on media_assets to service_role;
-- Owner manages their own (non content-asset) media.
create policy owner_all on media_assets for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Anyone may read published content-assets.
create policy content_public_read on media_assets for select to anon, authenticated
  using (bucket = 'content-assets' and is_published);
-- Admins manage content-assets.
create policy admin_manage_content on media_assets for all to authenticated
  using (bucket = 'content-assets' and public.is_admin())
  with check (bucket = 'content-assets' and public.is_admin());
create trigger trg_set_updated_at before update on media_assets for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- audit_events — append-only audit of privileged operations. Server-only.
-- ---------------------------------------------------------------------------
create table audit_events (
  id           uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id) on delete set null,
  actor_role   text,
  action       text not null,
  target_table text,
  target_id    uuid,
  metadata     jsonb check (metadata is null or jsonb_typeof(metadata) = 'object'),
  created_at   timestamptz not null default now()
);
comment on table audit_events is 'Append-only audit log (no private user content). Retained beyond account deletion; actor reference set null on deletion. Accessible via service role only.';
create index idx_audit_created on audit_events (created_at desc);
create index idx_audit_actor on audit_events (actor_user_id);
create index idx_audit_target on audit_events (target_table, target_id);

alter table audit_events enable row level security;
-- No grants to anon/authenticated: only the service role (server path) may read/append.
grant select, insert on audit_events to service_role;
