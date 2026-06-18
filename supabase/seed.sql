-- seed.sql — DEVELOPMENT / SYNTHETIC DATA ONLY (CLAUDE.md §8).
--
-- * Everything here is fictional. NEVER add production or real user data.
-- * Applied by `supabase db reset` after migrations.
-- * auth.users rows are minimal fixtures (no password) so they satisfy foreign
--   keys for seeding domain data. Create real, loginable test accounts via the
--   Auth API / Studio when needed.

-- Fictional identities -------------------------------------------------------
insert into auth.users (id, email) values
  ('a0000000-0000-4000-8000-000000000001', 'maya.dev@altauniverse.test'),
  ('a0000000-0000-4000-8000-000000000002', 'devi.dev@altauniverse.test'),
  ('a0000000-0000-4000-8000-000000000003', 'operator.dev@altauniverse.test')
on conflict (id) do nothing;

insert into profiles (id, display_name, locale, timezone, onboarded_at) values
  ('a0000000-0000-4000-8000-000000000001', 'Maya (dev)', 'en', 'Asia/Jakarta', now()),
  ('a0000000-0000-4000-8000-000000000002', 'Devi (dev)', 'en', 'Europe/London', now()),
  ('a0000000-0000-4000-8000-000000000003', 'Operator (dev)', 'en', 'UTC', now())
on conflict (id) do nothing;

insert into user_preferences (user_id, theme) values
  ('a0000000-0000-4000-8000-000000000001', 'light'),
  ('a0000000-0000-4000-8000-000000000002', 'system')
on conflict (user_id) do nothing;

-- AI off by default; analytics granted as an example consent.
insert into user_consents (user_id, consent_type, granted, granted_at) values
  ('a0000000-0000-4000-8000-000000000001', 'ai_processing', false, null),
  ('a0000000-0000-4000-8000-000000000001', 'analytics', true, now())
on conflict (user_id, consent_type) do nothing;

insert into user_roles (user_id, role) values
  ('a0000000-0000-4000-8000-000000000003', 'admin')
on conflict (user_id, role) do nothing;

-- Public catalogue (fictional products) -------------------------------------
insert into lab_products (id, name, brand, category, key_ingredients, is_published, created_by) values
  ('b0000000-0000-4000-8000-000000000001', 'Gentle Daily Cleanser', 'Fictia', 'cleanser', '{glycerin,ceramides}', true, 'a0000000-0000-4000-8000-000000000003'),
  ('b0000000-0000-4000-8000-000000000002', 'Calm Barrier Moisturizer', 'Fictia', 'moisturizer', '{niacinamide,squalane}', true, 'a0000000-0000-4000-8000-000000000003'),
  ('b0000000-0000-4000-8000-000000000003', 'Draft Night Serum', 'Fictia', 'serum', '{retinal}', false, 'a0000000-0000-4000-8000-000000000003')
on conflict (id) do nothing;

-- AltaMind (fictional, for Maya) --------------------------------------------
insert into mind_life_domains (id, user_id, name, sort_order) values
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Career', 0),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Wellbeing', 1)
on conflict (id) do nothing;

insert into mind_checkins (user_id, checkin_date, mood, energy, note) values
  ('a0000000-0000-4000-8000-000000000001', current_date, 4, 3, 'Focused morning (dev sample).')
on conflict (user_id, checkin_date) do nothing;

insert into mind_journal_entries (id, user_id, body, tags, life_domain_id) values
  ('d0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
   'Sample dev journal entry — reflecting on the week.', '{reflection}',
   'c0000000-0000-4000-8000-000000000002')
on conflict (id) do nothing;

-- AltaWear (fictional, for Maya) --------------------------------------------
insert into wear_items (id, user_id, name, category, brand, color, price, currency, acquired_on) values
  ('e0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Wool Overcoat', 'outerwear', 'Fictia', 'camel', 220.00, 'USD', current_date - 200),
  ('e0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'White Sneakers', 'footwear', 'Fictia', 'white', 90.00, 'USD', current_date - 90)
on conflict (id) do nothing;

insert into wear_outfits (id, user_id, name, occasion) values
  ('e1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Smart casual', 'work')
on conflict (id) do nothing;

insert into wear_outfit_items (user_id, outfit_id, item_id) values
  ('a0000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000002')
on conflict (outfit_id, item_id) do nothing;

insert into wear_usage_logs (user_id, worn_on, outfit_id) values
  ('a0000000-0000-4000-8000-000000000001', current_date - 1, 'e1000000-0000-4000-8000-000000000001')
on conflict do nothing;

insert into wear_wishlist (user_id, name, reason, status) values
  ('a0000000-0000-4000-8000-000000000001', 'Leather boots', 'Replace worn pair', 'considering')
on conflict do nothing;

-- AltaLab (fictional, for Maya) ---------------------------------------------
insert into lab_skin_profiles (user_id, skin_type, concerns, sensitivities) values
  ('a0000000-0000-4000-8000-000000000001', 'combination', '{dryness}', '{fragrance}')
on conflict (user_id) do nothing;

insert into lab_user_products (id, user_id, product_id, opened_on, price_paid) values
  ('f0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', current_date - 30, 14.00)
on conflict (id) do nothing;

insert into lab_routines (id, user_id, time_of_day, name) values
  ('f1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'am', 'Morning basics')
on conflict (id) do nothing;

insert into lab_routine_steps (user_id, routine_id, user_product_id, step_order, instruction) values
  ('a0000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000001', 1, 'Cleanse gently')
on conflict (routine_id, step_order) do nothing;

insert into lab_skin_logs (user_id, observed_on, note) values
  ('a0000000-0000-4000-8000-000000000001', current_date, 'Skin felt balanced today (dev sample).')
on conflict do nothing;

insert into lab_experiments (user_id, hypothesis, user_product_id, status, started_on) values
  ('a0000000-0000-4000-8000-000000000001', 'New cleanser reduces dryness over 4 weeks.', 'f0000000-0000-4000-8000-000000000001', 'active', current_date - 7)
on conflict do nothing;
