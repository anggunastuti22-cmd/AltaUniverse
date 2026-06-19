-- storage.test.sql — storage object ownership & visibility (pgTAP).
begin;
select plan(13);

-- Users
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.test'),
  ('33333333-3333-3333-3333-333333333333', 'admin@example.test');
insert into profiles (id, display_name) values
  ('11111111-1111-1111-1111-111111111111', 'Alice'),
  ('22222222-2222-2222-2222-222222222222', 'Bob'),
  ('33333333-3333-3333-3333-333333333333', 'Admin');
insert into user_roles (user_id, role) values
  ('33333333-3333-3333-3333-333333333333', 'admin');

-- Objects (owned via "<user_id>/..." path convention)
insert into storage.objects (bucket_id, name, owner) values
  ('wardrobe-images', '11111111-1111-1111-1111-111111111111/coat.jpg', '11111111-1111-1111-1111-111111111111'),
  ('skin-images',     '11111111-1111-1111-1111-111111111111/skin.jpg', '11111111-1111-1111-1111-111111111111'),
  ('avatars',         '11111111-1111-1111-1111-111111111111/me.jpg',   '11111111-1111-1111-1111-111111111111'),
  ('content-assets',  'article/published.jpg', null),
  ('content-assets',  'article/draft.jpg',     null);

insert into media_assets (user_id, bucket, path, is_published) values
  (null, 'content-assets', 'article/published.jpg', true),
  (null, 'content-assets', 'article/draft.jpg',     false);

-- OWNER (Alice) -------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '11111111-1111-1111-1111-111111111111', 'role', 'authenticated')::text, true);

select lives_ok(
  $$ insert into storage.objects (bucket_id, name, owner)
     values ('wardrobe-images', '11111111-1111-1111-1111-111111111111/shoes.jpg', '11111111-1111-1111-1111-111111111111') $$,
  'owner can write into own wardrobe folder');
select throws_ok(
  $$ insert into storage.objects (bucket_id, name, owner)
     values ('wardrobe-images', '22222222-2222-2222-2222-222222222222/x.jpg', '11111111-1111-1111-1111-111111111111') $$,
  '42501', NULL, 'owner cannot write into another user folder');
select ok((select count(*)::int from storage.objects where bucket_id = 'wardrobe-images') >= 1,
  'owner sees own wardrobe objects');
select is((select count(*)::int from storage.objects where bucket_id = 'skin-images'), 1,
  'owner sees own skin images');

-- CROSS-USER (Bob) ----------------------------------------------------------
reset role;
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '22222222-2222-2222-2222-222222222222', 'role', 'authenticated')::text, true);

select is((select count(*)::int from storage.objects where bucket_id = 'wardrobe-images'), 0,
  'cross-user sees no foreign wardrobe objects');
select is((select count(*)::int from storage.objects where bucket_id = 'skin-images'), 0,
  'cross-user sees no foreign skin images');

-- ANON ----------------------------------------------------------------------
reset role;
set local role anon;
select set_config('request.jwt.claims', '', true);

-- After 0009 hardening the broad avatars SELECT policy was removed, so anon can
-- no longer LIST avatars via the API (public delivery is via the bucket URL).
select is((select count(*)::int from storage.objects where bucket_id = 'avatars'), 0,
  'anon cannot list avatars via the storage API (hardened)');
select is((select count(*)::int from storage.objects where bucket_id = 'skin-images'), 0,
  'anon cannot read private skin images');
select is((select count(*)::int from storage.objects where bucket_id = 'content-assets'), 1,
  'anon reads only published content-assets');

-- ADMIN content management --------------------------------------------------
reset role;
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '33333333-3333-3333-3333-333333333333', 'role', 'authenticated')::text, true);
select lives_ok(
  $$ insert into storage.objects (bucket_id, name) values ('content-assets', 'article/new.jpg') $$,
  'admin can write content-assets');

reset role;
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '22222222-2222-2222-2222-222222222222', 'role', 'authenticated')::text, true);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('content-assets', 'article/evil.jpg') $$,
  '42501', NULL, 'non-admin cannot write content-assets');

-- AVATAR owner write --------------------------------------------------------
reset role;
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '11111111-1111-1111-1111-111111111111', 'role', 'authenticated')::text, true);
select lives_ok(
  $$ insert into storage.objects (bucket_id, name, owner)
     values ('avatars', '11111111-1111-1111-1111-111111111111/new.jpg', '11111111-1111-1111-1111-111111111111') $$,
  'owner can write own avatar');
select throws_ok(
  $$ insert into storage.objects (bucket_id, name, owner)
     values ('avatars', '22222222-2222-2222-2222-222222222222/x.jpg', '11111111-1111-1111-1111-111111111111') $$,
  '42501', NULL, 'owner cannot write avatar into another user folder');

select * from finish();
rollback;
