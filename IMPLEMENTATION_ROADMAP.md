# Alta Universe — Implementation Roadmap

> Status: MVP build in progress
> Last updated: 2026-06-19

This roadmap divides the build into **independently testable phases**, each with
explicit acceptance criteria. No production deployment happens without explicit
human approval (see `CLAUDE.md`). Phases are sequenced so each delivers
verifiable value and de-risks the next.

## Delivery status at a glance

Schema/RLS, server logic, web UI, Edge Functions, and mobile capture are built.
Migrations 0001–0012 are applied to the live project; 0013 (FK indexes) and 0014
(AltaLab ingredients) are committed and were applied via the SQL Editor pending a
Supabase reconnect to re-verify. The remaining work is operator/account
configuration the maintainer must complete (Supabase Auth URL + email provider,
granting the first admin role) and a live end-to-end pass once real accounts
exist.

| Phase | Area                                  | Status                                     |
| ----- | ------------------------------------- | ------------------------------------------ |
| 0     | Foundations (repo, tooling, CI)       | ✅ Built                                   |
| 1     | Alta Core: identity, profile, consent | ✅ Built · ⏳ Auth config pending          |
| 2     | AltaMind capture (web + mobile)       | ✅ Built                                   |
| 3     | Alta Home + notifications             | ✅ Built                                   |
| 4     | AltaMind completion                   | ✅ Built                                   |
| 5     | AltaWear MVP                          | ✅ Built                                   |
| 6     | AltaLab MVP                           | ✅ Built                                   |
| 7     | Privacy operations: export & deletion | ✅ Built (grace-period purge live)         |
| 8     | Admin console                         | ✅ Built · ⏳ first admin grant pending    |
| 9     | Public website                        | ✅ Built                                   |
| 10    | Hardening & MVP readiness             | ✅ Built · ⏳ live advisors + launch gates |

Legend: ✅ implemented & tested in repo · ⏳ needs live config or a final pass.

> Note: phase scopes below use the original conceptual table names (`core_*`,
> `ops_*`). For how these map to the live tables (e.g. `core_profiles`→
> `profiles`, `ops_audit_log`→`audit_events`, and which were deferred), see the
> naming map in `docs/database/INITIAL_DATA_MODEL.md`.

---

## Phase 0 — Foundations (repo, tooling, CI)

**Goal:** A working monorepo skeleton with no product features.

**Scope**

- pnpm workspaces + Turborepo; `apps/` and `packages/` scaffolding.
- Strict TypeScript, shared ESLint/Prettier from `packages/config`.
- Env schema (no secret values); CI with lint, typecheck, test, secret scan.
- Supabase local stack (`supabase/config.toml`), empty migrations dir,
  `seed.sql` placeholder (dev-only data).

**Acceptance criteria**

- [ ] `pnpm install` and a no-op build/test pass locally and in CI.
- [ ] Import-boundary and no-cycle checks pass.
- [ ] Secret scanning runs in CI and fails on a planted test secret.
- [ ] Supabase local stack starts; an empty migration applies cleanly.

---

## Phase 1 — Alta Core: identity, profile, consent

**Goal:** A user can sign up, onboard, and own a unified profile with consents.

**Scope**

- Supabase Auth integration (one Alta ID); `apps/web` auth flows.
- Migrations + RLS for `core_profiles`, `core_preferences`, `core_consents`.
- Onboarding (domain selection, consent capture, AI opt-in OFF by default).
- `packages/database` typed client + generated types; `packages/validation`
  schemas for core entities.

**Acceptance criteria**

- [ ] User can sign up / log in / log out (email+password and magic link).
- [ ] One profile row is created per identity; preferences persist.
- [ ] Consents are granular, revocable, and recorded with timestamps.
- [ ] RLS verified on all `core_*` private tables (owner-only; anon denied;
      operator denied) with passing tests.
- [ ] No secrets in client bundles (verified).

---

## Phase 2 — First vertical slice: AltaMind capture (web + mobile)

**Goal:** Prove the end-to-end stack on the lowest-risk, highest-signal flow.
_(This is the recommended first vertical slice — see report.)_

**Scope**

- Migrations + RLS for `mind_checkins`, `mind_journal_entries`,
  `mind_life_domains`.
- `apps/web` AltaMind workspace: daily check-in + journal + life domains.
- `apps/mobile` (Expo) capture: daily check-in + quick journal.
- Domain rule in `packages/domain`: one check-in per day; shared `validation`.
- `packages/analytics` event contract proven (metadata only, no private text).

**Acceptance criteria**

- [ ] User creates exactly one check-in per day (enforced) on web and mobile.
- [ ] Journal entries are private, owner-only (RLS tests pass).
- [ ] Mobile and web share the same domain rules and validation.
- [ ] Analytics emits no private text (verified by test/contract).
- [ ] Accessibility baseline passes on the new screens (keyboard, contrast,
      labels).

---

## Phase 3 — Alta Home + notifications

**Goal:** The connective dashboard and reminders exist.

**Scope**

- `apps/web` + `apps/mobile` Alta Home cross-domain view.
- `core_notifications`; routine/weekly-reset reminder scheduling.
- Notification centre (mobile primary).

**Acceptance criteria**

- [ ] Alta Home shows today's check-in status and recent activity for enabled
      domains, scoped to the user.
- [ ] Reminders schedule and surface in the notification centre.
- [ ] RLS verified on `core_notifications`.
- [ ] No cross-user leakage in Home (negative tests pass).

