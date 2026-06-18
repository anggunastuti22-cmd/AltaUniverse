# Supabase Edge Functions

Server-side, secret-bearing logic lives here (CLAUDE.md §2, §4).

- Privileged operations (e.g. data export, account deletion, future opt-in AI)
  run as Edge Functions using the **service-role** key — which exists only in
  the server environment and is **never** bundled into web/mobile/admin clients.
- Every privileged operation must write to `ops_audit_log` (see
  `docs/security/PRIVACY_AND_SECURITY.md`).

No functions exist yet; they are introduced in later phases
(see `IMPLEMENTATION_ROADMAP.md`, Phase 7+).

## Workflow

```bash
supabase functions new <name>
supabase functions serve <name>   # local
```
