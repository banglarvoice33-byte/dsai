# GENESIS Runtime Connector Layer

## Purpose

GENESIS can now remain deployed and useful when external providers are absent. The application keeps provider policy and provider secrets separate: the database stores only connector identity, category, enablement policy, status, and health metadata, while provider credentials remain server-side environment values managed outside the browser.

## Supported lifecycle

A connector begins in `disabled`. An administrator can open `/admin/connectors`, inspect whether expected environment values exist, run a no-send environment test, and record an enable/disable policy. If a connector is enabled without its required provider values, it becomes `degraded`; the system continues using the safe fallback and does not attempt outbound actions. `ready` means the expected environment values exist, not that the provider-specific OAuth, webhook, consent, rate-limit, or contract checks have been completed.

## Adding a new provider

Adding an arbitrary new API still requires a small server-side adapter, an explicit environment-key declaration, input/output validation, timeout and retry policy, audit events, and a feature-flagged fallback. After that adapter is deployed, the operator can provide secrets through the protected project secret-management path and control the connector policy from the admin console. The public frontend does not need to be redeployed merely because an existing adapter receives new credentials.

## Current procedures

| Procedure | Access | Side effects |
|---|---|---|
| `admin.connectors.list` | Admin only | Reads registry and reports non-secret readiness |
| `admin.connectors.test` | Admin only | Checks expected environment presence; no provider call |
| `admin.connectors.setEnabled` | Admin only | Updates local connector policy and status |
| `lead.preview` | Public, validated | Builds a dry-run action plan; no external send |

## Non-negotiable boundaries

No connector may send a message, book a meeting, alter a CRM record, process PHI, or render a paid media job solely because an environment variable exists. Each provider needs a staging verification, organization-scoped authorization, consent and suppression rules, idempotency, observability, cost limits, and an emergency pause switch. Deployment continuity is a reliability feature; it is not permission to bypass provider, privacy, financial, or legal requirements.
