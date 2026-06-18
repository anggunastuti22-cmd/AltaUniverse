-- 0003_altamind.sql
-- AltaMind: check-ins, journal, life domains, goals, weekly reviews, decisions.
-- All tables are private and owner-scoped. Deleted on account deletion.

-- ---------------------------------------------------------------------------
-- mind_life_domains
-- ---------------------------------------------------------------------------
create table mind_life_domains (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 80),
  description text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table mind_life_domains is 'User-defined life areas. Private; deleted on account deletion.';
create index idx_mind_life_domains_user on mind_life_domains (user_id);
select public.setup_owned_table('mind_life_domains');

-- ---------------------------------------------------------------------------
-- mind_checkins — one per local day (enforced by unique constraint).
-- ---------------------------------------------------------------------------
create table mind_checkins (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  checkin_date date not null default current_date,
  mood         smallint check (mood between 1 and 5),
  energy       smallint check (energy between 1 and 5),
  note         text check (note is null or char_length(note) <= 2000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, checkin_date)
);
comment on table mind_checkins is 'Daily check-in (mood/energy/note). One per day per user. Private high-sensitivity.';
create index idx_mind_checkins_user_date on mind_checkins (user_id, checkin_date desc);
select public.setup_owned_table('mind_checkins');

-- ---------------------------------------------------------------------------
-- mind_journal_entries — private free text. Never enters analytics.
-- ---------------------------------------------------------------------------
create table mind_journal_entries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  entry_date    date not null default current_date,
  body          text not null check (char_length(body) between 1 and 20000),
  tags          text[] not null default '{}',
  life_domain_id uuid references mind_life_domains (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table mind_journal_entries is 'Private journal. High-sensitivity; never copied to analytics. Deleted on account deletion.';
create index idx_mind_journal_user_date on mind_journal_entries (user_id, entry_date desc);
create index idx_mind_journal_domain on mind_journal_entries (life_domain_id);
select public.setup_owned_table('mind_journal_entries');

-- ---------------------------------------------------------------------------
-- mind_goals
-- ---------------------------------------------------------------------------
create table mind_goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  life_domain_id uuid references mind_life_domains (id) on delete set null,
  title         text not null check (char_length(title) between 1 and 200),
  detail        text,
  status        goal_status not null default 'active',
  target_date   date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table mind_goals is 'Reflective goals tied to life domains. Private; deleted on account deletion.';
create index idx_mind_goals_user_status on mind_goals (user_id, status);
create index idx_mind_goals_domain on mind_goals (life_domain_id);
select public.setup_owned_table('mind_goals');

-- ---------------------------------------------------------------------------
-- mind_weekly_reviews — one per week start per user.
-- ---------------------------------------------------------------------------
create table mind_weekly_reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  week_start  date not null,
  wins        text,
  friction    text,
  intention   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, week_start)
);
comment on table mind_weekly_reviews is 'Weekly reflection. One per week per user. Private.';
create index idx_mind_weekly_user_week on mind_weekly_reviews (user_id, week_start desc);
select public.setup_owned_table('mind_weekly_reviews');

-- ---------------------------------------------------------------------------
-- mind_decisions — reflective decision framing. JSONB used for genuinely
-- variable option/factor lists (constrained to arrays). Never auto-decides.
-- ---------------------------------------------------------------------------
create table mind_decisions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  context     text,
  options     jsonb not null default '[]' check (jsonb_typeof(options) = 'array'),
  factors     jsonb not null default '[]' check (jsonb_typeof(factors) = 'array'),
  reflection  text,
  status      decision_status not null default 'open',
  resolved_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table mind_decisions is 'Decision room: options/factors/reflection. Reflective only; stores no authoritative decision. Private.';
create index idx_mind_decisions_user_status on mind_decisions (user_id, status);
select public.setup_owned_table('mind_decisions');
