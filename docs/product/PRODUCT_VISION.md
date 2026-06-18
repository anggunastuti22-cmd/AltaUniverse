# Alta Universe — Product Vision

> Status: Draft 1 (architecture & planning phase)
> Owner: Product Architecture
> Last updated: 2026-06-18

## 1. One-line definition

Alta Universe is a human-centered **personal intelligence and lifestyle
ecosystem** that helps people understand themselves, express themselves, and
care for themselves — connected into one intelligent life system.

## 2. The three domains

| Domain       | Purpose                                                                | Promise to the user    |
| ------------ | ---------------------------------------------------------------------- | ---------------------- |
| **AltaMind** | Mind, decisions, goals, emotions, routines, direction.                 | _Understand yourself._ |
| **AltaWear** | Wardrobe, personal style, professional presence, mindful purchasing.   | _Express yourself._    |
| **AltaLab**  | Skincare routines, product usage, skin observations, mindful spending. | _Care for yourself._   |

Alta Universe is the connective layer that links these three into a single,
privacy-conscious life system with one identity, one profile, and one set of
preferences.

## 3. Why this exists

People manage their inner life, their outward expression, and their physical
self-care in disconnected tools — notes apps, spreadsheets, photo albums,
shopping carts, and memory. None of these reflect anything back to the user, and
none of them respect that this data is deeply personal.

Alta Universe brings these together with three commitments:

1. **Reflection over judgement** — we surface patterns; the user draws
   conclusions.
2. **Education over diagnosis** — we inform and contextualize; we never
   diagnose.
3. **Mindfulness over consumption** — we encourage intentional choices, not
   more spending.

## 4. What Alta Universe **is**

- A personal intelligence platform.
- Reflective rather than judgmental.
- Educational rather than diagnostic.
- Mindful rather than consumption-driven.
- Human-centered.
- Privacy-conscious by design.
- Premium but accessible.

## 5. What Alta Universe is **not**

- ❌ A generic productivity app.
- ❌ A generic journal app.
- ❌ An online fashion store.
- ❌ A beauty review platform.
- ❌ A medical diagnosis system.
- ❌ An AI that makes final life decisions for users.

These boundaries are load-bearing. Features that pull the product toward any of
the above are out of scope unless a documented decision (ADR) changes the
positioning.

## 6. Design principles

1. **One identity, three expressions.** A single Alta ID flows across all
   domains and surfaces. (See `ADR-003-SHARED-ALTA-ID.md`.)
2. **The user owns their data.** Private content belongs to the user; the
   platform is a custodian, not an owner.
3. **Least privilege everywhere.** No surface, role, or service sees more than
   it needs.
4. **AI is opt-in and transparent.** No hidden AI decisions; users always know
   when and why AI is involved.
5. **Calm, premium, accessible.** Visually refined, low-noise, and usable by
   everyone (WCAG-aligned).
6. **Mobile and web are peers.** Capture is mobile-first; reflection and
   planning are web-first; both share the same domain logic.

## 7. Primary audiences

- **The reflective professional** — wants clarity of mind, a presentable
  wardrobe, and healthy skin, without juggling five apps.
- **The intentional spender** — wants to buy less and better across clothing
  and skincare, justified by usage and outcomes.
- **The self-improver** — wants gentle structure (check-ins, routines, weekly
  resets) without gamified pressure.

## 8. Success signals (qualitative, MVP-era)

- Users return to log/check in across **more than one** domain.
- Users complete a weekly reset and report it felt useful, not nagging.
- Users make a wardrobe or skincare decision they describe as _more mindful_.
- Zero privacy incidents; admin never needs (or has) access to private entries.

> Quantitative product metrics are deliberately deferred until after the first
> vertical slice ships. We measure value before we optimize for it.

## 9. Non-negotiables that constrain everything downstream

- Row Level Security on every user-exposed table.
- No private journal/skin text in analytics.
- No secrets in clients.
- Users can export and delete their data.
- AI cannot diagnose medical conditions.
- Privileged operations are audited.

See `docs/security/PRIVACY_AND_SECURITY.md` for the full treatment.

## 10. Related documents

- `MVP_SCOPE.md` — what we build first.
- `USER_JOURNEYS.md` — how people move through the product.
- `DOMAIN_BOUNDARIES.md` — where each domain starts and stops.
- `../architecture/SYSTEM_ARCHITECTURE.md` — how it is built.
