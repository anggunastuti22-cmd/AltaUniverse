# Alta Universe — Initial Data Model

> Status: Draft 1 (architecture & planning phase)
> Last updated: 2026-06-18

This is a **conceptual** data model for the MVP. It defines tables, purpose, key
columns, foreign keys, public/private classification, RLS requirements,
retention considerations, and which app surfaces use each table. It is not the
migration itself; migrations are authored in `supabase/migrations/` per ADR-002.

## Conventions

- Namespacing by domain: `core_*`, `mind_*`, `wear_*`, `lab_*`, `ops_*`.
- Every private table has `user_id uuid` referencing `auth.users(id)` and is
  protected by RLS (`user_id = auth.uid()`).
- Timestamps: `created_at timestamptz default now()`, `updated_at timestamptz`.
- Soft vs hard delete noted per table under retention.
- "Surfaces": W=public web, A=auth web app, M=mobile, AD=admin.

Legend for classification:

- **Private (high)** — sensitive free text / images; strictest handling.
- **Private** — user-owned, not free-form sensitive text.
- **Operational** — platform content/config, not user-private.
- **Public** — servable to anyone.

---

## A. Alta Core

### `core_profiles`

- **Purpose:** One unified profile per Alta ID.
- **Key columns:** `id` (PK = `auth.users.id`), `display_name`, `locale`,
  `timezone`, `avatar_path`, `onboarding_completed_at`.
- **FKs:** `id` → `auth.users(id)`.
- **Classification:** Private.
- **RLS:** owner read/write own row; admin may read minimal fields only via
  reporting view (no direct grant).
- **Retention:** deleted on account deletion.
- **Surfaces:** A, M, AD (limited).

### `core_preferences`

- **Purpose:** User settings (theme, units, notification prefs).
- **Key columns:** `user_id` (PK/FK), `theme`, `measurement_units`,
  `notif_*` flags.
- **FKs:** `user_id` → `auth.users(id)`.
- **Classification:** Private.
- **RLS:** owner only.
- **Retention:** deleted on account deletion.
- **Surfaces:** A, M.

### `core_consents`

- **Purpose:** Granular, revocable consent records (AI, analytics,
  notifications).
- **Key columns:** `id`, `user_id`, `consent_type`, `granted` (bool),
  `granted_at`, `revoked_at`, `version`.
- **FKs:** `user_id` → `auth.users(id)`.
- **Classification:** Private (compliance-relevant).
- **RLS:** owner read/write; immutable history preferred (append rows on
  change).
- **Retention:** retained per compliance window even after deletion of other
  data where legally required; otherwise removed on deletion.
- **Surfaces:** A, M.

### `core_notifications`

- **Purpose:** Notification centre items and delivery records.
- **Key columns:** `id`, `user_id`, `type`, `title`, `body_ref`, `read_at`,
  `scheduled_for`, `sent_at`.
- **FKs:** `user_id` → `auth.users(id)`.
- **Classification:** Private. (`body_ref` references templated content; no
  private free text stored verbatim where avoidable.)
- **RLS:** owner only.
- **Retention:** time-boxed (e.g., purge read items after N days).
- **Surfaces:** M (primary), A.

### `core_data_exports`

- **Purpose:** Track user-initiated export requests.
- **Key columns:** `id`, `user_id`, `status`, `requested_at`, `completed_at`,
  `artifact_path` (signed, expiring).
- **FKs:** `user_id` → `auth.users(id)`.
- **Classification:** Private.
- **RLS:** owner read; writes via Edge Function (service role).
- **Retention:** artifact expires/purged after short window.
- **Surfaces:** A; processed by Edge Function.

### `core_deletion_requests`

- **Purpose:** Track account deletion with grace period.
- **Key columns:** `id`, `user_id`, `status`, `requested_at`,
  `scheduled_purge_at`, `completed_at`.
- **FKs:** `user_id` → `auth.users(id)`.
- **Classification:** Private.
- **RLS:** owner read; orchestrated by Edge Function.
- **Retention:** minimal record may persist post-purge for audit.
- **Surfaces:** A; processed by Edge Function.

### `ops_audit_log`

