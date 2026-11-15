# DSAI Product Readiness & Open-Source Delivery Plan (বাংলা)

**Status:** controlled-alpha; this document distinguishes implemented behaviour from proposed work.
**Architecture constraint:** retain Vite + React + Express + tRPC + Drizzle + PostgreSQL/Supabase + Vercel. No replacement backend, new database, or mandatory paid SaaS dependency is introduced by the Lead CRM foundation.

## 1. Verified product boundary

| Area | Current verified behaviour | Not yet proven / not included |
|---|---|---|
| Account | Supabase Auth is the primary bearer-token identity path; legacy Manus OAuth is optional/gated. | Real signup/login, email confirmation and CAPTCHA click-through require operator credentials and canonical production-domain testing. |
| AI assistant | Authenticated text completion through configured provider adapters and fallback logic. | It is not an autonomous agent that safely completes arbitrary external tasks. |
| Lead Composer | Multilingual draft composition, local browser drafts and XLSX export. | No business discovery, verified contact data, outbound messaging, or full CRM lifecycle by itself. |
| Lead CRM foundation (this branch) | Authenticated server-side lead persistence, owner-scoped list/update, status and activity history; contact consent defaults to unknown. | Requires CI, migration review/application, authenticated runtime verification and UI acceptance before release. |
| File handling | File policy/status and private asset metadata exist. | Real upload/scanning/extraction must not be advertised until a production scanner and storage adapter pass end-to-end tests. |
| Connectors | Catalog/readiness indicators exist. | Credentials present do not prove OAuth, provider health, webhook, retry, or a successful live action. |
| Operations | Health/readiness contracts and CI exist. | Backup/restore, provider flows, runtime monitoring and field-device testing remain release evidence requirements. |

## 2. Lead CRM security and product contract

- A user can only list, update, and inspect activity for records owned by their authenticated DSAI user ID.
- Lead data is stored server-side; browser localStorage remains a convenience for unsaved drafts, not the system of record.
- Draft-generation consent is not consent to contact a recipient. New records use consentStatus=unknown.
- Saving or changing a lead never sends email, SMS, social messages, or calendar invitations.
- Source and sourceEvidence describe what the user supplied; do not label user-entered or AI-inferred data as independently verified.
- RLS remains enabled. The tables have no client grants; server-side service credentials remain server-only. Do not add blanket authenticated policies.
- Lead activities are owner-scoped and append-only from the user-facing API. No public endpoint exposes these records.
- A follow-up date is a reminder datum only; no scheduler is implied by storing it.

## 3. Delivery order and release gates

### Milestone A — Persistent Lead CRM foundation (this branch)
1. Additive Drizzle schema and Supabase SQL migration.
2. Protected tRPC operations for create/list/update/activity.
3. Lead Composer save-to-CRM UI, preserving existing local draft and export paths.
4. Contract tests for owner scoping, RLS/grants and no-outreach behaviour.
5. CI: TypeScript, accessibility, unit tests, production build, Docker readiness.
6. Apply migration only after code review and CI pass; then verify new tables, grants, RLS and /readyz.
7. Runtime acceptance: two separate test users; owner A cannot read/update owner B's lead; anonymous users cannot call CRM endpoints; save creates activity; status update creates activity; no outbound provider request occurs.

### Milestone B — Lead lifecycle completion
- Add edit/archive, contact consent capture with evidence/source/time, notes, activity timeline and due-follow-up view.
- Add export of actual CRM records, not just the generated draft.
- Add qualification fields with explicit evidence and confidence; never fabricate a score without evidence.
- Add deduplication using normalized user-supplied email/domain, with collision review rather than destructive merging.
- Add pagination and retention/export/delete flows before scaling record volume.

### Milestone C — Evidence-based lead discovery
- Start with user-provided domains, public directories with permitted access, and documented APIs.
- Store source URL, retrieval timestamp, evidence excerpt/hash and confidence for every discovered fact.
- Respect source terms, robots policies, rate limits, privacy rules and applicable local laws.
- No indiscriminate scraping, purchased personal-data lists, hidden enrichment, or bulk messaging.
- Discovery remains separate from contact consent and outbound actions.

### Milestone D — Documents and research
- ClamAV (GPL-2.0) for malware scanning where a self-hosted scanner is appropriate.
- Tesseract OCR (Apache-2.0) for OCR, with Bengali language data installed and tested separately.
- Apache Tika (Apache-2.0) or format-specific parsers for document extraction; run parsers in constrained workers.
- Store uploaded files in a private bucket; issue short-lived signed URLs only after owner authorization.
- Treat extracted text as untrusted input; never execute embedded instructions or macros.
- Do not enable uploads until scanning, size/type validation, quarantine, extraction, deletion and restore tests pass.

