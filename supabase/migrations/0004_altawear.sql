-- 0004_altawear.sql
-- AltaWear: style profile, items, item images, outfits, outfit items, usage
-- logs, wishlist. All private and owner-scoped. Deleted on account deletion.
-- Cost-per-wear is derived in packages/domain, never stored.

-- ---------------------------------------------------------------------------
-- wear_style_profiles — one per user.
-- ---------------------------------------------------------------------------
create table wear_style_profiles (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  preferred_colors text[] not null default '{}',
  preferred_fits   text[] not null default '{}',
  occasions        text[] not null default '{}',
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on table wear_style_profiles is 'Per-user style preferences. Private; deleted on account deletion.';
select public.setup_owned_table('wear_style_profiles');

-- ---------------------------------------------------------------------------
-- wear_items — wardrobe inventory.
-- ---------------------------------------------------------------------------
create table wear_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 160),
  category    text not null check (char_length(category) between 1 and 60),
  brand       text,
  color       text,
  material    text,
  price       numeric(12, 2) check (price is null or price >= 0),
  currency    text not null default 'USD' check (char_length(currency) = 3),
  acquired_on date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table wear_items is 'Wardrobe items. Private; deleted on account deletion. price + usage logs feed derived cost-per-wear.';
create index idx_wear_items_user_category on wear_items (user_id, category);
select public.setup_owned_table('wear_items');

-- ---------------------------------------------------------------------------
-- wear_item_images — references objects in the private wardrobe-images bucket.
-- ---------------------------------------------------------------------------
create table wear_item_images (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  item_id      uuid not null references wear_items (id) on delete cascade,
  storage_path text not null,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (item_id, storage_path)
);
comment on table wear_item_images is 'Wardrobe item images (wardrobe-images bucket). Private; cascade-deleted with item / account.';
create index idx_wear_item_images_item on wear_item_images (item_id);
create index idx_wear_item_images_user on wear_item_images (user_id);
select public.setup_owned_table('wear_item_images');

-- ---------------------------------------------------------------------------
-- wear_outfits
-- ---------------------------------------------------------------------------
create table wear_outfits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 160),
  occasion   text,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table wear_outfits is 'Composed outfits. Private; deleted on account deletion.';
create index idx_wear_outfits_user on wear_outfits (user_id);
select public.setup_owned_table('wear_outfits');

-- ---------------------------------------------------------------------------
-- wear_outfit_items — join of outfits <-> items (both cascade).
-- ---------------------------------------------------------------------------
create table wear_outfit_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  outfit_id  uuid not null references wear_outfits (id) on delete cascade,
  item_id    uuid not null references wear_items (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (outfit_id, item_id)
);
comment on table wear_outfit_items is 'Outfit composition. Private; cascade-deleted with parent.';
create index idx_wear_outfit_items_outfit on wear_outfit_items (outfit_id);
create index idx_wear_outfit_items_item on wear_outfit_items (item_id);
select public.setup_owned_table('wear_outfit_items');

-- ---------------------------------------------------------------------------
-- wear_usage_logs — records of outfits/items worn (feeds cost-per-wear).
-- ---------------------------------------------------------------------------
create table wear_usage_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  worn_on    date not null default current_date,
  outfit_id  uuid references wear_outfits (id) on delete cascade,
  item_id    uuid references wear_items (id) on delete cascade,
  note       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint usage_targets_something check (outfit_id is not null or item_id is not null)
);
comment on table wear_usage_logs is 'Wear/usage events. Private; deleted with item/outfit/account.';
create index idx_wear_usage_user_date on wear_usage_logs (user_id, worn_on desc);
create index idx_wear_usage_item on wear_usage_logs (item_id);
create index idx_wear_usage_outfit on wear_usage_logs (outfit_id);
select public.setup_owned_table('wear_usage_logs');

-- ---------------------------------------------------------------------------
-- wear_wishlist — mindful-purchase candidates.
-- ---------------------------------------------------------------------------
create table wear_wishlist (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 160),
  reason     text,
  status     wishlist_status not null default 'considering',
  est_price  numeric(12, 2) check (est_price is null or est_price >= 0),
  currency   text not null default 'USD' check (char_length(currency) = 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table wear_wishlist is 'Wishlist (reflection, not a buy button). Private; deleted on account deletion.';
create index idx_wear_wishlist_user_status on wear_wishlist (user_id, status);
select public.setup_owned_table('wear_wishlist');
