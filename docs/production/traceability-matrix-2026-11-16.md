# DSAI production traceability inventory — 16 November 2026

This is a source/configuration inventory, not a claim that every listed capability has passed authenticated Production UAT. The release gate for each feature remains: visible UI → authenticated backend operation → owner-scoped database/storage persistence → live browser evidence.

## Connected system

| Layer | Verified resource | Current boundary |
|---|---|---|
| Source | `banglarvoice33-byte/dsai`, private GitHub repository | PR #26 is the release candidate; this branch is not yet `main` |
| Frontend | React + Vite, 36 Wouter routes in `client/src/App.tsx` | Static route rendering is not authenticated acceptance |
| Backend | Express + tRPC, 23 top-level router groups in `server/routers.ts` | Router presence is not proof every business flow works |
| Database | Supabase PostgreSQL 17.6.1, ACTIVE_HEALTHY, ap-south-1 | Server-owned access path; no browser DB access |
| Storage | Cloudflare R2 private bucket `dsai-user-file`, prefix `DSAI` | Bucket/CORS configured; no real user file upload proved |
| Edge functions | `dsai-health` (ACTIVE, JWT verification off); `dsai-image-generate` (ACTIVE, JWT verification on) | Image generation is not document extraction |
| Runtime | Vercel project `dsai` | Production `/healthz` and `/readyz` returned HTTP 200 during audit |

## Frontend route inventory

The following 36 route patterns are declared in `client/src/App.tsx`:

```
/
 /learn
 /developer
 /method
 /platform
 /workspace
 /documents
 /scholarship
 /auth/login
 /auth/signup
 /quality-gates
 /integration-pilot/tests
 /traces
 /integration-pilot
 /agents
 /agents/:id
 /creative-studio
 /capabilities
 /plans
 /advertising
 /try-first
 /lead-composer
 /evidence
 /privacy
 /governance
 /changelog
 /404
 /admin
 /admin/connectors
 /admin/platform
 /admin/scholarship
 /admin/changelog
 /admin/deletion-requests
 /admin/search-analytics
 /admin/payments
 /admin/gate-evidence
```

Route checks in CI exercise public route loading and responsive overflow. They do not establish that private routes, admin controls, or protected mutations succeed for a real signed-in user.

## Backend router inventory

The 23 top-level tRPC router groups in `server/routers.ts` are:

`aiProviders`, `aiAssistant`, `system`, `auth`, `waitlist`, `lead`, `guestDemo`, `traces`, `performance`, `evaluation`, `oauthTests`, `admin`, `deletion`, `changelog`, `searchAnalytics`, `connectors`, `imageGeneration`, `scholarship`, `search`, `files`, `privacy`, `access`, `creative`.

This inventory is a router map, not 23 completed user-facing services. For each procedure, acceptance still requires verifying the caller identity, input validation, ownership predicate, persistence, error recovery, and UI affordance.

## Database inventory

### Drizzle schema

The current `drizzle/schema.ts` declares 22 tables:

`users`, `waitlist_signups`, `access_cases`, `integration_connectors`, `deletion_requests`, `changelog_entries`, `search_analytics`, `file_assets`, `creative_requests`, `student_scholarship_programs`, `student_scholarship_applications`, `student_pro_entitlements`, `student_pro_usage_counters`, `agent_traces`, `performance_snapshots`, `benchmark_runs`, `release_gate_checks`, `oauth_test_runs`, `data_lifecycle_events`, `billing_webhook_events`, `lead_records`, `lead_activities`.

### Live Supabase public schema

Live catalog inspection found 27 public base tables, all with RLS enabled:

`access_cases`, `agent_traces`, `ai_provider_rate_limits`, `benchmark_runs`, `billing_webhook_events`, `changelog_entries`, `creative_requests`, `data_lifecycle_events`, `deletion_requests`, `dsai_r2_usage_counters`, `file_assets`, `generated_images`, `image_generation_daily_users`, `image_generation_usage`, `integration_connectors`, `lead_activities`, `lead_records`, `oauth_test_runs`, `performance_snapshots`, `release_gate_checks`, `search_analytics`, `student_pro_entitlements`, `student_pro_usage_counters`, `student_scholarship_applications`, `student_scholarship_programs`, `users`, `waitlist_signups`.

Five live tables are not declared in the current Drizzle schema: `ai_provider_rate_limits`, `dsai_r2_usage_counters`, `generated_images`, `image_generation_daily_users`, and `image_generation_usage`. Their ownership, migration source, and read/write paths should remain explicitly documented in the corresponding SQL migrations/Edge Function code; do not assume Drizzle is the sole schema source.

