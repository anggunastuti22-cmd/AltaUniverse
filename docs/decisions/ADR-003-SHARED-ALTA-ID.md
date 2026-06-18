# ADR-003: One Shared Alta ID Across All Domains

> Status: Accepted
> Date: 2026-06-18
> Deciders: Product Architecture

## Context

Alta Universe is positioned as **one intelligent life system**, not three
separate apps. AltaMind, AltaWear, and AltaLab must share a single identity,
profile, preferences, consent, and privacy controls. The connective value — Alta
Home, cross-domain reflection (with consent), one privacy centre — only works if
every domain references the same user.

Options considered:

1. **One shared identity (single Alta ID)** for all domains and surfaces.
2. **Per-domain identities** linked by some mapping table.
3. **Separate accounts per app** that users optionally connect later.

## Decision

Use **one shared Alta ID** for every user, established by **Supabase Auth**
(`auth.users.id`). All domain data references this single ID:

- `core_profiles.id = auth.users.id` (one profile per identity).
- Every private table carries `user_id` → `auth.users(id)`.
- Preferences, consent, notifications, export, and deletion are all keyed to the
  one Alta ID.
- All surfaces (public web, app web, mobile, admin operators) authenticate
  against the same identity system; users sign in once per device/surface and
  reach all consented domains.

Cross-domain features read across a user's domains **only with explicit consent**
and present results as reflection, never as authoritative inference (see
`../product/DOMAIN_BOUNDARIES.md`).

## Consequences

**Positive**

- Delivers the core "one identity, three expressions" promise.
- Single profile/preferences/consent/privacy centre — no duplication or drift.
- RLS is uniform: `user_id = auth.uid()` works identically across all domains.
- Export and deletion are coherent: one identity → all data.

**Negative / costs**

- The Alta ID is a high-value blast radius; its compromise affects all domains.
  Mitigated by RLS, least privilege, audited privileged ops, and no client
  secrets.
- Cross-domain features must be carefully consent-gated to avoid leaking signal
  between domains.

**Mitigations**

- Consent is granular and revocable; cross-domain reads require explicit
  consent.
- Domain boundaries are enforced in code (`packages/domain`, `validation`) and
  in the schema (namespaced tables + RLS).
- Strong auth practices on the single identity (managed by Supabase Auth).

## Alternatives rejected

- **Per-domain or separate identities:** rejected — they fragment the product,
  complicate consent/export/deletion, and contradict the positioning. Linking
  later is more complex and error-prone than starting unified.
