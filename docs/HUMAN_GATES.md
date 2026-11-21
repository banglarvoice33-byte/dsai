# Human-owned production gates

These gates require account-owner, provider-dashboard, legal, or physical-device evidence. Repository code and CI alone cannot close them.

| Gate | Required evidence | Current status | Owner/action |
|---|---|---|---|
| Canonical architecture inputs | Supply or confirm authoritative `docs/architecture.md` and `docs/blueprint-extract.md`; both paths are absent | BLOCKED — source inputs absent | Project owner |
| Trusted Git checkout | Local `git status`, branch/remotes and local author identity from repository checkout | BLOCKED — available shell is not a repository | Repository operator |
| Local toolchain baseline | Node 24.22.2, intended pnpm version, install and test commands with exit codes | BLOCKED — container Node 22.16.0; pnpm missing | Repository operator |
| GitHub author identity policy | Confirm whether local commits must use `banglarvoice33-byte` / `banglarvoice33@gmail.com`; authenticated connector identity matches login but local Git author config is unavailable | PARTIAL | Project owner/operator |
| Supabase Auth CAPTCHA | Confirm Turnstile provider and secret in Supabase Auth settings; real login/signup/retry/failure tests on canonical production hostname | NOT VERIFIED | Supabase project owner |
| Supabase leaked-password protection | Enable the Supabase Auth setting and verify compromised-password rejection | OPEN — security advisor WARN observed 2026-11-21 | Supabase project owner |
| Supabase migration/RLS parity | Identify staging project; compare local/staging/production migrations and run positive + negative cross-owner RLS tests | NOT VERIFIED — only one connected project returned; no live owner-isolation test | Database operator |
| Malware scanner production readiness | Supported scanner endpoint/key and clean, EICAR/malicious, invalid-auth, timeout/outage and owner-isolation evidence | NOT VERIFIED for production | Security/operator owner |
| Production Vercel acceptance | Canonical URL, exact deployed commit, readiness, security headers, auth smoke test and rollback rehearsal | NOT VERIFIED in this phase | Vercel/project owner |
| External provider/payment activation | Contracts, scopes, webhooks, consent, pricing, refunds and jurisdictional requirements before enabling any provider | GATED / feature-specific | Business and provider owners |
| Native release signing | Owner-controlled Android signing keystore/secrets and Apple signing/team assets; never commit signing material | GATED | Release owner |
| Desktop/iOS distribution | Platform-specific signing, notarization, provisioning, store accounts and physical-device acceptance | GATED | Release owner |
| Legal/privacy review | Privacy notice, retention, deletion, data processing terms, consent and applicable Bangladesh/international law | NOT VERIFIED | Project owner/legal adviser |

## Rules

- A human gate is not a code defect and must not be silently marked complete.
- Never request or place private signing keys, API secrets, database passwords, OAuth secrets, or recovery codes in Git.
- Keep provider integrations disabled or fail-closed until their specific evidence is attached.
- Update this table only when reproducible evidence is available; include date, environment, command or dashboard evidence, and reviewer.
