-- ingredients.test.sql — RLS + constraints for the AltaLab ingredient model
-- (lab_ingredients, lab_product_ingredients, lab_ingredient_pairings; ADR-004).
-- Catalogue tables: public-read when published, admin-write.
begin;
select plan(13);

-- Fixtures as the superuser test role (bypasses RLS) ------------------------
insert into auth.users (id, email) values
  ('33333333-3333-3333-3333-333333333333', 'admin@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.test');
insert into user_roles (user_id, role) values
  ('33333333-3333-3333-3333-333333333333', 'admin');

insert into lab_products (id, name, category, is_published) values
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', 'Published Serum', 'serum', true),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc2', 'Draft Serum', 'serum', false);

insert into lab_ingredients (id, slug, name, class, is_published) values
  ('11111111-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'niacinamide', 'Niacinamide', 'niacinamide', true),
  ('11111111-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'retinal', 'Retinal', 'retinoid', true),
  ('11111111-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'secret-acid', 'Secret Acid', 'aha', false);

-- niacinamide -> published product; secret-acid -> unpublished product.
insert into lab_product_ingredients (product_id, ingredient_id) values
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', '11111111-aaaa-4aaa-8aaa-aaaaaaaaaaa1'),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc2', '11111111-aaaa-4aaa-8aaa-aaaaaaaaaaa3');

-- Canonical order follows the enum declaration order (retinoid < aha;
-- vitamin_c < niacinamide).
insert into lab_ingredient_pairings (class_a, class_b, note, is_published) values
  ('retinoid', 'aha', 'Many routines introduce these on alternate days.', true),
  ('vitamin_c', 'niacinamide', 'A commonly discussed pair.', false);

-- ===========================================================================
-- anon / public read
-- ===========================================================================
set local role anon;
select set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);

select is((select count(*)::int from lab_ingredients), 2,
  'anon sees only published ingredients');
select is((select count(*)::int from lab_ingredients where slug = 'secret-acid'), 0,
  'anon cannot see an unpublished ingredient');
select is((select count(*)::int from lab_product_ingredients), 1,
  'anon sees product-ingredient links only for published products');
select is((select count(*)::int from lab_ingredient_pairings), 1,
  'anon sees only published pairings');
select throws_ok(
  $$ insert into lab_ingredients (slug, name) values ('hack', 'Hack') $$,
  '42501', NULL, 'anon cannot write ingredients');

-- ===========================================================================
-- authenticated non-admin
-- ===========================================================================
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '22222222-2222-2222-2222-222222222222', 'role', 'authenticated')::text, true);

select is((select count(*)::int from lab_ingredients), 2,
  'non-admin sees only published ingredients');
select throws_ok(
  $$ insert into lab_ingredients (slug, name) values ('hack2', 'Hack2') $$,
  '42501', NULL, 'non-admin cannot write ingredients');
select throws_ok(
  $$ insert into lab_ingredient_pairings (class_a, class_b, note)
     values ('aha', 'bha', 'x') $$,
  '42501', NULL, 'non-admin cannot write pairings');

-- ===========================================================================
-- admin
-- ===========================================================================
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '33333333-3333-3333-3333-333333333333', 'role', 'authenticated')::text, true);

select is((select count(*)::int from lab_ingredients), 3,
  'admin sees unpublished ingredients too');
select lives_ok(
  $$ insert into lab_ingredients (slug, name, is_published) values ('azelaic-acid', 'Azelaic Acid', true) $$,
  'admin can write ingredients');
select lives_ok(
  $$ update lab_ingredients set summary = 'edu' where slug = 'niacinamide' $$,
  'admin can update ingredients');

-- ===========================================================================
-- constraints (as superuser, bypassing RLS)
-- ===========================================================================
reset role;
select set_config('request.jwt.claims', NULL, true);

select throws_ok(
  $$ insert into lab_ingredient_pairings (class_a, class_b, note)
     values ('aha', 'retinoid', 'wrong order') $$,
  '23514', NULL, 'pairing must be in canonical class order (check constraint)');

select throws_ok(
  $$ insert into lab_ingredients (slug, name) values ('Bad Slug', 'Bad') $$,
  '23514', NULL, 'ingredient slug must be url-safe (check constraint)');

select * from finish();
rollback;
