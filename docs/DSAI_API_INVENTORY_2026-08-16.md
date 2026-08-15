# DSAI API Inventory

**Status:** Controlled alpha inventory  
**Last reviewed:** 16 August 2026

This inventory is intentionally short and explicit. Every new public procedure or provider callback should be added here before release.

## HTTP operational endpoints

| Endpoint | Method | Purpose | Access |
| --- | --- | --- | --- |
| `/healthz` | GET | Process liveness; returns machine-readable status and uptime | Public operational probe |
| `/readyz` | GET | Dependency readiness; currently checks database configuration and handle availability | Public operational probe; do not expose secrets |
| `/api/trpc/*` | POST/GET through tRPC adapter | Typed application procedures | Procedure-specific |
| `/api/oauth/callback` | GET | Manus OAuth callback | OAuth provider flow |

All HTTP responses receive an `X-Request-ID` correlation header. Accepted incoming IDs are strictly bounded; invalid or absent IDs are replaced with a server-generated UUID. Completion events log method, path, status, duration, and request ID only. Request bodies, query strings, authorization values, prompts, documents, email addresses, and provider payloads are not logged.

## tRPC procedure inventory

| Domain | Procedure | Classification | Data boundary |
| --- | --- | --- | --- |
| `auth` | `me`, `logout` | Protected/public as defined by router | Current session only |
| `waitlist` | `join` | Public | Bounded email, interest, language |
| `access` | `list`, `create` | Protected | Current user's cases only |
| `creative` | `list`, `request` | Protected | Current user's requests only |
| `search` | `record` | Public | Normalized aggregate term only; no identity or keystrokes |
| `privacy` | `requestDeletion` | Public | Bounded deletion request with identity confirmation |
| `changelog` | `published` | Public | Published entries only |
| `admin.changelog` | `list`, `create`, `setStatus` | Admin | Operator-only changelog management |
| `admin.deletion` | `list`, `update` | Admin | Operator-only deletion review |
| `admin.searchAnalytics` | `list` | Admin | Aggregate search trends only |
| `admin.connectors` | `list`, `test`, `setEnabled` | Admin | Provider configuration status, never secret values |

## Required pre-release additions

Before accepting uploads, add storage metadata, MIME/size validation, retention, deletion propagation, and a malware-scanning decision. Before paid or external side effects, add idempotency keys, cost/quota governance, rate limits, provider timeouts, retries, and circuit breaking. Before accepting callbacks, add raw-body signature verification, replay protection, durable event state, fast acknowledgement, and operator replay/dead-letter controls. Before always-on automation, add consent, opt-out, approval, audit log, scope limits, and a kill switch.
