-- deletion.test.sql — account deletion cascade, audit retention, and the
-- grace-period deletion request flow (pgTAP).
-- Fixtures are created as the superuser test role (bypasses RLS); the
-- grace-period section switches roles to exercise RLS as owner / cross-user /
-- anon, matching the policies in 0011_deletion_grace_period.sql.
begin;
select plan(15);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.test'),
  ('33333333-3333-3333-3333-333333333333', 'carol@example.test'),
  ('44444444-4444-4444-4444-444444444444', 'dave@example.test');
insert into profiles (id, display_name) values
  ('11111111-1111-1111-1111-111111111111', 'Alice');
insert into user_preferences (user_id) values
  ('11111111-1111-1111-1111-111111111111');
insert into mind_journal_entries (user_id, body) values
  ('11111111-1111-1111-1111-111111111111', 'entry');
insert into wear_items (user_id, name, category) values
  ('11111111-1111-1111-1111-111111111111', 'Coat', 'outerwear');
insert into lab_skin_logs (user_id, note) values
  ('11111111-1111-1111-1111-111111111111', 'observation');

-- Catalogue product referenced by the user's cabinet (RESTRICT on product).
insert into lab_products (id, name, category, is_published) values
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'CeraVe', 'cleanser', true);
insert into lab_user_products (user_id, product_id) values
  ('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc');

-- Audit event referencing the user as actor (should be retained).
insert into audit_events (actor_user_id, action) values
  ('11111111-1111-1111-1111-111111111111', 'acct.test');

-- ===========================================================================
-- Grace-period deletion requests (deletion_requests + purge_due_deletions)
-- ===========================================================================
-- Bob & Carol: pending, not yet due. Dave: pending and overdue (purge target).
insert into deletion_requests (user_id, status, purge_after) values
  ('22222222-2222-2222-2222-222222222222', 'pending', now() + interval '7 days'),
  ('33333333-3333-3333-3333-333333333333', 'pending', now() + interval '7 days'),
  ('44444444-4444-4444-4444-444444444444', 'pending', now() - interval '1 hour');

-- Owner (Bob) sees only his own request, never Carol's or Dave's.
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '22222222-2222-2222-2222-222222222222', 'role', 'authenticated')::text, true);

select is((select count(*)::int from deletion_requests), 1,
  'owner sees only own deletion request');
select throws_ok(
  $$ insert into deletion_requests (user_id, purge_after)
     values ('22222222-2222-2222-2222-222222222222', now()) $$,
  '42501', NULL, 'owner cannot self-insert a deletion request (service role only)');
select lives_ok(
  $$ update deletion_requests set status = 'cancelled'
     where user_id = '22222222-2222-2222-2222-222222222222' $$,
  'owner can cancel own deletion request');
select is((select status::text from deletion_requests
           where user_id = '22222222-2222-2222-2222-222222222222'), 'cancelled',
  'cancellation persisted');

-- Anon is denied (no grant).
set local role anon;
select set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
select throws_ok(
  $$ select count(*) from deletion_requests $$,
  '42501', NULL, 'anon is denied access to deletion requests');

-- Back to the privileged test role to run the scheduled purge.
reset role;
select set_config('request.jwt.claims', NULL, true);

select public.purge_due_deletions();
select is((select count(*)::int from auth.users
           where id = '44444444-4444-4444-4444-444444444444'), 0,
  'overdue account is purged');
select is((select count(*)::int from auth.users
           where id = '33333333-3333-3333-3333-333333333333'), 1,
  'not-yet-due account is retained');
select is((select count(*)::int from audit_events
           where action = 'account.purge'
             and target_id = '44444444-4444-4444-4444-444444444444'), 1,
  'purge writes an account.purge audit event');

-- ===========================================================================
-- Account deletion cascade + audit retention (Alice)
-- ===========================================================================
select is((select count(*)::int from profiles where id = '11111111-1111-1111-1111-111111111111'), 1,
  'profile exists before deletion');

select lives_ok(
  $$ delete from auth.users where id = '11111111-1111-1111-1111-111111111111' $$,
  'account deletion succeeds');

select is((select count(*)::int from profiles where id = '11111111-1111-1111-1111-111111111111'), 0,
  'profile cascade-deleted');
select is((select count(*)::int from mind_journal_entries
           where user_id = '11111111-1111-1111-1111-111111111111'), 0,
  'journal cascade-deleted');
select is((select count(*)::int from lab_skin_logs
           where user_id = '11111111-1111-1111-1111-111111111111'), 0,
  'skin logs cascade-deleted');

-- Catalogue product survives (shared, not user-owned).
select is((select count(*)::int from lab_products
           where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'), 1,
  'shared catalogue product is retained');

-- Audit event retained, actor reference nulled.
select is((select count(*)::int from audit_events
           where action = 'acct.test' and actor_user_id is null), 1,
  'audit event retained with actor nulled');

select * from finish();
rollback;
