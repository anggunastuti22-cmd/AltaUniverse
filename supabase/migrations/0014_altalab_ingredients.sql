-- 0014_altalab_ingredients.sql
-- AltaLab ingredient model (ADR-004): normalize ingredients into clickable
-- catalogue entities, link them to products, and add admin-curated, generic
-- educational pairing notes keyed by ingredient class. All catalogue data:
-- public-read when published, admin-write. No user-private data here.
--
-- Boundary (ADR-004 / DOMAIN_BOUNDARIES): pairing notes are generic, class-level
-- education — never personalized, never a block, never medical advice.

-- Controlled vocabulary for pairing awareness. Kept deliberately small; extend
-- via a follow-up migration as the catalogue grows.
create type ingredient_class as enum (
  'retinoid',
  'aha',
  'bha',
  'vitamin_c',
  'niacinamide',
  'benzoyl_peroxide',
  'peptide',
  'hydrator',
  'ceramide',
  'spf',
  'antioxidant',
  'exfoliant_physical',
  'other'
);

-- ---------------------------------------------------------------------------
-- lab_ingredients — SHARED, clickable ingredient entity.
-- ---------------------------------------------------------------------------
create table lab_ingredients (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null check (char_length(name) between 1 and 120),
  inci_name   text,
  class       ingredient_class,
  summary     text check (summary is null or char_length(summary) <= 2000),
  is_published boolean not null default false,
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table lab_ingredients is 'Shared, clickable skincare ingredient catalogue. Generic education only (ADR-004). Public read when published; admin-managed.';
create index idx_lab_ingredients_class on lab_ingredients (class);
create index idx_lab_ingredients_published on lab_ingredients (is_published);

alter table lab_ingredients enable row level security;
grant select on lab_ingredients to anon, authenticated;
grant insert, update, delete on lab_ingredients to authenticated; -- gated to admins by policy
grant all on lab_ingredients to service_role;
create policy public_read_published on lab_ingredients for select to anon, authenticated
  using (is_published);
create policy admin_read_all on lab_ingredients for select to authenticated
  using (public.is_admin());
create policy admin_write on lab_ingredients for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create trigger trg_set_updated_at before update on lab_ingredients
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- lab_product_ingredients — products <-> ingredients (many-to-many).
-- Readable only for ingredients of PUBLISHED products (and to admins), so
-- unpublished product composition never leaks.
-- ---------------------------------------------------------------------------
create table lab_product_ingredients (
  product_id    uuid not null references lab_products (id) on delete cascade,
  ingredient_id uuid not null references lab_ingredients (id) on delete cascade,
  primary key (product_id, ingredient_id)
);
comment on table lab_product_ingredients is 'Join: which ingredients a catalogue product contains. Read-gated to published products (ADR-004); admin-write.';
create index idx_lab_product_ingredients_ingredient on lab_product_ingredients (ingredient_id);

alter table lab_product_ingredients enable row level security;
grant select on lab_product_ingredients to anon, authenticated;
grant insert, update, delete on lab_product_ingredients to authenticated; -- gated to admins by policy
grant all on lab_product_ingredients to service_role;
create policy public_read_for_published on lab_product_ingredients for select to anon, authenticated
  using (exists (select 1 from lab_products p where p.id = product_id and p.is_published));
create policy admin_read_all on lab_product_ingredients for select to authenticated
  using (public.is_admin());
create policy admin_write on lab_product_ingredients for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- lab_ingredient_pairings — admin-curated, generic educational notes keyed by
-- an UNORDERED pair of ingredient classes. Stored in canonical order
-- (class_a < class_b) so each pair is unique. NOT advice; NOT personalized.
-- ---------------------------------------------------------------------------
create table lab_ingredient_pairings (
  id          uuid primary key default gen_random_uuid(),
  class_a     ingredient_class not null,
  class_b     ingredient_class not null,
  note        text not null check (char_length(note) between 1 and 2000),
  source      text,
  is_published boolean not null default false,
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint pairing_canonical_order check (class_a < class_b),
  unique (class_a, class_b)
);
comment on table lab_ingredient_pairings is 'Generic, admin-curated educational notes about ingredient-class pairs commonly used with care together (ADR-004). Not medical advice; not personalized; never used to block.';

alter table lab_ingredient_pairings enable row level security;
grant select on lab_ingredient_pairings to anon, authenticated;
grant insert, update, delete on lab_ingredient_pairings to authenticated; -- gated to admins by policy
grant all on lab_ingredient_pairings to service_role;
create policy public_read_published on lab_ingredient_pairings for select to anon, authenticated
  using (is_published);
create policy admin_read_all on lab_ingredient_pairings for select to authenticated
  using (public.is_admin());
create policy admin_write on lab_ingredient_pairings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create trigger trg_set_updated_at before update on lab_ingredient_pairings
  for each row execute function public.set_updated_at();