### Milestone E — Automation and operations
- Keep synchronous work in the existing Express/tRPC service until there is a measured queue need.
- If durable asynchronous jobs become necessary, evaluate pg-boss (PostgreSQL-backed, MIT) before adding Redis.
- Use OpenTelemetry (Apache-2.0) for traces/metrics and Prometheus + Grafana for self-hosted observability.
- Add bounded retries, idempotency keys, dead-letter handling, operator visibility and human approval for external writes.
- Perform documented backup restore drills; a backup schedule without a successful restore is not sufficient evidence.

## 4. Open-source-first component choices

| Capability | Preferred option | Integration rule |
|---|---|---|
| Web application | Existing React, Vite, Express, tRPC, Drizzle | Keep current stack and lockfile. |
| Data | PostgreSQL; existing Supabase-managed PostgreSQL | PostgreSQL is open source; Supabase hosted control plane is a managed service, not a self-hosted deployment. |
| OCR | Tesseract | Verify Bengali traineddata quality and confidence; require human review for low-confidence text. |
| Malware scan | ClamAV | Fail closed: quarantine until scan returns clean. |
| Document parsing | Apache Tika / safe format-specific parsers | Run with CPU, memory, file-size and timeout limits. |
| Job queue (only if needed) | pg-boss | Reuse PostgreSQL; no queue dependency in this CRM foundation. |
| Local model runtime (optional future) | Ollama or llama.cpp | Model weights have separate licences; approve each model licence and hardware profile. |
| Telemetry | OpenTelemetry + Prometheus + Grafana | Keep PII and secrets out of spans and labels. |
| Search (future) | Meilisearch (MIT) or PostgreSQL full-text search | Prefer PostgreSQL until measured query needs justify another service. |

Vercel is the existing managed deployment platform and is not an open-source replacement. A fully self-hosted infrastructure migration is a separate decision, not part of this low-risk project polish.

## 5. Environment variables

### No new variables for Milestone A
The Lead CRM foundation uses the existing server-side DATABASE_URL / POSTGRES_URL and authenticated DSAI session. It adds no API key, third-party provider or browser secret.

### Existing variables to provision/verify by the owner
- DATABASE_URL: PostgreSQL connection string; use TLS for remote hosts and a least-privilege runtime role.
- JWT_SECRET: server-only signing secret required by the current VPS contract.
- SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or configured Supabase secret-key equivalent): server-only Supabase Auth validation; never expose in a VITE_ variable.
- VITE_CAPTCHA_SITE_KEY, CAPTCHA_SECRET_KEY, CAPTCHA_ALLOWED_HOSTNAME, CAPTCHA_ENABLED: verify canonical hostname and Supabase Auth's own CAPTCHA setting separately.
- AI provider keys (e.g. GEMINI_API_KEY, OPENROUTER_API_KEY, GROQ_API_KEY): optional; keep only providers actually enabled and tested.
- Legacy Manus OAuth variables: leave unset unless a real legacy session or external scheduled task is evidenced.
- Forge image-generation variables: retain only while the current image-generation implementation depends on that service; do not confuse these with Manus account OAuth.

Never paste secret values into GitHub issues, PRs, chat, screenshots, frontend bundles or logs. The operator should report only whether each required variable is configured.

## 6. Definition of production-ready

A feature is not complete merely because its build is green. Required evidence:
- CI green on the exact merge commit.
- Migration is applied once, version is recorded, and schema matches Drizzle.
- No cross-user access in positive/negative tests.
- Authenticated UI and API tested with real sessions.
- No secrets in client bundle or logs.
- Provider-dependent paths are either end-to-end verified or visibly marked unavailable.
- /healthz and database-backed /readyz pass.
- Production deployment SHA equals the merged Git SHA.
- Backup/restore and rollback procedures are documented and tested for the change.

## 7. Operator handoff

The owner supplies only status—not secret values—for:
1. Production DATABASE_URL is configured and /readyz succeeds.
2. Supabase Auth CAPTCHA is enabled with the intended Turnstile secret and provider.
3. A real authenticated test account is available for signup/login and two-user ownership acceptance tests.
4. The intended production host is the canonical domain; deployment-specific aliases are not used for public login testing.

Until those checks pass, the release remains a tested candidate rather than a fully verified production SaaS.