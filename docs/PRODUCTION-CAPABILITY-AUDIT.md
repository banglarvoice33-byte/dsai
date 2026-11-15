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

## Required release evidence beyond static scanning

1. Browser E2E: sign-up/login/logout, return-to-route, upload, list, download, delete, error/retry and Android Chrome.
2. Authorization: two-user isolation for every private document, draft, history and generated asset.
3. AI: provider configured/unconfigured, timeout, rate limit, malformed response, quota exhaustion and safe failure.
4. Documents: supported-format parsing, Bengali OCR where claimed, malformed files, archive expansion limits, malware scanner outage and quarantine behavior.
5. Creative: real provider job lifecycle, failed job, retries/idempotency, storage ownership and quota accounting.
6. Government workflows: verify each external link and explicitly label all actions that still require the user on the official portal.
7. Production UAT: use a real test account and harmless test document; record timestamp, deployment SHA, browser/device, request IDs and observed outcomes.

## Audit limitations

This document and static CI guard do not certify every feature or replace manual semantic review. No production deployment, database migration, provider secret change, or main-branch merge is performed by this PR. A green CI run proves only the checks actually executed by that workflow.