### Current RLS posture

- 27/27 public base tables have RLS enabled.
- 27/27 have one explicit `RESTRICTIVE` policy for `anon` and `authenticated`.
- Each policy is `FOR ALL`, `USING (false)`, `WITH CHECK (false)`.
- 27 restrictive policies; 0 permissive policies.
- Catalog check: 0 direct table privileges for `anon` or `authenticated`.
- Applied migrations: `20261116000913_dsai_explicit_server_only_rls_policies` and `20261116003434_dsai_restrictive_server_only_rls_policies`.

The app stores integer `public.users.id` plus string `openId`. Backend code verifies Supabase Auth JWTs and maps the UUID to `openId = 'supabase:' || auth.uid()` before resolving the integer DSAI user. Live Auth catalog count: 1 Supabase Auth user and 1 mapped DSAI user (not a login UAT). Direct Data API access is still intentionally server-only; a future browser-direct path would need table-specific owner policies and a reviewed SQL mapping helper, not `auth.uid() = userId`.

## Storage and document pipeline

| Stage | Source/configuration evidence | Acceptance status |
|---|---|---|
| Signed upload authorization | Backend R2 signed PUT route and 10 MiB cap | Code exists; real upload UAT outstanding |
| Private R2 write | Private `dsai-user-file` bucket and CORS configured | No real user object verified |
| Metadata | `public.file_assets` owner-scoped metadata | 0 live rows at audit time |
| SHA-256/signature check | Backend finalize route | Static implementation; not malware scan |
| ClamAV | Adapter and CI integration tests | Production scanner URL/API key absent |
| Download | Owner-scoped signed GET route | Must require `scanStatus=clean`; PR adds fail-closed behavior |
| Preview/extraction/OCR | No production extraction pipeline found | Not implemented |
| Document AI actions | No file-specific extraction/retrieval/action pipeline found | Not implemented |

**Safety rule:** a checksum/signature-validated file is not malware-clean. Until Production ClamAV is configured and returns a clean verdict, the PR keeps uploads quarantined and blocks download/AI processing. This code change is not live on `main` until merge and deployment.

**Scanner hosting constraint:** Cloudflare Containers are available only on the Workers Paid plan; Cloudflare's published minimum is $5 USD/month, with additional usage charges possible. No paid plan or Container was enabled. Without explicit billing approval or a user-supplied private scanner endpoint/API key, the secure behavior is quarantine-only.

## Lead CRM

The `lead` router exposes create/list/update/activity operations and uses the `lead_records` / `lead_activities` tables. Live counts at audit time: 0 lead records and 0 lead activities. This proves only that the database is empty; it does not prove persistence works. Authenticated owner-scoped save → reload → update → activity → second-user isolation UAT remains required.

## AI boundary

General AI provider configuration and the protected assistant router exist. No document extraction, file-specific retrieval, or document-grounded AI action pipeline was found. Do not advertise the general assistant as Document AI.

## Outstanding Production acceptance gates

1. Supabase Auth: real signup, email verification, login, refresh, logout, session expiry, returnTo and second-user isolation.
2. File workflow: real 1–10 MiB upload, R2 object verification, metadata finalize, scanner clean/EICAR/outage, owner download, non-owner denial, delete and retention cleanup.
3. Scanner: provision an authenticated private ClamAV service and configure `MALWARE_SCANNER_URL` / `MALWARE_SCANNER_API_KEY`. No paid resource is enabled by this audit.
4. Document workflow: preview/page navigation, PDF/DOCX/XLSX extraction, Bengali OCR, safe text persistence, document-specific AI, export and save.
5. Lead CRM: real owner-scoped CRUD and activity persistence with a second account.
6. Production regression: fresh runtime log check after postgres.js 3.4.9 is deployed; verify no recurrence of the historical `TimeoutNegativeWarning`.
7. Mobile acceptance: real Android Chrome testing; CI's 390px Chromium viewport is not a physical device test.
8. Government directory: verify each external URL with DNS/TLS/redirect/browser accessibility and authoritative service documentation. A reachable portal link is not an authenticated government API integration.

## Remaining Security Advisor finding

Supabase Security Advisor no longer reports `rls_enabled_no_policy`. One separate warning remains: leaked-password protection is disabled. The connected Supabase organization is on the Free plan; official Supabase documentation lists leaked-password protection as Pro-and-above only. No plan upgrade was made. This warning cannot be cleared on the current Free plan through SQL or project migrations.