- **Purpose:** Audit privileged/admin operations.
- **Key columns:** `id`, `actor_id`, `actor_role`, `action`, `target_ref`,
  `created_at`, `metadata`.
- **FKs:** `actor_id` → `auth.users(id)` (nullable for system).
- **Classification:** Operational (no private user text).
- **RLS:** no user access; admin read via restricted role; writes server-side.
- **Retention:** long-lived per security policy.
- **Surfaces:** AD (read), system (write).

---

## B. AltaMind

### `mind_checkins`

- **Purpose:** Daily check-in (mood/energy + short note).
- **Key columns:** `id`, `user_id`, `checkin_date`, `mood`, `energy`,
  `note` (short text).
- **FKs:** `user_id` → `auth.users(id)`. Unique `(user_id, checkin_date)`.
- **Classification:** Private (high).
- **RLS:** owner only.
- **Retention:** until user deletes / account deletion.
- **Surfaces:** M (primary), A.

### `mind_journal_entries`

- **Purpose:** Private free-text journal.
- **Key columns:** `id`, `user_id`, `body` (free text), `entry_date`,
  `life_domain_id` (nullable), `tags` (text[]).
- **FKs:** `user_id` → `auth.users(id)`; `life_domain_id` → `mind_life_domains(id)`.
- **Classification:** Private (high). **Never enters analytics.**
- **RLS:** owner only.
- **Retention:** user-controlled; deleted on account deletion.
- **Surfaces:** A, M.

### `mind_life_domains`

- **Purpose:** User-defined areas of life.
- **Key columns:** `id`, `user_id`, `name`, `description`, `sort_order`.
- **FKs:** `user_id` → `auth.users(id)`.
- **Classification:** Private.
- **RLS:** owner only.
- **Retention:** account deletion.
- **Surfaces:** A, M.

### `mind_goals`

- **Purpose:** Goals tied to life domains (reflective, not strict tracking).
- **Key columns:** `id`, `user_id`, `life_domain_id`, `title`, `status`,
  `reflection`, `target_horizon`.
- **FKs:** `user_id` → `auth.users(id)`; `life_domain_id` → `mind_life_domains(id)`.
- **Classification:** Private.
- **RLS:** owner only.
- **Retention:** account deletion.
- **Surfaces:** A, M.

### `mind_weekly_resets`

- **Purpose:** Weekly review (wins, friction, intention).
- **Key columns:** `id`, `user_id`, `week_start`, `wins`, `friction`,
  `intention`.
- **FKs:** `user_id` → `auth.users(id)`. Unique `(user_id, week_start)`.
- **Classification:** Private (high).
- **RLS:** owner only.
- **Retention:** account deletion.
- **Surfaces:** A, M.

### `mind_decisions`

- **Purpose:** Decision room frames (options + factors + reflection).
- **Key columns:** `id`, `user_id`, `title`, `context`, `options` (jsonb),
  `factors` (jsonb), `reflection`, `resolved_at`.
- **FKs:** `user_id` → `auth.users(id)`.
- **Classification:** Private (high). **No automated decision is stored as
  authoritative.**
- **RLS:** owner only.
- **Retention:** account deletion.
- **Surfaces:** A (primary), M (view).

---

## C. AltaWear

### `wear_style_profiles`

- **Purpose:** Style preferences (colors, fits, occasions).
- **Key columns:** `user_id` (PK/FK), `preferred_colors` (text[]),
  `fit_notes`, `occasions` (text[]).
- **FKs:** `user_id` → `auth.users(id)`.
- **Classification:** Private.
- **RLS:** owner only.
- **Retention:** account deletion.
- **Surfaces:** A, M.

### `wear_items`

- **Purpose:** Wardrobe inventory.
- **Key columns:** `id`, `user_id`, `name`, `category`, `attributes` (jsonb:
  color, material, brand), `price`, `currency`, `acquired_on`,
  `catalogue_product_id` (nullable).
- **FKs:** `user_id` → `auth.users(id)`; `catalogue_product_id` →
  `ops_products(id)` (nullable, read-only link).
- **Classification:** Private.
- **RLS:** owner only.
- **Retention:** account deletion.
- **Surfaces:** A, M.

### `wear_item_images`

