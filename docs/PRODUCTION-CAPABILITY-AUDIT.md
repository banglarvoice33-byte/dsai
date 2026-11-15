# DSAI production capability and stub audit

**Baseline:** `main` at `7bb7db2874622f07060429848740c2a4fe1934ce` (15 November 2026).

## Executive finding

A repository-wide keyword search is not sufficient to certify production readiness. The codebase contains intentionally limited preview/planning flows that can look like completed AI features if the interface does not explain their boundaries. These are not necessarily defects, but they must not be marketed or tested as completed provider-backed work.

## Confirmed capability boundaries from source inspection

| Area | What the code currently does | What is not proven by that implementation |
|---|---|---|
| Guest Try First | `guestDemo.preview` returns a deterministic, in-memory local preview. UI states that no provider, file, account or external action is used. | Not an LLM assistant; no persisted work or source-grounded answer. |
| Creative preview | `creative.preview` builds a plan and deliberately returns `output: null` while provider is blocked. Tests assert this boundary. | Preview is not image/video generation. Provider configuration and real generated output need separate production tests. |
| Workdesk access cases | Authenticated users can create/list access drafts. | No evidence here of an end-to-end government submission or case processing integration. |
| Creative briefs | Authenticated users can create/list creative requests. | Saving a brief is not the same as generating media. |
| Government directory | Curated external portal links and user preparation checklists. | No authenticated government API integration, application submission, fee payment or official status sync. |
| Documents | Private file upload/list/download/delete UI and server routes exist. | Upload is not OCR, document parsing, summarization, virus scanning in every deployment, or document Q&A. Those require separate configured services and acceptance tests. |
| AI assistant | Protected tRPC procedure calls configured AI providers and fails closed when providers are disabled/unconfigured. | Actual production availability depends on provider secrets, feature flags, quotas and live end-to-end tests. |

## High-confidence static stub guard

This PR adds `pnpm run check:stubs` to CI. It scans tracked production source under `client/src`, `server`, `shared` and `scanner` for explicit unfinished markers and blocks production references to the mock security helper.

The guard deliberately does **not** treat UI input attributes named `placeholder`, legitimate `return null`, intentional local previews, or test mocks as unfinished production code.

## Live backend configuration audit (15 November 2026)

Read-only inspection of the connected Production and Supabase configuration confirmed:

- **Private file storage:** Production has the R2 configuration keys, `FILE_STORAGE_PROVIDER=auto`, bucket `dsai-user-file` and prefix `DSAI`. The access credentials were not read or exposed. This confirms configuration presence, not a successful authenticated browser upload.
- **Text AI:** Production has `AI_PROVIDERS_ENABLED=true`, and Supabase Vault contains an `OPENROUTER_API_KEY` secret entry. No provider completion was sent, so provider reachability, billing and response quality remain unverified.
- **Image generation:** Supabase Edge Function `dsai-image-generate` is ACTIVE (version 12, JWT required); Vault contains the Agnes and Cloudflare credential entries. No image was generated because that would invoke potentially billable external providers.
- **Authentication:** Production Turnstile is enabled, with a site key and the canonical `dsai-one.vercel.app` hostname configured. No account credentials or CAPTCHA challenge were used.
- **Malware scanning:** Production Vercel environment does not contain `MALWARE_SCANNER_URL` or `MALWARE_SCANNER_API_KEY`. The file pipeline therefore cannot claim ClamAV antivirus scanning in Production; the checksum/signature-only state must remain labelled `validated`, not `clean`. A read-only aggregate query found one `file_assets` record and its `scanStatus` is `validated` (not `clean`).
- **Supabase Data API exposure:** 27 public tables have RLS enabled without policies, but catalog checks found no direct table privileges for `anon` or `authenticated` on those tables. Do not add blanket policies; map each server-side access path and owner predicate first.

These are configuration and schema observations, not proof of successful real-user transactions. No production secrets, database rows, user accounts or files were changed.

## Browser acceptance now wired into CI

The CI workflow runs `scripts/production-browser-smoke.mjs` against the canonical Production origin in real headless Chromium at desktop and 390px mobile viewports. It checks 20 user-facing routes (`/`, `/learn`, `/developer`, `/method`, `/platform`, `/workspace`, `/documents`, `/scholarship`, `/auth/login`, `/auth/signup`, `/quality-gates`, `/creative-studio`, `/capabilities`, `/plans`, `/try-first`, `/lead-composer`, `/evidence`, `/privacy`, `/governance` and `/changelog`); checks for horizontal overflow on every mobile route; exercises homepage search to open Try First and mobile navigation to Workspace; verifies login form fields and that the Turnstile verification widget mounts; checks `/healthz` and `/readyz`; and confirms that unauthenticated upload-init, finalize, download and delete requests return HTTP 401 without creating or changing user data.

This is a genuine browser + live HTTP boundary check, but it is deliberately **not** authenticated user acceptance. No test account credentials or CAPTCHA bypass are embedded in CI. It does not claim successful login, upload of real bytes, cross-user isolation, download of an owned file or delete lifecycle. Those require a dedicated test account and harmless test object, followed by cleanup.

A source-level regression assertion also verifies that the actual Vercel production Express entrypoint registers `registerFileUploadRoutes(app)` before tRPC fallback handling. This protects against testing a route module that is not wired into the deployed server.

## Required release evidence beyond static scanning

1. Authenticated browser E2E: sign-up/login/logout, return-to-route, upload, list, download, delete, error/retry and Android Chrome.
2. Authorization: two-user isolation for every private document, draft, history and generated asset.
3. AI: provider configured/unconfigured, timeout, rate limit, malformed response, quota exhaustion and safe failure.
4. Documents: supported-format parsing, Bengali OCR where claimed, malformed files, archive expansion limits, malware scanner outage and quarantine behavior.
5. Creative: real provider job lifecycle, failed job, retries/idempotency, storage ownership and quota accounting.
6. Government workflows: verify each external link and explicitly label all actions that still require the user on the official portal.
7. Production UAT: use a real test account and harmless test document; record timestamp, deployment SHA, browser/device, request IDs and observed outcomes.

## Audit limitations

This document and static CI guard do not certify every feature or replace manual semantic review. No production deployment, database migration, provider secret change, or main-branch merge is performed by this PR. A green CI run proves only the checks actually executed by that workflow.
