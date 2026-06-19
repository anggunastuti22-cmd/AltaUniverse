# Alta Universe — MVP Scope

> Status: Implemented — all MVP capabilities are built and the definition of done
> is met at the code level (see §8). Remaining gates are operational, not code:
> live Supabase Auth config (Site URL/redirect/email) and granting the first
> admin role. Source of truth for schema is `supabase/migrations/`.
> Last updated: 2026-06-19

This document is the authoritative list of what is **in** and **out** of the
first shippable version of Alta Universe. Anything not listed here is out of
scope until a documented decision adds it.

## 1. Scope philosophy

The MVP must prove the core thesis: **one identity across three domains, with
private data the user owns and reflects on.** Every feature below earns its
place by supporting capture, reflection, or mindful decision-making — never raw
consumption.

## 2. Alta Core (shared foundation)

| Capability         | Description                                                           | Surfaces                     |
| ------------------ | --------------------------------------------------------------------- | ---------------------------- |
| Sign-up & login    | Email/password + magic link via Supabase Auth.                        | web, mobile                  |
| Onboarding         | Lightweight intro, consent capture, domain selection.                 | web, mobile                  |
| Unified profile    | One Alta ID; display name, locale, timezone, avatar.                  | web, mobile, admin (limited) |
| User preferences   | Theme, units, notification preferences, AI opt-in.                    | web, mobile                  |
| Consent management | Granular, revocable consents (AI, analytics, notifications).          | web, mobile                  |
| Alta Home          | Cross-domain dashboard; today's check-in, reminders, recent activity. | web, mobile                  |
| Notifications      | Routine reminders, weekly reset nudge, notification centre.           | mobile (primary), web        |
| Data export        | User-initiated export of all personal data.                           | web                          |
| Account deletion   | User-initiated, irreversible deletion with grace period.              | web                          |

## 3. AltaMind (MVP)

| Capability     | Description                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| Daily check-in | Mood/energy/short note; one per day, editable same day.                                                          |
| Journal        | Private free-text entries, optional tags, optional domain link.                                                  |
| Life domains   | User-defined areas of life (e.g., career, health, relationships).                                                |
| Goals          | Goals attached to life domains; status and reflection, not strict tracking.                                      |
| Weekly reset   | Guided weekly review: wins, friction, intention for next week.                                                   |
| Decision room  | Structured space to frame a decision (options, factors, reflection). **Reflective, never decides for the user.** |

## 4. AltaWear (MVP)

| Capability         | Description                                               |
| ------------------ | --------------------------------------------------------- |
| Style profile      | Preferences, colors, fit notes, occasions.                |
| Wardrobe inventory | Items with category, attributes, price, acquisition date. |
| Item images        | User photos of items via Supabase Storage.                |
| Outfit builder     | Compose outfits from inventory items.                     |
| Outfit usage log   | Record when an outfit/item was worn.                      |
| Cost-per-wear      | Derived metric: item price ÷ wear count.                  |
| Wishlist           | Mindful-purchase candidates with reason and status.       |

## 5. AltaLab (MVP)

| Capability                 | Description                                                             |
| -------------------------- | ----------------------------------------------------------------------- |
| Skin baseline              | Self-described skin type, concerns, sensitivities. **Not a diagnosis.** |
| Skincare product cabinet   | Products owned, with category, key ingredients, price.                  |
| Morning & evening routine  | Ordered step lists referencing cabinet products.                        |
| Skin observation log       | Private, dated observations (text + optional photo).                    |
| Product experiment journal | Structured trials: hypothesis, product, duration, observed effect.      |
| Routine cost               | Derived spend per routine / per use.                                    |

## 6. Cross-cutting MVP requirements

- All user tables protected by Row Level Security from day one.
- All three domains reachable from Alta Home with one shared profile.
- Mobile supports capture flows (check-in, journal, outfit log, skin log,
  reminders, notification centre); web supports full management.
- Data export and account deletion functional before any external launch.

## 7. Explicitly OUT of MVP scope

These are recognized as plausible future work but **must not** be built now:

- Social/sharing features, feeds, or comparison with other users.
- Marketplace, checkout, or in-app purchasing of products.
- Affiliate purchasing flows beyond a read-only catalogue in admin.
- Advanced AI: auto-generated outfits, AI skin analysis from photos, predictive
  mood analysis. (AI hooks are _opt-in and deferred_; see roadmap.)
- Medical/diagnostic features of any kind.
- Wearable/device integrations.
- Team, family, or multi-user shared accounts.
- Public content authoring by users.
- Gamification (streaks-as-pressure, leaderboards).

## 8. MVP definition of done

The MVP is "done" when:

1. A user can sign up, onboard, set preferences and consents.
2. A user can use at least the core capture flow in **each** of the three
   domains.
3. Alta Home shows a coherent cross-domain view.
4. Cost-per-wear and routine cost compute correctly from logged data.
5. The user can export and delete all their data.
6. RLS is verified on every user table (see `../database/RLS_STRATEGY.md`).
7. Admin can manage content/catalogue but cannot read any private entry.
8. Accessibility and responsive baselines pass (see design handoff).

### Status (2026-06-19) — met at code level

| #   | Criterion                           | Evidence                                                                              |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | Sign-up / onboard / prefs / consent | `apps/web` auth, `onboarding`, `account/privacy`; `user_preferences`, `user_consents` |
| 2   | Core capture in each domain         | mind check-in/journal, wear wardrobe/usage, lab cabinet/observations (web + mobile)   |
| 3   | Cross-domain Alta Home              | `apps/web/app/(app)/home`                                                             |
| 4   | Cost-per-wear & routine cost        | `packages/domain/cost.ts` (unit-tested); used in wear/lab                             |
| 5   | Export & delete                     | Edge fns `export-user-data` / `delete-account`; grace-period purge (0011)             |
| 6   | RLS on every user table             | pgTAP `rls.test.sql` + schema-wide `rls_coverage.test.sql`                            |
| 7   | Admin manages content, not private  | `apps/admin`; tests "admin cannot read private journal/skin logs"                     |
| 8   | A11y & responsive baseline          | focus-visible, reduced-motion, AA contrast (tested), headings, semantic tables        |

Operational gates that remain (not code): live Auth URL/email configuration and
granting the first admin role; a live end-to-end pass once real accounts exist.

> Phased acceptance criteria live in `../../IMPLEMENTATION_ROADMAP.md`.
