# DSAI World-Class AI Product Gap Audit

**Review date:** 19 August 2026  
**Scope:** Bengali-first public site, `/app` mobile surface, authenticated workspace, privacy/safety, developer/admin surfaces, PWA/offline readiness, and self-hosting release path.

## Executive assessment

DSAI has a differentiated and credible first-version foundation: Bengali-first UX, explicit human review, no-auto-submit language, privacy/deletion-request surfaces, scholarship controls, fail-closed environment validation, PWA/offline shell, safe OAuth continuation, mobile responsive work, developer/operator documentation, and a truthful distinction between queued/gated capabilities and verified runtime behavior.

It is not yet feature-parity with mature AI workspaces. The most important gap is not another marketing feature; it is a durable, user-owned work context that supports files, history, reusable instructions, transparent processing limits, citations/sources, and export/delete controls. The current update adds a safe workspace export for the records already implemented. File upload/analysis and live model execution remain intentionally gated until storage, malware scanning, retention, provider credentials, quota metering, and end-to-end tests are complete.

## Public benchmark patterns

| Benchmark pattern | Public evidence | User expectation | DSAI status |
|---|---|---|---|
| Durable project context | OpenAI Projects groups chats, reference files, custom instructions, saved responses, connected app links, memory, and sharing controls.[^1] | Users expect work to continue across sessions and devices with reusable context. | **Partial:** workspace records and status exist; durable chat/project context and file sources are not yet implemented. |
| File analysis | OpenAI documents synthesis, transformation, extraction, spreadsheet analysis, comparison, and explicit file/usage limits.[^2] | Users expect upload, analysis, supported-file guidance, visible limits, and useful output. | **Not production-enabled:** creative queue is provider-gated; no general user upload/analysis flow is claimed. |
| Mobile file workflow | Google documents Android upload from photos, camera, files, Drive, and notebooks, with sign-in and connected-app requirements.[^3] | Android users expect a clear add-file action and understandable processing states. | **Partial:** PWA/mobile shell is ready; file intake is not yet available. |
| Privacy operations | Google’s Privacy Hub exposes data collection, connected-app exchange, settings, retention, removal, and export as distinct user-facing controls.[^4] | Users expect lifecycle transparency and self-service data actions. | **Strong foundation:** privacy policy, deletion request, data-rights link, and now workspace export; retention details for future file bytes still need implementation. |
| Human control | Leading products increasingly expose review, permissions, connected-app boundaries, and non-automatic action semantics. | Users expect to know what AI can do, what it cannot do, and when a human must approve. | **Differentiated strength:** “no auto-submit” and human-gated status are explicit. |

## Highest-priority gaps

| Priority | Gap | Why it matters | Recommended implementation gate |
|---|---|---|---|
| P0 | Real authenticated AI interaction | The current workspace creates drafts/queues, but does not yet prove a full provider-backed answer loop. | Provider credential, model policy, quota accounting, prompt/data logging policy, error states, and end-to-end staging test. |
| P0 | File intake and analysis | A major user expectation for AI workspaces; also the highest privacy/security risk. | S3-only storage, MIME/size validation, malware scan, retention/erasure worker, ownership checks, signed URLs, extraction sandbox, and citations. |
| P0 | Production OAuth/domain validation | Local boundary tests cannot prove live login on the intended domain. | Active HTTPS domain, exact callback registration, real OAuth success/return flow, cookie and mobile-device verification. |
| P1 | Durable conversations/project context | Users expect saved chats, reusable instructions, and continuity. | Conversation schema, encrypted/authorized records, search, export/delete, retention controls, and pagination. |
| P1 | Sources/citations and answer provenance | Trustworthy AI use requires users to distinguish generated text from grounded material. | Source model, provider response metadata, citation rendering, unavailable-source state, and audit trail. |
| P1 | Usage/limit visibility | Scholarship quotas exist, but every metered AI feature must consume quota before execution. | Central metering adapter, preflight estimate, remaining daily/monthly display, warning states, idempotency, and tests. |
| P1 | Notifications | Users expect status updates, quota warnings, and security notices. | In-app notification center first; external email/push only after consent, provider setup, retry/idempotency, and privacy review. |
| P2 | Collaboration and sharing | Mature project tools support controlled sharing and roles. | Explicit share model, least-privilege access, revocation, audit log, and no-public-by-default policy. |
| P2 | Billing and service packaging | A sustainable brand needs clear paid boundaries, not vague promises. | Stripe or approved billing provider, entitlement model, invoices/refunds policy, usage metering, and legal review. |
| P2 | Native Android/TWA release | PWA foundations are present, but Play submission has signing, Digital Asset Links, target SDK, Data Safety, account deletion, and device testing gates. | Signed AAB, final HTTPS domain, asset links, Play Console declarations, internal testing, crash/performance monitoring. |

## Implemented in this audit

The authenticated workspace now includes a user-initiated JSON export of the currently owned access cases and creative requests. The export is explicitly scoped to `user-owned-workspace-records`, uses a date-stamped filename, avoids server/provider changes, and shows a Bengali ownership explanation. A mobile screenshot audit also identified and fixed insufficient contrast in the workspace’s “Private · human-gated” eyebrow label.

## What should not be claimed yet

DSAI should not claim universal model coverage, guaranteed correctness, automatic external execution, production file analysis, live provider-backed generation, Play approval, zero defects, or “world’s fastest” status until the corresponding gates above are evidenced in staging and production. The strongest first-version positioning is: **a Bengali-first, human-gated AI workdesk designed to make complex AI-assisted work easier to understand and safer to review.**

## 30/60/90-day implementation sequence

**0–30 days:** complete real OAuth/domain validation; ship in-app status/notification center; finish centralized quota adapter; define supported model/provider matrix; add user-facing capability status and incident messaging.

**31–60 days:** implement file intake with S3, scanning, retention, deletion, ownership, extraction, and citations; add durable conversations/project instructions; stage an authenticated provider-backed AI loop with red-team tests.

**61–90 days:** add controlled sharing, billing/entitlements, provider observability, Android internal testing, public changelog discipline, and independent security/accessibility review.

## Release rule

Every new capability should pass: product contract, privacy/security review, schema/API contract, unit/integration tests, mobile/responsive check, failure/empty/loading states, quota/entitlement check, operator documentation, rollback plan, and a checkpoint before public promotion.

[^1]: [OpenAI Projects in ChatGPT](https://help.openai.com/en/articles/10169521-projects-in-chatgpt)
[^2]: [OpenAI File Uploads FAQ](https://help.openai.com/en/articles/8555545-file-uploads-faq)
[^3]: [Google Gemini file upload and analysis on Android](https://support.google.com/gemini/answer/14903178?hl=en&co=GENIE.Platform%3DAndroid)
[^4]: [Google Gemini Apps Privacy Hub](https://support.google.com/gemini/answer/13594961?hl=en)
