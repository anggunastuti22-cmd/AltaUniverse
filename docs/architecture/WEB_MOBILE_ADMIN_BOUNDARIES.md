# Alta Universe — Web / Mobile / Admin Boundaries

> Status: Draft 1 (architecture & planning phase)
> Last updated: 2026-06-18

This document defines the responsibilities, trust level, and hard limits of each
client surface. The defining rule: **admin must never have unrestricted access
to private user content.**

## 1. Surfaces at a glance

|                     | Web (public) | Web (app)           | Mobile              | Admin                   |
| ------------------- | ------------ | ------------------- | ------------------- | ----------------------- |
| Audience            | Anyone       | Authenticated users | Authenticated users | Operators               |
| Auth                | None         | User session        | User session        | Operator session        |
| Private data access | None         | Own data (RLS)      | Own data (RLS)      | **None (by default)**   |
| Primary job         | Inform       | Manage & reflect    | Capture             | Operate platform        |
| Deploy target       | `apps/web`   | `apps/web`          | `apps/mobile`       | `apps/admin` (separate) |

## 2. Web — public site

- Marketing/educational only: homepage, domain landing pages, product/program
  pages, articles.
- Reads only **public** content (catalogue, articles) — no user-private tables.
- Server-rendered/ISR; no user session required.

## 3. Web — authenticated app

- Full management surface: Alta Home, three domain workspaces, account & privacy
  centre.
- Accesses **only the signed-in user's own data**, enforced by RLS.
- Hosts privacy operations UI (export, deletion, consent).
- Uses the anon/auth Supabase key; never the service role.

## 4. Mobile (Expo React Native)

- **Capture-first:** daily check-in, quick journal, outfit logging, skin
  logging, routine reminders, notification centre.
- Same RLS-scoped access as the web app (own data only).
- Shares `domain`/`validation`/`types`/`design-tokens` with web for consistent
  rules and look.
- Handles push notifications and offline-friendly capture (where feasible).

## 5. Admin — and its hard limits

### Admin CAN:

- Manage public content and educational articles.
- Manage the product catalogue and affiliate catalogue (read-only outbound
  links).
- Manage programs.
- View **aggregated, anonymized** analytics.
- Use support tools operating on **metadata and user-shared context only**.

### Admin CANNOT (structurally, not by policy alone):

- ❌ Read any user's journal, check-ins, decisions, or goals.
- ❌ Read any user's skin baseline, observations, or experiments.
- ❌ Read any user's wardrobe items, outfits, wear logs, wishlist, or images.
- ❌ Bypass RLS on private tables.
- ❌ Browse private entries "for support" without an explicit, audited,
  user-authorized escalation (deferred; not in MVP).

### How the limit is enforced:

1. **Separate application** (`apps/admin`) with its own operator auth and roles.
2. **Least-privilege DB role** for admin: granted only on public/operational
   tables and anonymized reporting views. Private tables are simply not in its
   grant set.
3. **No service-role key in admin clients.** Any privileged operation goes
   through a dedicated, audited Edge Function with a narrow purpose.
4. **RLS remains on** for everything; admin's role does not include
   policy-bypass on private data.
5. **Audit logging** on every privileged admin action.

## 6. Shared vs. surface-specific code

- Shared (in `packages/`): domain rules, validation, types, design tokens, UI
  primitives, analytics contracts.
- Surface-specific (in each app): navigation, platform UI, capture ergonomics
  (mobile), operator workflows (admin), public marketing pages (web).

## 7. Analytics boundary

- Events are defined in `packages/analytics` with a strict, reviewed schema.
- **No private free text** (journal, observations, notes) is ever emitted.
- Admin sees analytics only as aggregates/anonymized reporting — never
  row-level private data.

## 8. Summary rule

> Users own and access their private data on web and mobile.
> Admin operates the platform and never sees private data by default.
> Anything that would weaken this requires an ADR and explicit human approval.