- **Purpose:** Photos of wardrobe items.
- **Key columns:** `id`, `user_id`, `item_id`, `storage_path`, `width`,
  `height`.
- **FKs:** `user_id` → `auth.users(id)`; `item_id` → `wear_items(id)`.
- **Classification:** Private (image). Stored in private Storage bucket scoped by
  `user_id` path.
- **RLS:** owner only; Storage policies mirror this.
- **Retention:** purged with item / on account deletion.
- **Surfaces:** A, M.

### `wear_outfits`

- **Purpose:** Composed outfits.
- **Key columns:** `id`, `user_id`, `name`, `occasion`, `notes`.
- **FKs:** `user_id` → `auth.users(id)`.
- **Classification:** Private.
- **RLS:** owner only.
- **Retention:** account deletion.
- **Surfaces:** A, M.

### `wear_outfit_items`

- **Purpose:** Join of outfits ↔ items.
- **Key columns:** `outfit_id`, `item_id`, `user_id`.
- **FKs:** `outfit_id` → `wear_outfits(id)`; `item_id` → `wear_items(id)`;
  `user_id` → `auth.users(id)`.
- **Classification:** Private.
- **RLS:** owner only.
- **Retention:** with parent outfit.
- **Surfaces:** A, M.

### `wear_wear_logs`

- **Purpose:** Record of outfits/items worn (usage log).
- **Key columns:** `id`, `user_id`, `worn_on`, `outfit_id` (nullable),
  `item_id` (nullable).
- **FKs:** `user_id` → `auth.users(id)`; `outfit_id` → `wear_outfits(id)`;
  `item_id` → `wear_items(id)`.
- **Classification:** Private.
- **RLS:** owner only.
- **Retention:** account deletion. _Cost-per-wear is derived from this; not
  stored._
- **Surfaces:** M (primary), A.

### `wear_wishlist`

- **Purpose:** Mindful-purchase candidates.
- **Key columns:** `id`, `user_id`, `name`, `reason`, `status`, `est_price`,
  `catalogue_product_id` (nullable).
- **FKs:** `user_id` → `auth.users(id)`; `catalogue_product_id` →
  `ops_products(id)`.
- **Classification:** Private.
- **RLS:** owner only.
- **Retention:** account deletion.
- **Surfaces:** A, M.

> **Cost-per-wear** = `wear_items.price ÷ count(wear_wear_logs for item)`,
> computed in `packages/domain`. Not persisted.

---

## D. AltaLab

### `lab_skin_baseline`

- **Purpose:** Self-described skin type/concerns (**not a diagnosis**).
- **Key columns:** `user_id` (PK/FK), `skin_type`, `concerns` (text[]),
  `sensitivities` (text[]), `notes`.
- **FKs:** `user_id` → `auth.users(id)`.
- **Classification:** Private (high).
- **RLS:** owner only.
- **Retention:** account deletion.
- **Surfaces:** A, M.

### `lab_products`

- **Purpose:** User's skincare product cabinet.
- **Key columns:** `id`, `user_id`, `name`, `brand`, `category`,
  `key_ingredients` (text[]), `price`, `currency`, `opened_on`,
  `catalogue_product_id` (nullable).
- **FKs:** `user_id` → `auth.users(id)`; `catalogue_product_id` →
  `ops_products(id)`.
- **Classification:** Private.
- **RLS:** owner only.
- **Retention:** account deletion.
- **Surfaces:** A, M.

### `lab_routines`

- **Purpose:** Morning/evening routines.
- **Key columns:** `id`, `user_id`, `time_of_day` (am/pm), `name`.
- **FKs:** `user_id` → `auth.users(id)`.
- **Classification:** Private.
- **RLS:** owner only.
- **Retention:** account deletion.
- **Surfaces:** A, M.

### `lab_routine_steps`

- **Purpose:** Ordered steps in a routine, referencing products.
- **Key columns:** `id`, `user_id`, `routine_id`, `product_id`, `step_order`,
  `instruction`.
- **FKs:** `routine_id` → `lab_routines(id)`; `product_id` → `lab_products(id)`;
  `user_id` → `auth.users(id)`.
