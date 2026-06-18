-- rls.test.sql — Row Level Security behavior (pgTAP).
-- Run inside a transaction that has the shim + migrations applied.
begin;
select plan(24);

-- Fixtures (created as the superuser test role -> bypasses RLS) --------------
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.test'),
  ('33333333-3333-3333-3333-333333333333', 'admin@example.test');

insert into profiles (id, display_name) values
  ('11111111-1111-1111-1111-111111111111', 'Alice'),
  ('22222222-2222-2222-2222-222222222222', 'Bob'),
  ('33333333-3333-3333-3333-333333333333', 'Admin');

insert into user_preferences (user_id) values
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222');

insert into user_roles (user_id, role) values
  ('33333333-3333-3333-3333-333333333333', 'admin');

insert into mind_journal_entries (id, user_id, body) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'alice private entry');

insert into mind_checkins (user_id, mood, energy) values
  ('11111111-1111-1111-1111-111111111111', 4, 4);

insert into wear_items (user_id, name, category, price) values
  ('11111111-1111-1111-1111-111111111111', 'Wool Coat', 'outerwear', 200.00);

insert into lab_skin_logs (user_id, note) values
  ('11111111-1111-1111-1111-111111111111', 'alice skin observation');

insert into lab_products (id, name, category, is_published) values
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'CeraVe Cleanser', 'cleanser', true),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Unpublished Draft', 'serum', false);

-- SECURITY INVOKER helpers so a denied UPDATE/DELETE can report its affected
-- row count under the caller's RLS context (data-modifying CTEs can't be used
-- as scalar subqueries). EXECUTE defaults to PUBLIC.
create function _try_update_journal(p uuid) returns int language plpgsql security invoker as $$
declare n int; begin
  update mind_journal_entries set body = 'hacked' where id = p;
  get diagnostics n = row_count; return n;
end $$;
create function _try_delete_journal(p uuid) returns int language plpgsql security invoker as $$
declare n int; begin
  delete from mind_journal_entries where id = p;
  get diagnostics n = row_count; return n;
end $$;

-- ===========================================================================
-- OWNER (Alice) can access her own rows
-- ===========================================================================
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '11111111-1111-1111-1111-111111111111', 'role', 'authenticated')::text, true);

select is((select count(*)::int from mind_journal_entries), 1, 'owner sees own journal');
select is((select count(*)::int from mind_checkins), 1, 'owner sees own checkins');
select is((select count(*)::int from wear_items), 1, 'owner sees own wardrobe items');
select lives_ok(
  $$ insert into mind_journal_entries (user_id, body) values ('11111111-1111-1111-1111-111111111111', 'second entry') $$,
  'owner can insert own journal');
select throws_ok(
  $$ insert into mind_journal_entries (user_id, body) values ('22222222-2222-2222-2222-222222222222', 'spoof') $$,
  '42501', NULL, 'owner cannot insert a row owned by another user');
select is((select count(*)::int from lab_products), 1, 'user sees only published catalogue rows');
select throws_ok(
  $$ insert into lab_products (name, category) values ('Hack', 'serum') $$,
  '42501', NULL, 'non-admin cannot write catalogue');

-- ===========================================================================
-- CROSS-USER (Bob) cannot see/modify Alice's private rows
-- ===========================================================================
reset role;
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '22222222-2222-2222-2222-222222222222', 'role', 'authenticated')::text, true);

select is((select count(*)::int from mind_journal_entries), 0, 'cross-user sees no foreign journal');
select is((select count(*)::int from wear_items), 0, 'cross-user sees no foreign wardrobe');
select is((select count(*)::int from lab_skin_logs), 0, 'cross-user sees no foreign skin logs');
select is(_try_update_journal('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), 0,
  'cross-user update affects zero rows');
select is(_try_delete_journal('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), 0,
  'cross-user delete affects zero rows');

-- ===========================================================================
-- UNAUTHENTICATED (anon)
-- ===========================================================================
reset role;
set local role anon;
select set_config('request.jwt.claims', '', true);

select throws_ok(
  $$ select 1 from mind_journal_entries $$,
  '42501', NULL, 'anon is denied access to private tables (no grant)');
select is((select count(*)::int from lab_products), 1, 'anon reads published catalogue');
select throws_ok(
  $$ insert into mind_journal_entries (user_id, body) values ('11111111-1111-1111-1111-111111111111', 'x') $$,
  '42501', NULL, 'anon cannot insert into private table');

-- ===========================================================================
-- ADMIN boundary: explicit role, but NO access to private content
-- ===========================================================================
reset role;
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '33333333-3333-3333-3333-333333333333', 'role', 'authenticated')::text, true);

select is((select count(*)::int from mind_journal_entries), 0, 'admin cannot read private journal');
select is((select count(*)::int from lab_skin_logs), 0, 'admin cannot read private skin logs');
select lives_ok(
  $$ insert into lab_products (name, category) values ('Admin Added', 'toner') $$,
  'admin can write catalogue');
select ok((select count(*)::int from lab_products) >= 2, 'admin reads unpublished catalogue rows');

-- ===========================================================================
-- user_roles: no self-grant
-- ===========================================================================
reset role;
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '22222222-2222-2222-2222-222222222222', 'role', 'authenticated')::text, true);

select throws_ok(
  $$ insert into user_roles (user_id, role) values ('22222222-2222-2222-2222-222222222222', 'admin') $$,
  '42501', NULL, 'user cannot self-grant a role');
select is((select count(*)::int from user_roles), 0, 'user has no role rows');

-- ===========================================================================
-- service_role: broad (server path) + audit isolation from users
-- ===========================================================================
reset role;
set local role service_role;
select ok((select count(*)::int from mind_journal_entries) >= 1, 'service role can read across users');
select lives_ok(
  $$ insert into audit_events (action, actor_role) values ('test.event', 'service_role') $$,
  'service role can append audit events');

reset role;
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '11111111-1111-1111-1111-111111111111', 'role', 'authenticated')::text, true);
select throws_ok(
  $$ select 1 from audit_events $$,
  '42501', NULL, 'users cannot read the audit log');

select * from finish();
rollback;
