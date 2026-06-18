-- 0005_altalab.sql
-- AltaLab: product catalogue (public), user cabinet, skin profile, routines,
-- routine steps, skin logs, experiments. Educational/non-diagnostic.
-- Catalogue is public-read + admin-write; everything else is private/owner-scoped.

-- ---------------------------------------------------------------------------
-- lab_products — SHARED catalogue. Public read of published rows; admin writes.
-- ---------------------------------------------------------------------------
create table lab_products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 200),
  brand         text,
  category      text not null check (char_length(category) between 1 and 60),
  key_ingredients text[] not null default '{}',
  is_published  boolean not null default false,
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table lab_products is 'Shared skincare product catalogue. Public read when published; admin-managed. Operational data (not user-private).';
create index idx_lab_products_category on lab_products (category);
create index idx_lab_products_published on lab_products (is_published);

alter table lab_products enable row level security;
grant select on lab_products to anon, authenticated;
grant insert, update, delete on lab_products to authenticated; -- gated to admins by policy
grant all on lab_products to service_role;
create policy public_read_published on lab_products for select to anon, authenticated
  using (is_published);
create policy admin_read_all on lab_products for select to authenticated
  using (public.is_admin());
create policy admin_write on lab_products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create trigger trg_set_updated_at before update on lab_products for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- lab_user_products — user's cabinet; may link to a catalogue product.
-- ---------------------------------------------------------------------------
create table lab_user_products (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  product_id  uuid references lab_products (id) on delete restrict,
  custom_name text,
  opened_on   date,
  price_paid  numeric(12, 2) check (price_paid is null or price_paid >= 0),
  currency    text not null default 'USD' check (char_length(currency) = 3),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint cabinet_named check (product_id is not null or custom_name is not null)
);
comment on table lab_user_products is 'User skincare cabinet. Private; deleted on account deletion. Catalogue products cannot be deleted while referenced (RESTRICT).';
create index idx_lab_user_products_user on lab_user_products (user_id);
create index idx_lab_user_products_product on lab_user_products (product_id);
select public.setup_owned_table('lab_user_products');

-- ---------------------------------------------------------------------------
-- lab_skin_profiles — self-described baseline. NOT a diagnosis.
-- ---------------------------------------------------------------------------
create table lab_skin_profiles (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  skin_type     skin_type,
  concerns      text[] not null default '{}',
  sensitivities text[] not null default '{}',
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table lab_skin_profiles is 'Self-reported skin baseline (NOT a medical diagnosis). Private high-sensitivity; deleted on account deletion.';
select public.setup_owned_table('lab_skin_profiles');

-- ---------------------------------------------------------------------------
-- lab_routines
-- ---------------------------------------------------------------------------
create table lab_routines (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  time_of_day  routine_time not null,
  name         text not null check (char_length(name) between 1 and 120),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table lab_routines is 'Morning/evening skincare routines. Private; deleted on account deletion.';
create index idx_lab_routines_user_time on lab_routines (user_id, time_of_day);
select public.setup_owned_table('lab_routines');

-- ---------------------------------------------------------------------------
-- lab_routine_steps — ordered steps referencing cabinet products.
-- ---------------------------------------------------------------------------
create table lab_routine_steps (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  routine_id      uuid not null references lab_routines (id) on delete cascade,
  user_product_id uuid references lab_user_products (id) on delete set null,
  step_order      integer not null,
  instruction     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (routine_id, step_order)
);
comment on table lab_routine_steps is 'Routine steps. Private; cascade-deleted with routine/account.';
create index idx_lab_routine_steps_routine on lab_routine_steps (routine_id);
select public.setup_owned_table('lab_routine_steps');

-- ---------------------------------------------------------------------------
-- lab_skin_logs — dated observations (text + optional private image).
-- ---------------------------------------------------------------------------
create table lab_skin_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  observed_on date not null default current_date,
  note        text check (note is null or char_length(note) <= 4000),
  image_path  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table lab_skin_logs is 'Self-reported skin observations (skin-images bucket for photos). Private high-sensitivity; never enters analytics; deleted on account deletion.';
create index idx_lab_skin_logs_user_date on lab_skin_logs (user_id, observed_on desc);
select public.setup_owned_table('lab_skin_logs');

-- ---------------------------------------------------------------------------
-- lab_experiments — product trials.
-- ---------------------------------------------------------------------------
create table lab_experiments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  hypothesis      text not null check (char_length(hypothesis) between 1 and 2000),
  user_product_id uuid references lab_user_products (id) on delete set null,
  status          experiment_status not null default 'planned',
  started_on      date,
  ended_on        date,
  outcome         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint experiment_dates check (ended_on is null or started_on is null or ended_on >= started_on)
);
comment on table lab_experiments is 'Product experiment journal. Private; deleted on account deletion.';
create index idx_lab_experiments_user_status on lab_experiments (user_id, status);
select public.setup_owned_table('lab_experiments');
