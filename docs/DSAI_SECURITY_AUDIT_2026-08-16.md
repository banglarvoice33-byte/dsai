# DSAI Security Audit

**Author:** Manus AI  
**Date:** 16 August 2026  
**Scope:** Controlled-alpha application security verification; this is not a substitute for an independent penetration test.

## Executive conclusion

The audited security promises are enforced in the current application boundary for the tested paths: protected user procedures reject unauthenticated requests, admin procedures reject unauthenticated/non-admin access, OAuth callback state is rejected when invalid, user-owned list procedures are scoped through the authenticated user, inputs are bounded by Zod schemas, secret values are not exposed in the audited source/runtime paths, and deployment now probes a machine-readable liveness endpoint.

The release should still be described as **controlled alpha**, not as independently certified or penetration-tested production security. Upload processing, paid provider side effects, external webhooks, distributed rate limiting, durable job execution, malware scanning, formal key rotation, and independent penetration testing remain launch gates.

## Verified controls

| Control | Evidence | Result |
| --- | --- | --- |
| Authentication boundary | Unauthenticated `access.list` request | HTTP 401 |
| Admin function boundary | Unauthenticated `admin.connectors.list` request | HTTP 403 |
| OAuth callback rejection | Fake code/state callback | HTTP 403 |
| Object-level ownership design | `listAccessCases(ctx.user.id)` and `listCreativeRequests(ctx.user.id)` | User-scoped query contract |
| Input validation | Zod schemas with bounded strings, enums, booleans, and email validation | Contract tests pass |
| Request correlation | `X-Request-ID` response header with bounded incoming ID validation | Runtime verified |
| Sensitive-log minimization | Completion event contains method/path/status/duration/request ID only | Source regression test passes |
| Response hardening | `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP, CORP; HSTS in production | Runtime/source verified |
| Body-size control | JSON and URL-encoded bodies limited to 1 MB until upload pipeline exists | Source regression test passes |
| Liveness/readiness | `/healthz` and `/readyz` | HTTP 200 in configured preview |
| Secret hygiene | Source scan for common private-key/API-key patterns; only documentation/example references matched | No populated secret artifact found |
| Build integrity | TypeScript, Vitest, production build | 29 tests passed; build passed |

## Dependency audit

A production dependency audit was run after upgrading direct `axios` from `1.12.2` to `1.19.0`. The audit still reports transitive advisories, including findings associated with the current `mermaid`/`DOMPurify` rendering chain and other development or transitive packages. No automatic broad upgrade was applied because major upgrades can change the UI/runtime contract and require separate compatibility testing. The remaining advisories are a **release gate for a public high-risk deployment**, especially if untrusted Mermaid or rich document content is ever rendered.

The current direct versions include Express 4.21.2, Axios 1.19.0, and nanoid 5.1.x. Express 5 and nanoid 6 are available as major-version upgrade paths but were intentionally not applied in this security pass.

## Promises that are not yet fully enforceable

The current release does not have a distributed rate limiter or cost ledger, so it must not claim abuse-resistant high-cost public actions. It has no live file-upload pipeline, so it must not claim malware scanning, MIME enforcement at storage ingress, or complete deletion propagation for uploaded bytes. It has no provider webhook gateway, so external callbacks, replay protection, and signature verification are not yet live. It has no durable worker with dead-letter recovery, so Creative requests remain a controlled queue foundation rather than a live generation service.

OAuth behavior was boundary-tested for invalid state, but successful third-party login persistence requires a real connected provider/browser session and should be verified in staging. HSTS is emitted only when `NODE_ENV=production`; local HTTP development intentionally does not emit it.

## Required next security gates

1. Add a distributed rate limiter and per-user/provider quota ledger before enabling paid or externally expensive actions.
2. Add idempotency keys and durable side-effect records before connecting payments, messaging, calendar, CRM, or generation providers.
3. Add raw-body signature verification, replay-event storage, fast acknowledgement, and dead-letter/replay controls before accepting webhooks.
4. Add an upload threat model, MIME/size validation, malware scanning decision, object-storage retention, and deletion propagation before accepting documents/media.
5. Complete targeted major-version dependency upgrades and an independent penetration test before public high-risk launch.

## References

[1]: https://owasp.org/API-Security/editions/2023/en/0x11-t10/ "OWASP Top 10 API Security Risks – 2023"
[2]: https://opentelemetry.io/docs/languages/js/ "OpenTelemetry JavaScript documentation"
[3]: https://docs.stripe.com/api/idempotent_requests "Stripe idempotent requests"
[4]: https://docs.stripe.com/webhooks "Stripe webhook security and processing guidance"
