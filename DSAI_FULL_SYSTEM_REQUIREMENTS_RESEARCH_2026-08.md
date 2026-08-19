# DSAI Full-System Requirements Research

## Scope

This audit covers application security, AI risk governance, accessibility, durable data handling, provider integrations, observability, performance, billing and entitlement boundaries, deployment, and Bengali-first UX.

## Authoritative source findings

OWASP ASVS 5.0 is an application-security verification standard intended to provide testable requirements and a measurable basis for confidence in web applications. The relevant DSAI mapping is to verify authentication/session controls, input validation and output encoding, access control, secure configuration, error handling, secrets management, and auditability rather than relying only on a successful build [1].

NIST describes the AI RMF as a voluntary framework for incorporating trustworthiness into AI design, development, use, and evaluation. Its operating model is commonly expressed through Govern, Map, Measure, and Manage; the DSAI mapping is to keep risk ownership, human gates, benchmark evidence, incident handling, and release decisions explicit [2]. NIST also identifies a Generative AI Profile as a companion resource for risks that are unique to or amplified by generative systems [2].

WCAG 2.2 is a W3C Recommendation organized around perceivable, operable, understandable, and robust principles, with testable success criteria and conformance levels. DSAI should treat Bengali typography, keyboard and focus support, reduced motion, readable contrast, error recovery, responsive layout, and assistive-technology semantics as release requirements, not polish [3].

## Current-state gap categories

| Area | Current evidence | Requirement still needed | Delivery type |
|---|---|---|---|
| Durable trace store | Authenticated ownership-scoped metadata path exists | Retention enforcement, deletion linkage, pagination, server audit events, and operational alerting | Implementation plus operator policy |
| AI quality | Deterministic Bengali benchmark and release-gate UI exist | Hidden evaluation set, human adjudication, regression threshold, drift review, and model/version provenance | Implementation plus evaluation operations |
| Performance | Browser-measured current-route sample control exists | Samples for every important route, p50/p95 aggregation, long-task/error correlation, and budget approval | Implementation plus telemetry collection |
| OAuth | Fail-closed mock harness and no-grant credential validation exist | User-driven authorization, exact callback allowlists, PKCE/state verification, token encryption, revoke verification, and provider outage handling | Provider/operator gate |
| Secure file intake | Quarantine and mock scanner contracts exist | Real scanner adapter, size/type/content validation, S3 lifecycle, malware incident workflow, and deletion confirmation | Provider/operator gate plus implementation |
| Data privacy | Redaction guidance and deletion requests exist | Data inventory, purpose/retention matrix, export/delete verification, tenant isolation tests, and privacy incident procedure | Implementation plus policy |
| Abuse prevention | CAPTCHA and some protected procedures exist | Per-user/IP rate limits, replay/idempotency controls, account recovery abuse protection, and audit correlation IDs | Implementation |
| Billing | Scholarship entitlement foundation exists | Real billing provider, entitlement source of truth, webhook signature verification, grace/retry policy, refund/cancellation handling | Provider/operator gate |
| Observability | Health/readiness and trace metadata exist | Structured request IDs, error taxonomy, metrics, alert thresholds, runbooks, and redaction review | Implementation plus operations |
| Accessibility | Responsive UI and reduced-motion guidance exist | Automated axe-style checks, keyboard route traversal, focus restoration, Bengali screen-reader review, and contrast verification | Implementation plus manual review |
| Deployment | Build, health, and checkpoint flow exist | Backup/restore drill, migration rollback plan, dependency/SBOM review, security headers, and disaster recovery RTO/RPO | Implementation plus operations |

## Priority order

The highest-value next controls are: rate limiting and idempotency for protected mutations; correlation IDs and structured audit events; retention/deletion linkage for traces and files; security headers and content-security policy review; a hidden Bengali evaluation set with human adjudication; route-level field timing capture; and provider-gated OAuth execution only after callback allowlists and consent are verified.

## References

[1]: https://owasp.org/www-project-application-security-verification-standard/ "OWASP Application Security Verification Standard"

[2]: https://www.nist.gov/itl/ai-risk-management-framework "NIST AI Risk Management Framework"

[3]: https://www.w3.org/TR/WCAG22/ "W3C Web Content Accessibility Guidelines 2.2"

## Implemented in this audit

The HTTP server now applies reusable browser-isolation headers, anti-sniffing and framing protections, HSTS in production, and a production report-only CSP suitable for staged violation review. A bounded in-process rate limiter now guards tRPC traffic with `429` and `Retry-After`; this is a baseline defense and must be complemented by a shared edge limiter in multi-instance production. Regression tests cover both controls.

The full Vitest suite currently passes with 61 tests. The suite also surfaced an important operator gate: the configured CAPTCHA sandbox secret is rejected by the provider. This is not silently treated as a code defect; production launch requires rotating or replacing the Turnstile secret and re-running provider validation.

## Remaining high-priority gates

Real OAuth callback and revoke execution still requires a user-driven consent session, exact provider allowlists, and a test account. Complete Super Fast approval still requires field samples for every launch-critical route. Real malware scanning, durable deletion execution, billing webhooks, backup/restore drills, centralized rate limiting, and incident-response exercises remain outside the current sandbox-only implementation.