---

## Phase 4 — AltaMind completion

**Goal:** Full AltaMind MVP.

**Scope**

- `mind_goals`, `mind_weekly_resets`, `mind_decisions` (+ migrations/RLS).
- Goals tied to life domains; weekly reset flow; decision room (reflective).

**Acceptance criteria**

- [ ] Goals attach to life domains; weekly reset is one-per-week (enforced).
- [ ] Decision room stores options/factors/reflection; makes **no** decision.
- [ ] RLS verified on all new tables.

---

## Phase 5 — AltaWear MVP

**Goal:** Wardrobe, outfits, usage, cost-per-wear, wishlist.

**Scope**

- `wear_*` tables + RLS; private Storage bucket for item images.
- Style profile, inventory, item images, outfit builder, usage log, wishlist.
- Cost-per-wear computed in `packages/domain` (not persisted).
- Mobile outfit logging.

**Acceptance criteria**

- [ ] Items, outfits, and wear logs are owner-only (RLS + Storage tests pass).
- [ ] Image upload uses private, per-user paths with signed URLs.
- [ ] Cost-per-wear computes correctly from logged wears (unit-tested).
- [ ] Mobile outfit logging works end-to-end.

---

## Phase 6 — AltaLab MVP

**Goal:** Skin baseline, cabinet, routines, observations, experiments, cost.

**Scope**

- `lab_*` tables + RLS; private Storage bucket for observation images.
- Baseline (non-diagnostic), cabinet, routines + steps, observation log,
  experiment journal, routine cost (computed in `domain`).
- Mobile skin logging.

**Acceptance criteria**

- [ ] All `lab_*` tables owner-only (RLS + Storage tests pass).
- [ ] No diagnostic language anywhere; baseline/observations clearly
      self-reported.
- [ ] Routine cost computes correctly (unit-tested).
- [ ] Mobile skin logging works end-to-end.

---

## Phase 7 — Privacy operations: export & deletion

**Goal:** Users can export and delete all their data.

**Scope**

- Edge Functions for export bundling and deletion orchestration (service role,
  audited).
- `core_data_exports`, `core_deletion_requests`, `ops_audit_log`.
- Account & privacy centre UI in `apps/web`.

**Acceptance criteria**

- [ ] Export produces a complete artifact of the user's data via signed,
      expiring URL.
- [ ] Deletion runs with a grace period and purges private data; minimal audit
      record persists.
- [ ] Every privileged op writes to `ops_audit_log`.
- [ ] Service-role key never present in any client (verified).

---

## Phase 8 — Admin console (operational, no private access)

**Goal:** Operators manage content/catalogue/programs and see anonymized
analytics — with no private data access.

**Scope**

- `apps/admin` separate app + operator role.
- `ops_articles`, `ops_products`, `ops_affiliate_links`, `ops_programs`.
- Anonymized reporting views; support tools on metadata only.

**Acceptance criteria**

- [ ] Operator can CRUD operational/public content.
- [ ] Operator role has **no grant** on any private table (verified — query
      attempts fail).
- [ ] Analytics views expose no `user_id` or private text.
- [ ] All admin privileged actions are audited.

---

## Phase 9 — Public website

**Goal:** Marketing/educational surface.

**Scope**

- Homepage, three domain landing pages, product/program pages, articles in
  `apps/web` (public).

**Acceptance criteria**

- [ ] Public pages render with no access to private tables.
- [ ] Published content reads via public RLS policy only.
- [ ] Accessibility + responsive baselines pass; performance acceptable.

---

## Phase 10 — Hardening & MVP readiness

**Goal:** Ship-ready quality.

**Scope**

- Full RLS test sweep, accessibility audit, responsive audit, performance pass.
- Seed/dev-data review (no production data anywhere).
- Documentation alignment with implementation.

**Acceptance criteria**

- [x] Every user table has passing RLS tests. _(per-table `rls.test.sql` +
      schema-wide `rls_coverage.test.sql`; 73 DB tests.)_
- [x] WCAG 2.1 AA baseline met on primary flows. _(focus-visible, reduced-motion,
      AA contrast with regression tests, heading structure, semantic tables,
      labelled inputs, live regions.)_
- [x] MVP "definition of done" in `docs/product/MVP_SCOPE.md` fully satisfied
      at the code level. _(See the DoD status table there; remaining gates are
      operational — live Auth config + first admin grant.)_
- [x] No production deployment without explicit human approval. _(No automated
      prod deploy exists; schema changes applied only on explicit request.)_

Remaining before external launch (operational, owner-driven): rotate any exposed
credentials, configure Supabase Auth URL/email, grant the first admin role, then
a live end-to-end pass. Performance: FK-index pass shipped (0013); full live
advisor run pending Supabase reconnect.

---

## Cross-phase definition of done (applies to every phase)

- Strict TypeScript; no `any` escapes without justification.
- Migrations-only schema changes, with RLS in the same migration.
- Tests written and passing before a phase is "complete."
- No secrets in source; secret scan green.
- Accessibility and responsive checks for any new UI.
- Reusable components/logic placed in `packages/`, not duplicated in apps.

## Deferred beyond MVP (tracked, not built)

- Opt-in AI features (reflection/education only; never diagnosis/decisions).
- Social/sharing, marketplace/checkout, advanced analytics.
- Audited user-authorized support escalation flow.
- Wearable/device integrations; formal incident runbook.
