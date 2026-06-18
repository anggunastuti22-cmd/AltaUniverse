# Alta Universe — Privacy & Security

> Status: Draft 1 (architecture & planning phase)
> Last updated: 2026-06-18

Privacy is a product feature, not a compliance afterthought. This document is
the authoritative statement of how Alta Universe protects users.

## 1. Privacy principles (the contract)

1. **User-owned private data.** The user owns their journal, observations,
   wardrobe, and all personal content; the platform is custodian.
2. **Least-privilege access.** No surface, role, or service sees more than it
   needs.
3. **Row Level Security on all exposed user tables.** No exceptions.
4. **Admin cannot browse private entries by default.** Structurally enforced.
5. **No private journal/observation text in analytics.** Ever.
6. **No secrets in clients.** Service-role keys and provider secrets stay
   server-side.
7. **AI processing is opt-in.** Off by default; nothing AI-driven runs without
   consent.
8. **AI cannot diagnose medical conditions.** Educational/reflective only.
9. **Users can export and delete their data.** First-class flows.
10. **Audit privileged operations.** Every elevated action is logged.
11. **Development data only during development.** No production/real user data
    in dev or test.

## 2. Data classification

| Class | Examples | Handling |
| --- | --- | --- |
| Private (high) | journal, check-ins, decisions, weekly resets, skin baseline, observations, experiments, images | RLS owner-only; never in analytics; encrypted at rest (Supabase); private Storage. |
| Private | profile, preferences, wardrobe, outfits, wear logs, wishlist, products, routines | RLS owner-only. |
| Compliance | consents, deletion/export records, audit log | Restricted; retained per policy. |
| Operational/Public | articles, product/affiliate/program catalogue, anonymized analytics | Public read where published; operator-managed. |

See `../database/INITIAL_DATA_MODEL.md` for table-level classification.

## 3. Access control

- **Authentication:** Supabase Auth; one Alta ID (ADR-003).
- **Authorization:** RLS on every user table (`../database/RLS_STRATEGY.md`).
- **Roles:** `anon`, `authenticated`, `operator`, `service_role` — with the
  operator role holding **no grant** on private tables.
- **Surfaces:** admin is a separate app and cannot reach private data
  (`../architecture/WEB_MOBILE_ADMIN_BOUNDARIES.md`).

## 4. Secrets management

- No secret values in the repository; env described by schema in
  `packages/config`.
- Service-role key and any provider keys live only in Edge Function / server
  environments.
- Clients receive only the anon/public key.
- Secret scanning runs in CI; a committed secret blocks the build.

## 5. Analytics & telemetry

- Events are defined by a strict, reviewed contract in `packages/analytics`.
- **Prohibited in any event:** journal text, observation notes, decision text,
  check-in notes, images, or anything that could re-identify a user's private
  content.
- Allowed: anonymized/aggregated counts, feature usage, performance metrics.
- Analytics consent is separate and revocable.

## 6. AI safety & boundaries

- AI is **opt-in**, off by default, deferred beyond the first vertical slice.
- All AI calls run server-side (Edge Functions); prompts/keys never in clients.
- AI **must not** diagnose, treat, or make final decisions for the user.
- AI outputs are framed as reflection/education and clearly labeled as
  AI-generated.
- Input minimization: only consented, necessary data is sent; private text is
  included only with explicit consent for that purpose.
- When AI is added, use the latest, most capable Claude models.

## 7. Storage security

- Private images (wardrobe, skin) in private buckets, path-scoped by `user_id`.
- Access only via short-lived signed URLs.
- Storage policies mirror table RLS ownership.

## 8. Data subject rights

- **Export:** user-initiated; produces a complete, time-boxed export artifact.
- **Deletion:** user-initiated; irreversible; grace period then purge of private
  data; minimal compliance/audit records may persist.
- **Consent:** granular and revocable from the privacy centre; history retained.
- These flows run via audited Edge Functions, never via admin browsing.

## 9. Auditing

- `ops_audit_log` records privileged/admin actions (actor, action, target ref,
  timestamp, metadata) with **no private user content**.
- Export/deletion operations are audited.
- Audit logs are retained per security policy and readable only by restricted
  roles.

## 10. Secure development practices

- Strict TypeScript; shared validation (Zod) at all trust boundaries.
- Migrations-only schema changes with RLS in the same migration.
- Dependency and secret scanning in CI.
- Code review required; security-relevant changes flagged.
- No production deployment without explicit human approval (`CLAUDE.md`).
- Development uses only synthetic/seed data.

## 11. Incident readiness (MVP-level)

- Principle of least standing access limits blast radius.
- Audit log supports forensic review.
- Deletion/export tooling supports rapid response to user requests.
- A formal incident runbook is a documented follow-up (deferred, tracked in
  roadmap).

## 12. Open questions / follow-ups

- Field-level encryption for the highest-sensitivity text beyond at-rest
  encryption — evaluate need vs. usability.
- Formal data retention windows per jurisdiction.
- Audited, user-authorized support escalation flow (explicitly deferred from
  MVP).
