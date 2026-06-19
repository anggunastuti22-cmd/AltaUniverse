# ADR-004 — AltaLab ingredient model & educational pairing awareness

> Status: Accepted
> Date: 2026-06-19
> Deciders: Product owner (human approval on record) + implementation

## Context

AltaLab launched with skincare products whose ingredients were a free-text array
(`lab_products.key_ingredients text[]`). Ingredients were therefore not
navigable, not normalized (typos/variants split the same ingredient), and could
not power any cross-product feature.

Two needs were raised:

1. Make ingredients first-class entities a user can **click** to read about, and
   to see which products contain them.
2. When a morning/evening routine contains ingredients that are **commonly used
   with care together** (e.g. a retinoid and an exfoliating acid), surface
   **awareness** to the user.

Need (2) is sensitive. `docs/product/DOMAIN_BOUNDARIES.md` states AltaLab is
**"Not diagnostic or medical. No condition detection, no treatment advice"** and
that **"ingredient education is generic, not personalized medical advice."**
Per `CLAUDE.md` §5/§10 a feature that edges toward the medical anti-goal requires
an ADR and explicit human approval before work.

## Decision

### 1. Normalize ingredients (clickable entities)

Add catalogue tables (public-read when published, admin-write — mirroring
`lab_products`):

- `lab_ingredients` — one row per ingredient: `slug` (URL key), `name`,
  `inci_name`, `class` (a controlled `ingredient_class`), generic `summary`,
  `is_published`.
- `lab_product_ingredients` — many-to-many between `lab_products` and
  `lab_ingredients`. Readable only for ingredients of **published** products
  (no leaking of unpublished product composition).

`key_ingredients text[]` is retained for backwards compatibility / unstructured
entry; the normalized link supersedes it for navigation.

### 2. Educational pairing awareness — generic, non-personalized, non-blocking

Add `lab_ingredient_pairings` — admin-curated, public-read rows keyed by an
**unordered pair of ingredient classes** with a generic `note` and optional
`source`. Example class pair: `retinoid` + `aha` → a general note that many
routines introduce these on alternate days.

A **pure** function in `packages/domain` derives, from the set of ingredient
classes present in a routine, which curated pairing notes apply. It is computed
live (never stored), returns **education only**, and the UI:

- **never blocks** adding a product or building a routine;
- **never** says "you must not" / "this is unsafe for you";
- is clearly labelled **"General education — not medical advice."**

This keeps the feature on the allowed side of the AltaLab boundary: it is generic
ingredient education, identical for every user, not a personalized clinical
judgement about _their_ skin.

## Boundary guardrails (binding)

- No condition detection, no severity/risk scoring, no "safe/unsafe for you".
- Pairing notes are class-level and generic; they do not reference the user's
  skin profile, concerns, or sensitivities.
- Copy is reviewed to avoid imperative/treatment language; framed as
  "many people choose to…", "worth knowing", with a non-medical disclaimer.
- All pairing content is admin-curated catalogue data with optional sources;
  the app generates none of it dynamically and applies no heuristic beyond
  "both classes are present".

## Consequences

- New catalogue tables + RLS (+ tests), generated types, domain function (+
  tests), seed data, and UI (clickable ingredients, ingredient pages, routine
  pairing notes; admin ingredient management).
- Future option (out of scope here): per-ingredient cadence education, citations
  UI, and richer admin pairing management. AI-assisted explanations remain
  opt-in/off and would need their own consideration.

## Alternatives considered

- **Hard conflict blocking / "do not combine" warnings** — rejected: personalized
  treatment advice, violates the AltaLab medical boundary.
- **Keep free-text ingredients** — rejected for the navigation/normalization
  goals, though the column is retained.