- **Classification:** Private.
- **RLS:** owner only.
- **Retention:** with parent routine.
- **Surfaces:** A, M.

### `lab_observations`

- **Purpose:** Dated skin observations (text + optional photo).
- **Key columns:** `id`, `user_id`, `observed_on`, `note`, `image_path`
  (nullable).
- **FKs:** `user_id` → `auth.users(id)`.
- **Classification:** Private (high). Image in private Storage bucket.
- **RLS:** owner only. **Never enters analytics.**
- **Retention:** account deletion.
- **Surfaces:** M (primary), A.

### `lab_experiments`

- **Purpose:** Product experiment journal (hypothesis → observed effect).
- **Key columns:** `id`, `user_id`, `product_id` (nullable), `hypothesis`,
  `started_on`, `ended_on`, `outcome`.
- **FKs:** `user_id` → `auth.users(id)`; `product_id` → `lab_products(id)`.
- **Classification:** Private (high).
- **RLS:** owner only.
- **Retention:** account deletion.
- **Surfaces:** A, M.

> **Routine cost** = sum of `lab_products.price` over a routine's steps,
> normalized per use; computed in `packages/domain`. Not persisted.

---

## E. Shared operational / public (Admin-managed)

### `ops_articles`

- **Purpose:** Educational articles / content.
- **Key columns:** `id`, `slug`, `title`, `domain` (mind/wear/lab/universe),
  `body`, `status`, `published_at`.
- **FKs:** authored-by → operator (in `auth.users` with operator role).
- **Classification:** Public (when published).
- **RLS:** public read for published; write restricted to operator role.
- **Retention:** content lifecycle (draft/published/archived).
- **Surfaces:** W (read), AD (write).

### `ops_products`

- **Purpose:** Product catalogue (reference data for cabinet/wardrobe linking).
- **Key columns:** `id`, `name`, `brand`, `category`, `attributes` (jsonb),
  `status`.
- **FKs:** none required.
- **Classification:** Operational/Public.
- **RLS:** public read (published subset); write operator-only.
- **Retention:** catalogue lifecycle.
- **Surfaces:** W, A, M (read), AD (write).

### `ops_affiliate_links`

- **Purpose:** Affiliate catalogue (outbound links only).
- **Key columns:** `id`, `product_id`, `url`, `partner`, `status`.
- **FKs:** `product_id` → `ops_products(id)`.
- **Classification:** Operational.
- **RLS:** public read (active); write operator-only.
- **Retention:** lifecycle.
- **Surfaces:** W, A (read), AD (write).

### `ops_programs`

- **Purpose:** Structured programs/content series.
- **Key columns:** `id`, `slug`, `title`, `domain`, `description`, `status`.
- **FKs:** none.
- **Classification:** Operational/Public.
- **RLS:** public read (published); write operator-only.
- **Retention:** lifecycle.
- **Surfaces:** W (read), AD (write).

### Reporting views (analytics)

- **Purpose:** Aggregated, anonymized metrics for admin.
- **Key columns:** counts/aggregates only; **no user_id, no private text.**
- **Classification:** Operational (anonymized).
- **RLS/access:** admin reporting role only; built from non-private fields.
- **Retention:** aggregates retained; rebuilt from source.
- **Surfaces:** AD.

---

## F. Relationship summary (high level)

```
auth.users (Alta ID)
 ├─ core_profiles / core_preferences / core_consents / core_notifications
 ├─ mind_* (checkins, journal, life_domains→goals, weekly_resets, decisions)
 ├─ wear_* (style_profile, items→images, outfits→outfit_items, wear_logs, wishlist)
 └─ lab_*  (skin_baseline, products, routines→steps, observations, experiments)

ops_* (articles, products→affiliate_links, programs)  ← admin-managed, shared
ops_audit_log  ← system/admin
```

## G. Retention principles (cross-cutting)

- Private data is deleted on account deletion (after grace period).
- Notifications and export artifacts are time-boxed.
- Consent and audit records may persist for compliance/audit per policy.
- No private free text or images are ever copied into analytics/reporting.

See `RLS_STRATEGY.md` for policy patterns and `../security/PRIVACY_AND_SECURITY.md`
for the full privacy treatment.
