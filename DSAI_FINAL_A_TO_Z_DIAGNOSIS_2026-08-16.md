# DSAI Final A-to-Z Diagnosis and Release Report

**Release context:** DSAI Bengali-first AI Workdesk, controlled-alpha production candidate. This report separates automated and preview evidence from production-only verification. It does not claim zero defects, Play approval, OAuth success without valid credentials, or independent security certification.

## Executive finding

The repeated diagnosis found one reproducible visual defect after the prior release: the global Knowledge Help trigger floated over meaningful content on narrow Method, Platform, Workspace, and admin screens. The trigger now remains in normal document flow below 760px while its open dialog remains bounded and fixed. The homepage search-specific guard remains active so the Help trigger does not cover the search field. Desktop floating behavior is preserved.

The direct login route is implemented at `/auth/login`. Homepage unauthenticated CTAs use `/auth/login?returnTo=/workspace`. OAuth state carries a return destination, but the callback still requires the existing one-time host-only nonce before redirecting. External, protocol-relative, API, escaped, and empty destinations fail closed.

## Repeated validation matrix

| Layer | Validation performed | Result |
|---|---|---|
| Frontend routes | Root, Learn, Method, Platform, Privacy, Auth Login, Workspace, and Admin Connectors | Preview HTTP 200 |
| Narrow visual pass | 390px public, workspace, privacy, direct-login, and admin captures | No reproduced text collision; Help no longer overlays non-home content |
| Wide visual pass | 1280px root, auth, workspace, admin, and privacy captures | Desktop layout and floating Help behavior preserved |
| Auth boundaries | Protected access endpoint and admin connector endpoint without session | 401 and 403 respectively |
| OAuth failure | Callback without required state | 400; invalid state remains fail-closed at 403 |
| Runtime | `/healthz`, `/readyz`, request ID and security headers | 200 and headers present |
| PWA | Manifest and service worker served | 200; private API/OAuth/storage paths remain excluded from caching |
| Automated tests | Vitest suite | 40 passed across 14 files |
| Static validation | TypeScript noEmit and production build | Passed; Vite emitted only a non-blocking chunk-size warning |
| Deployment | Bash syntax and archive content checks | Passed |

## Corrected issue

The Help trigger previously used fixed positioning on all viewport sizes. At 390px it could cover the lower content area of pages that did not contain the homepage search. The trigger now has a `knowledge-help-trigger` class and uses `position: static` under 760px with controlled margin. On desktop it remains fixed. On the homepage, an IntersectionObserver hides the trigger while the search surface is visible; route changes reset that state so Help remains available on other pages.

## Backend and security findings

The backend diagnosis found no new reproducible contract failure. Public routes render without authentication; protected workflow procedures reject missing sessions; admin procedures reject missing admin authority. The server continues to expose liveness and database-readiness checks, bounded request IDs, redacted structured completion events, restrictive security headers, body limits, and fail-closed upload access. Upload malware scanning remains disabled until a signed provider adapter and staging evidence exist. That limitation is intentional and documented rather than hidden.

OAuth state validation remains nonce-bound to the `__Host-oauth_state` cookie. The new return path does not weaken that guard. The callback exchanges the same state with the provider and redirects only after the session is created. Real login remains dependent on the production OAuth application, final HTTPS origin, callback allow-list, and valid credentials.

## Deployment and release boundaries

The one-command installer remains:

```bash
cd /path/to/genesis-platform-site && bash deploy-genesis.sh
```

It installs missing prerequisites where supported, selects a free port beginning at 3010, validates required environment values, installs the frozen lockfile, builds, starts the server, and checks `/healthz`. It does not create DNS, TLS, reverse-proxy rules, OAuth applications, database backups, Play Store artifacts, provider credentials, or external integrations.

The credential-free archive must exclude `.env.production`, `.git`, `node_modules`, `dist`, logs, and runtime state. Operators must create a protected `.env.production`, verify database readiness, configure TLS and OAuth, and test rollback before public launch.

## Remaining production gates

The following items are not defects that can be proven from this sandbox: final DNS/TLS and reverse-proxy behavior, a real OAuth login and returning session, production database backup/restore, rate limiting under distributed traffic, real malware scanning, provider integrations, Android signed AAB and Digital Asset Links, Play Data Safety/account-deletion review, accessibility across the full physical-device matrix, and independent penetration testing.

> The accurate release claim is: **DSAI is a tested controlled-alpha production candidate with a verified one-command deployment path and documented external gates.** It is not accurate to claim unconditional flawless behavior or Play approval before those gates are completed.
