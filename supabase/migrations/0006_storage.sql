-- 0006_storage.sql
-- Storage buckets + object-level RLS. Path convention: "<user_id>/<...>" so the
-- first folder segment identifies the owner. Uses storage.foldername(name).
--
-- Buckets:
--   avatars         public read; owner-only writes.
--   wardrobe-images private; owner-only access (own folder).
--   skin-images     private; owner-only access; no public URLs.
--   content-assets  private bucket; public read only for published assets
--                   (joined to media_assets.is_published); admin-only writes.

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('wardrobe-images', 'wardrobe-images', false),
  ('skin-images', 'skin-images', false),
  ('content-assets', 'content-assets', false)
on conflict (id) do nothing;

-- avatars -------------------------------------------------------------------
create policy "avatars public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'avatars');

create policy "avatars owner insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars owner update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- wardrobe-images (private, owner folder only) ------------------------------
create policy "wardrobe owner all" on storage.objects
  for all to authenticated
  using (bucket_id = 'wardrobe-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'wardrobe-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- skin-images (private, owner folder only, no public read) ------------------
create policy "skin owner all" on storage.objects
  for all to authenticated
  using (bucket_id = 'skin-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'skin-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- content-assets (admin-managed; public read only when published) -----------
create policy "content published read" on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'content-assets'
    and exists (
      select 1 from public.media_assets m
      where m.bucket = 'content-assets' and m.path = storage.objects.name and m.is_published
    )
  );

create policy "content admin write" on storage.objects
  for all to authenticated
  using (bucket_id = 'content-assets' and public.is_admin())
  with check (bucket_id = 'content-assets' and public.is_admin());
