# Human-owned production gates

These gates require account-owner, provider-dashboard, legal, or physical-device evidence. Repository code and CI alone cannot close them.

| Gate | Required evidence | Current status | Owner/action |
|---|---|---|---|
| Canonical architecture inputs | Supply or confirm the authoritative `docs/architecture.md` and `docs/blueprint-extract.md`; they are absent from the checked `main` tree | BLOCKED — source inputs absent | Project owner |
| Git local checkout identity | `git status`, branch list, remotes, and local author identity from a trusted checkout | NOT VERIFIED in this session | Repository operator |
| Local toolchain baseline | Actual `node -v`, `pnpm -v`, install and test commands with exit codes | NOT RUN in this session | Repository operator |
| GitHub author identity policy | Confirm whether commits must use `banglarvoice33-byte` / `banglarvoice33@gmail.com`; connector identity matches login, but local Git author config was not read | PARTIAL | Project owner/operator |
| Supabase Auth CAPTCHA | Confirm Turnstile provider and secret in Supabase Auth settings; perform real login, signup, retry and failure tests on canonical production hostname | NOT VERIFIED by repository source/CI | Supabase project owner |
| Malware scanner production readiness | Provide a supported scanner endpoint/key and prove clean, EICAR/malicious, authentication failure, timeout/outage, and owner isolation against production-like storage | NOT VERIFIED for production | Security/operator owner |
| Supabase migration/RLS parity | Run migration list on staging and remote; verify parity and both positive and negative cross-owner RLS cases | NOT RUN in this session | Database operator |
| Production Vercel acceptance | Verify canonical URL, exact deployed commit, readiness, security headers, auth smoke test and rollback rehearsal | NOT VERIFIED in this phase | Vercel/project owner |
| External provider and payment activation | Confirm contracts, scopes, webhooks, consent, pricing, refunds and jurisdictional requirements before enabling any provider | GATED / feature-specific | Business and provider owners |
| Native release signing | Supply owner-controlled Android signing keystore/secrets and Apple signing/team assets; never commit signing material | GATED | Release owner |
| Desktop/iOS distribution | Verify platform-specific signing, notarization, provisioning, store accounts and physical-device acceptance | GATED | Release owner |
| Legal/privacy review | Confirm privacy notice, retention, deletion, data processing terms, consent and applicable Bangladesh/international law | NOT VERIFIED | Project owner/legal adviser |

## Rules

- A human gate is not a code defect and must not be silently marked complete.
- Never request or place private signing keys, API secrets, database passwords, OAuth secrets, or recovery codes in Git.
- Keep provider integrations disabled or fail-closed until their specific evidence is attached.
- Update this table only when reproducible evidence is available; include date, environment, command or dashboard evidence, and reviewer.
