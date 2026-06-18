# Alta Universe — Domain Boundaries

> Status: Draft 1 (architecture & planning phase)
> Last updated: 2026-06-18

This document defines where each domain begins and ends, what is shared, and
what must never leak between domains without explicit user consent. It is the
contract that keeps the product coherent and prevents scope creep.

## 1. The shared core (Alta Core)

Owned by no single domain; used by all:

- **Identity & auth** — the Alta ID, sessions, credentials (Supabase Auth).
- **Profile** — display name, locale, timezone, avatar.
- **Preferences** — theme, units, notification settings, AI opt-in.
- **Consent** — granular, revocable permissions.
- **Notifications** — delivery and the notification centre.
- **Privacy operations** — export and deletion span all domains.

Rule: domains depend on the core; the core never depends on a domain.

## 2. AltaMind — boundaries

**In:** daily check-in, journal, life domains, goals, weekly reset, decision
room.

**Owns:** the most sensitive free-text data in the product.

**Out / never:**
- Not a productivity/task manager (no kanban, no project management).
- Not a clinical mental-health tool (no diagnosis, no risk scoring).
- The decision room frames decisions; it never makes them.

**Shared interfaces:** may *reference* (read, with consent) cross-domain signals
for reflection (e.g., routine adherence) — but stores its own private text in
its own tables.

## 3. AltaWear — boundaries

**In:** style profile, wardrobe inventory, item images, outfit builder, outfit
usage log, cost-per-wear, wishlist.

**Owns:** wardrobe items, outfits, wear logs, wishlist.

**Out / never:**
- Not a store; no checkout, cart, or payment.
- Not a fashion social network; no public feeds or comparison.
- Wishlist is a reflection tool, not a buy button.

**Shared interfaces:** product catalogue (from admin) may inform item metadata
or wishlist suggestions, read-only.

## 4. AltaLab — boundaries

**In:** skin baseline, product cabinet, routines, observation log, experiment
journal, routine cost.

**Owns:** products, routines, observations, experiments, skin baseline.

**Out / never:**
- Not diagnostic or medical. No condition detection, no treatment advice.
- Not a review platform; observations are private to the user.
- "Baseline" and "observation" are self-reported, never clinical findings.

**Shared interfaces:** product catalogue (from admin) may inform cabinet
entries, read-only; ingredient education is generic, not personalized medical
advice.

## 5. Cross-domain rules

1. **Consent gates cross-domain reads.** AltaMind reflecting on AltaLab
   adherence requires explicit user consent.
2. **Reflection, not inference-as-fact.** Any cross-domain pattern is presented
   as something to consider, never as a conclusion or recommendation that
   carries authority.
3. **No silent data movement.** Data does not flow from one domain to another
   except through documented, consented interfaces.
4. **Private text never crosses into analytics.** Ever. (See security doc.)

## 6. Ownership & data classification summary

| Data | Domain | Classification |
| --- | --- | --- |
| Profile, preferences, consent | Core | Private (personal, low-sensitivity) |
| Journal, check-ins, decisions, goals | AltaMind | Private (high-sensitivity) |
| Wardrobe, outfits, wear logs, wishlist | AltaWear | Private |
| Item images | AltaWear | Private (storage) |
| Skin baseline, observations, experiments | AltaLab | Private (high-sensitivity) |
| Product / affiliate / program catalogue | Admin (shared) | Public/operational |
| Educational articles | Admin (shared) | Public |
| Aggregated analytics | Core/Admin | Anonymized/operational |

Full column-level treatment is in `../database/INITIAL_DATA_MODEL.md`.

## 7. Boundary enforcement mechanisms

- **Schema separation** — each domain's tables are namespaced and owned.
- **RLS** — user-scoped policies on every private table.
- **Surface separation** — admin runs on a separate app and role; it cannot
  reach private tables (see boundaries doc).
- **Shared packages** — `domain`, `validation`, and `types` encode these rules
  in code so every surface enforces them identically.

## 8. Anti-goals (guardrails restated)

If a proposed feature makes Alta Universe feel like a store, a social feed, a
medical tool, a task manager, or an AI that decides for the user — it is on the
wrong side of a boundary and requires an ADR before any work begins.
