# DSAI Backend Modernization Plan

**Author:** Manus AI  
**Date:** 16 August 2026  
**Scope:** Production-oriented backend foundations for the Bengali-first DSAI Workdesk.

## Executive assessment

DSAI currently has a coherent TypeScript/Express/tRPC/Drizzle backend with Manus OAuth, user-scoped UAA cases, user-scoped Creative requests, admin-only connector and privacy operations, deployment-time environment validation, and a working one-command build/restart script. The next backend stage should not begin with a distributed microservice rewrite. It should strengthen the existing modular monolith with explicit reliability contracts, safe asynchronous boundaries, request correlation, health/readiness checks, auditability, and provider-neutral adapters.

The most important current gap is not the absence of a fashionable framework. It is the absence of operational contracts around retries, request identity, service readiness, rate/resource governance, provider callback verification, and durable audit events. These gaps become material when DSAI starts accepting document uploads, calling paid providers, processing large media, or triggering external actions.

## Findings from the current codebase

| Area | Current state | Risk or opportunity | Priority |
| --- | --- | --- | --- |
| API contract | tRPC 11 procedures with Zod validation | Strong type flow; needs explicit version/inventory policy as public procedures grow | High |
| Authentication | Manus OAuth context plus protected/admin procedures | Good baseline; add request correlation and security-event audit trail | High |
| Authorization | User-scoped list queries and admin procedure | Continue object-level checks for every ID-bearing operation | Critical |
| Persistence | Drizzle ORM with MySQL/TiDB tables | Adequate for controlled alpha; add idempotency/audit/job tables before paid side effects | High |
| Async processing | Creative requests are queued as database rows but no worker is attached | Must not claim processing/generation is live; introduce explicit job state and worker only behind a provider gate | Critical |
| Integrations | Connector registry records configuration and safe fallback status | Add adapter contract, timeout, retry, circuit-breaker, webhook signature, and replay protection per provider | High |
| Observability | Console/server logs and local health probe only | Add request ID, `/healthz`, `/readyz`, redacted structured events, and external telemetry later | High |
| Resource controls | Zod bounds exist on many mutations | Add distributed rate limiting and cost/quota governance before public high-cost actions | Critical |
| Privacy | Deletion requests and aggregate search analytics exist | Keep raw documents and provider payloads out of logs; document retention and deletion propagation | Critical |
| Deployment | One-command installer selects a free port and checks `/` | Add machine-readable health/readiness endpoints and migration/rollback runbook | High |

## Research-backed design principles

OWASP's 2023 API Security Top 10 emphasizes object-level authorization, broken authentication, unrestricted resource consumption, function-level authorization, SSRF, security misconfiguration, API inventory, and unsafe third-party API consumption [1]. DSAI should therefore treat every user-owned case/request identifier as an authorization boundary, keep external URLs out of arbitrary fetch paths, cap body/resource consumption, and maintain an inventory of public procedures and provider callbacks.

OpenTelemetry's JavaScript documentation describes stable traces and metrics support for Node.js while browser instrumentation remains experimental [2]. DSAI should instrument the server first, using request IDs and privacy-safe attributes. Raw prompts, document contents, email addresses, tokens, and provider payloads must never be attached as telemetry attributes.

Stripe's official idempotency guidance recommends a high-entropy client-generated key, avoiding sensitive identifiers, and retaining the result long enough to make retries safe [3]. Its webhook guidance also recommends signature verification using the raw request body, returning a fast 2xx response before complex processing, and handling asynchronous events through durable processing [4]. These are provider-specific examples of a general DSAI rule: external side effects need idempotency, authenticity verification, replay protection, and an auditable state machine.

## Target architecture

DSAI should remain a modular monolith until measured load or provider isolation requires separation:

1. **HTTP boundary:** Express middleware for request IDs, security headers, body-size policy, health/readiness, and redacted access logs.
2. **Contract boundary:** tRPC procedures grouped by domain, with explicit public/protected/admin classification and stable input/output schemas.
3. **Domain boundary:** Access, Creative, Privacy, Search Analytics, Connectors, and future Jobs modules with user-scoped helpers.
4. **Durability boundary:** MySQL/TiDB for authoritative state; object storage for bytes; never store raw file bytes in relational rows.
5. **Async boundary:** A durable jobs table and worker adapter for OCR, document extraction, media generation, notifications, and provider callbacks. The first implementation should be a single controlled worker; do not introduce a distributed queue before throughput or isolation requires it.
6. **Provider boundary:** Each connector implements timeout, retry policy, idempotency key, signature verification, redaction, and safe-fallback behavior behind a typed adapter.
7. **Operations boundary:** `/healthz` for process liveness, `/readyz` for dependency readiness, request IDs in responses/logs, migration records, and a runbook for rollback and data deletion propagation.

## Staged delivery plan

| Stage | Deliverable | Launch gate |
| --- | --- | --- |
| 0 — now | Request ID, `/healthz`, `/readyz`, redacted structured request events, explicit API inventory, contract tests | Liveness/readiness and boundary checks pass in CI and deployment script |
| 1 — before public uploads | Storage metadata model, MIME/size validation, malware scanning decision, retention/deletion propagation, per-user quotas | Upload threat model and deletion test pass |
| 2 — before paid/provider actions | Idempotency table, cost ledger, distributed rate limit, provider adapter contract, timeout/retry/circuit-breaker | Duplicate/retry and quota tests pass without double side effects |
| 3 — before external callbacks | Signed webhook endpoint, replay event table, fast acknowledgement, durable job processing, dead-letter/replay UI | Signature, replay, and failure recovery tests pass |
| 4 — before always-on automation | Consent ledger, opt-out, audit log, action approval, connector scopes, operator kill switch | Human approval and kill-switch drills pass |
| 5 — scale | OpenTelemetry server traces/metrics, dashboards, alerting, worker isolation, read replicas only when measured | SLOs and load tests demonstrate need |

## Implementation options

| Approach | Tradeoffs | Cost | Setup complexity |
| --- | --- | --- | --- |
| Harden the current modular monolith first | Fastest and lowest operational risk; one deployable unit; worker scale is limited | Lowest incremental cost | Low to medium |
| Add a durable jobs table plus one worker process | Enables retries and asynchronous work while keeping the system understandable; requires worker supervision and job recovery | Low to medium | Medium |
| Split API, worker, and event gateway into separate services now | Stronger isolation and independent scaling; more deployment, secrets, observability, and failure modes than controlled alpha needs | Highest | High |

**Recommendation:** implement the first two stages incrementally inside the current project, and defer service decomposition until measured workload, provider isolation, or compliance requirements justify it.

## Immediate implementation in this release

This release adds low-risk operational foundations: machine-readable `/healthz` and `/readyz` endpoints, a response `X-Request-ID` correlation header, redacted request completion events, an API inventory document, and tests for health/readiness behavior. It does not claim live OCR, media generation, external messaging, calendar booking, billing, or 24/7 autonomous action.

## References

[1]: https://owasp.org/API-Security/editions/2023/en/0x11-t10/ "OWASP Top 10 API Security Risks – 2023"
[2]: https://opentelemetry.io/docs/languages/js/ "OpenTelemetry JavaScript documentation"
[3]: https://docs.stripe.com/api/idempotent_requests "Stripe idempotent requests"
[4]: https://docs.stripe.com/webhooks "Stripe webhook security and processing guidance"
