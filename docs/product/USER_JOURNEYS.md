# Alta Universe — User Journeys

> Status: Draft 1 (architecture & planning phase)
> Last updated: 2026-06-18

These journeys describe how a real person moves through Alta Universe at MVP.
They are written to validate scope and surface boundaries, not as UI specs.

## Personas (shorthand)

- **Maya** — reflective professional; wants clarity and a presentable wardrobe.
- **Devi** — intentional spender; wants to buy less and better.
- **Ari** — self-improver; wants gentle structure without pressure.

---

## J1. First run: one identity, three doors

1. Maya signs up (email + password or magic link).
2. Onboarding explains Alta Universe in one screen and asks:
   - which domains interest her (she can pick all three or start with one);
   - consent choices (AI processing **off by default**, analytics, notifications).
3. A unified **Alta profile** is created (display name, timezone, locale).
4. She lands on **Alta Home**, which shows empty-state prompts for each chosen
   domain and an invitation to do today's check-in.

**Boundaries proven:** one Alta ID; consent captured up front; AI opt-in.

---

## J2. AltaMind — daily rhythm

1. On mobile, Ari opens the app and taps **Daily check-in**.
2. He records mood + energy and a one-line note.
3. He optionally opens **Journal** for a longer private entry, tags it, and
   links it to a life domain ("Career").
4. On Sunday, **Weekly reset** prompts him: wins, friction, next-week intention.
5. Facing a hard choice, he opens **Decision room**, lists options and factors,
   and writes a reflection. *Alta never tells him what to choose.*

**Boundaries proven:** capture is mobile-first; journal text is private and
never enters analytics; decision room is reflective only.

---

## J3. AltaWear — from wardrobe to mindful wear

1. Devi builds her **wardrobe inventory**, adding items with photos, price, and
   acquisition date.
2. She sets a **style profile** (preferred colors, fits, occasions).
3. She composes outfits in the **outfit builder**.
4. Each morning (mobile) she logs the outfit she actually wore via **outfit
   usage log**.
5. Over weeks, **cost-per-wear** reveals that an expensive coat is excellent
   value while a trendy jacket is not.
6. Before buying, she adds a candidate to the **wishlist** with a reason; the
   product reflects rather than pushes the purchase.

**Boundaries proven:** no store/checkout; metrics encourage mindful use, not
buying; images stored privately.

---

## J4. AltaLab — routine, observation, experiment

1. Maya sets a **skin baseline** (self-described type, concerns) — clearly *not
   a diagnosis*.
2. She adds products to the **skincare product cabinet**.
3. She builds **morning** and **evening routines** from those products.
4. Nightly (mobile) she logs a **skin observation** (text + optional photo).
5. Trying a new serum, she opens the **product experiment journal**: hypothesis,
   duration, what she observed.
6. **Routine cost** shows her spend per use, prompting mindful repurchasing.

**Boundaries proven:** educational, not diagnostic; observations are private;
no medical claims.

---

## J5. The connective layer (why "Universe")

1. Alta Home shows Maya a single view: today's check-in status, this evening's
   skincare reminder, and her most-worn outfit this week.
2. A weekly reset in AltaMind can reference (with her consent) that she felt low
   energy on days she skipped her routine — surfaced as a *pattern to reflect
   on*, never as advice or diagnosis.
3. One profile, one set of preferences, one privacy centre govern all three.

**Boundaries proven:** cross-domain reflection stays reflective; consent gates
any cross-domain inference; one identity throughout.

---

## J6. Privacy & control journeys

1. **Consent change:** Ari turns AI processing on later from the privacy centre;
   nothing AI-driven happened before that toggle.
2. **Data export:** Devi requests an export and receives all her personal data.
3. **Account deletion:** Maya deletes her account; she is told it is
   irreversible, given a grace period, and her private data is removed.

**Boundaries proven:** export and deletion are first-class; consent is
revocable; admin is never part of these private flows.

---

## J7. Admin (operator) journey — and its hard limits

1. An operator manages public content, the product catalogue, the affiliate
   catalogue (read-only links), and programs.
2. The operator views **aggregated, anonymized** analytics.
3. The operator handles a support request using metadata and user-shared
   context **only**.
4. The operator **cannot** open any user's journal, skin log, observations, or
   private entries. Attempting to is structurally impossible (RLS + separate
   surface), not merely discouraged.

**Boundaries proven:** least privilege; admin ≠ data access; private content
stays private. See `../architecture/WEB_MOBILE_ADMIN_BOUNDARIES.md`.
