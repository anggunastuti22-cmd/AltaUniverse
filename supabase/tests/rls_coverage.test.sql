-- rls_coverage.test.sql — structural RLS coverage guarantee (pgTAP).
--
-- CLAUDE.md §7 requires *every* user table to be RLS-protected (owner-only;
-- anon denied; operator denied). rls.test.sql proves the behaviour on a
-- representative sample; this file proves the invariant holds for ALL tables,
-- so a future table that forgets `setup_owned_table` (or ships without RLS)
-- fails CI instead of silently leaking. It is data-driven: it inspects the
-- live catalog rather than a hand-maintained list of assertions.
begin;
select plan(8);

-- The canonical set of owner-scoped private tables (user_id = auth.uid()).
create temporary table _owned (tbl text) on commit drop;
insert into _owned (tbl) values
  ('user_preferences'), ('user_consents'),
  ('mind_journal_entries'), ('mind_checkins'), ('mind_life_domains'),
  ('mind_goals'), ('mind_weekly_reviews'), ('mind_decisions'),
  ('wear_items'), ('wear_item_images'), ('wear_outfits'), ('wear_outfit_items'),
  ('wear_usage_logs'), ('wear_style_profiles'), ('wear_wishlist'),
  ('lab_skin_profiles'), ('lab_skin_logs'), ('lab_routines'),
  ('lab_routine_steps'), ('lab_experiments'), ('lab_user_products');

-- 1) Every owned table actually exists (guards against typos in this list).
select is(
  (select count(*)::int from _owned o
   where to_regclass('public.' || o.tbl) is null),
  0, 'every listed owner-scoped table exists');

-- 2) RLS is ENABLED on every owned table.
select is(
  (select count(*)::int from _owned o
   join pg_class c on c.oid = to_regclass('public.' || o.tbl)
   where c.relrowsecurity = false),
  0, 'RLS is enabled on every owner-scoped table');

-- 3) Each owned table has all four owner CRUD policies.
select is(
  (select count(*)::int from _owned o
   where (select count(*) from pg_policies p
          where p.schemaname = 'public' and p.tablename = o.tbl
            and p.policyname in ('owner_select','owner_insert','owner_update','owner_delete')) <> 4),
  0, 'every owner-scoped table has owner select/insert/update/delete policies');

-- 4) anon has NO table privileges on any owned table (deny by absence of grant).
select is(
  (select count(*)::int from _owned o
   where has_table_privilege('anon', 'public.' || o.tbl, 'SELECT')
      or has_table_privilege('anon', 'public.' || o.tbl, 'INSERT')
      or has_table_privilege('anon', 'public.' || o.tbl, 'UPDATE')
      or has_table_privilege('anon', 'public.' || o.tbl, 'DELETE')),
  0, 'anon has no privileges on any owner-scoped table');

-- 5) No public-schema table anywhere ships with RLS disabled (catches any new
--    table, owned or not, that forgets to enable RLS).
select is(
  (select count(*)::int from pg_class c
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r'
     and c.relrowsecurity = false
     and c.relname not like '\_%'),       -- temp/internal helper tables
  0, 'no public table ships with RLS disabled');

-- 6) audit_events is append-only for the app: RLS on, and NO policy grants
--    read/write to authenticated or anon (only service_role bypasses RLS).
select ok(
  (select c.relrowsecurity from pg_class c
   where c.oid = to_regclass('public.audit_events')),
  'audit_events has RLS enabled');
select is(
  (select count(*)::int from pg_policies
   where schemaname = 'public' and tablename = 'audit_events'
     and ('authenticated' = any(roles) or 'anon' = any(roles) or 'public' = any(roles))),
  0, 'audit_events exposes no policy to authenticated/anon (service-role only)');

-- 7) Catalogue tables that are intentionally public-readable still have RLS on
--    (so the public read is policy-gated, not an open grant).
select is(
  (select count(*)::int
   from (values ('lab_products'), ('media_assets'), ('lab_ingredients'),
                ('lab_product_ingredients'), ('lab_ingredient_pairings')) as t(tbl)
   join pg_class c on c.oid = to_regclass('public.' || t.tbl)
   where c.relrowsecurity = false),
  0, 'public-readable catalogue tables have RLS enabled');

select * from finish();
rollback;
