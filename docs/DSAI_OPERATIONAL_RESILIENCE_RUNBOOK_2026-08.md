# DSAI Operational Resilience Runbook

## Purpose

This runbook defines the minimum operational evidence required before DSAI enables provider-backed side effects. It separates controls implemented in the application from controls that require a production operator, provider account, or shared infrastructure.

## Centralized telemetry

The server emits structured HTTP completion events with a request identifier, route, method, status code, and duration. Telemetry attributes pass through a redaction contract that removes secret-bearing keys, authorization values, cookies, prompts, bodies, and payloads. The application log is an evidence stream, not a data warehouse; production deployments should forward it to a centralized sink with access control, retention limits, alerting, and redaction review. The attribute vocabulary follows the intent of OpenTelemetry HTTP semantic conventions, which define common meaning for HTTP spans, metrics, and logs [1].

## Retention and deletion audit

Deletion requests create a lifecycle event containing only subject type, opaque subject identifier, action, outcome, optional evidence hash, request identifier, and a short normalized detail. The implementation requires storage deletion confirmation and a database tombstone before reporting verified deletion. Operators must retain the lifecycle event long enough to demonstrate completion while applying the product's approved retention schedule to the underlying user data.

## Billing webhook verification

The `/api/billing/webhook` route reads the raw request bytes, verifies a timestamped HMAC signature with a constant-time comparison, rejects stale or malformed signatures, and records a provider/event-id receipt with a uniqueness constraint before any future entitlement side effect. It returns `503` when the webhook secret is not configured and does not claim that billing is live. Stripe's official guidance requires verifying the `Stripe-Signature` header with the endpoint secret and handling webhook delivery as an authenticated event channel [2].

## Backup and restore drill

A backup manifest must identify the backup, schema version, creation time, encryption state, and per-table row-count/checksum evidence. The restore drill must record restore duration, observed missing tables, backup age, target RTO, and target RPO. A passing manifest or unit test is not a production backup: the operator must run a non-production restore against an isolated database, verify representative records and indexes, record the measured RTO/RPO, and document the rollback path.

## Accessibility automation

`pnpm check:a11y` runs a dependency-free source contract that checks for visible focus treatment, reduced-motion support, image alternatives, labeled controls, and semantic dialog support. These checks complement—not replace—keyboard traversal, screen-reader review, contrast measurement, Bengali typography review, and manual testing against WCAG 2.2. WCAG 2.2 is organized around perceivable, operable, understandable, and robust principles and provides testable success criteria [3].

## Release gates

| Gate | Pass evidence | Current state |
|---|---|---|
| Telemetry | Redaction test, request IDs, centralized sink and alert route | Application contract implemented; centralized sink is operator-owned |
| Deletion | Storage confirmation, database tombstone, lifecycle hash, audit event | Application contract implemented; real storage deletion remains gated |
| Billing | Valid signature, replay rejection, unique receipt, entitlement handler test | Verification and inbox implemented; provider secret and entitlement policy required |
| Backup | Encrypted manifest, isolated restore, measured RTO/RPO, missing-table check | Drill contract implemented; production drill required |
| Accessibility | Automated contract, keyboard review, screen-reader review, contrast evidence | Automated contract passes; manual review remains required |

## References

[1]: https://opentelemetry.io/docs/specs/semconv/http/ "OpenTelemetry Semantic Conventions for HTTP"

[2]: https://docs.stripe.com/webhooks "Stripe Webhooks"

[3]: https://www.w3.org/TR/WCAG22/ "Web Content Accessibility Guidelines 2.2"
