-- deletion.test.sql — account deletion cascade + audit retention (pgTAP).
-- Runs as the superuser test role (we are testing FK behavior, not RLS).
begin;
select plan(7);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.test');
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

select is((select count(*)::int from profiles where id = '11111111-1111-1111-1111-111111111111'), 1,
  'profile exists before deletion');

-- Delete the account.
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
