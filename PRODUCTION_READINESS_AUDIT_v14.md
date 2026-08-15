# GENESIS Production-Readiness Audit v14

**Audit date:** 15 August 2026  
**Scope:** Frontend, tRPC/API layer, database access, authentication, dry-run lead planner, production build, one-command deployment, responsive UX, and release boundaries.

## Executive status

GENESIS is **release-ready for a controlled production launch of the current website, waitlist, authenticated UAA/Creative request foundations, and dry-run lead planner**. It is not yet release-ready as a fully autonomous outreach, calendar-booking, PHI-processing, or large-file video-rendering platform because those capabilities require external credentials, provider contracts, staging measurements, and additional operational controls.

The final decision is therefore **GO for controlled launch; NO-GO for unsupervised external actions**.

## Verification matrix

| Layer | Verification | Result | Evidence |
|---|---|---|---|
| Frontend compilation | TypeScript no-emit check | PASS | `pnpm check` |
| Backend contract | Existing auth and domain Vitest suites | PASS | 7 tests across 3 files |
| Production bundle | Vite frontend plus esbuild server bundle | PASS | `pnpm build`; 1.99 s local build |
| Public API validation | Invalid waitlist input rejected | PASS | Live tRPC response HTTP 400 |
| Protected API boundary | Unauthenticated `access.list` rejected | PASS | Live tRPC error `UNAUTHORIZED`, `Please login (10001)` |
| Lead planner | Valid consented dry-run returns ready plan | PASS | Live tRPC response HTTP 200; outbound send false |
| Lead planner validation | Invalid email rejected | PASS | Live tRPC response HTTP 400 |
| Database path | Authenticated session and own-case listing observed | PASS | Runtime request logs show `auth.me` and `access.list` responses |
| One-command deployment | Fresh isolated copy, locked install, build, launch, local health | PASS | Port 4100 isolated run |
| Restart behavior | Controlled second deployment reuses the previous port | PASS | 4100 → 4100 in isolated restart test |
| Port policy | Default starts at 3010, the eleventh conventional slot after 3000–3009 | PASS | Installer range 3010–3099 with active-listener checks |
| UX | Homepage desktop and mobile screenshots | PASS | Civic Signal visual system remains coherent |
| UX | 404 desktop/mobile recovery state | PASS after fix | Branded Bengali-first 404 with return actions |
| Safety | No device mining, wallets, token payouts, or guaranteed-income behavior | PASS | Product and deployment boundaries documented |

## Findings and corrections

The audit found one production-visible defect: the 404 page was a generic blue SaaS template and did not match the Civic Signal product language. It was rebuilt with the GENESIS emblem, parchment/ink/terracotta palette, Bengali-first copy, signal nodes, orientation language, keyboard-accessible buttons, and a safe return path. The status marker was then corrected to display the complete Bengali `৪০৪` code.

The deployment audit identified a reliability gap in the previous installer behavior. The installer now stops the previous recorded GENESIS process before selecting a port, reuses the saved port on controlled restart, loads the production environment before the Vite build, and fails closed when required database, JWT, and OAuth values are missing. This prevents a misleading partial launch and ensures frontend OAuth configuration is available at build time.

## Frontend-to-backend contract

The public launch-interest form calls `waitlist.join`. Authenticated UAA creation and listing call `access.create` and `access.list`, with protected procedures and user-owned records. Creative Studio requests call `creative.request`. The new `lead.preview` procedure validates a lead payload and returns a consent-aware, no-send action plan. No external message, phone call, calendar lookup, or booking is performed by the dry-run route.

The tested request path is therefore:

> **React form → typed tRPC client → Express/tRPC procedure → Zod validation → database helper or deterministic planner → structured response → UI status state.**

The remaining unverified production path begins only when external providers are connected. That path must be staged with webhook signatures, OAuth scopes, idempotency keys, consent records, suppression lists, retries, dead-letter handling, cost limits, human review, and a global pause switch.

## Performance interpretation

The deterministic lead planner ran for 1,000 local iterations with no network, database, or provider calls. It recorded p50 latency of 0.0001 ms, p95 latency of 0.0006 ms, maximum latency of 0.0374 ms, and zero errors. This proves the pure planning function is inexpensive; it does **not** prove a production webhook-to-booking p95. That full path must be measured after provider staging is available.

The production frontend bundle is approximately 714 kB before gzip, with a Vite chunk-size warning above 500 kB. This is acceptable for controlled launch but should be improved before high-volume public acquisition through route-level code splitting, image loading discipline, and manual chunking.

## Required release gates before autonomous actions

| Gate | Required evidence | Current state |
|---|---|---|
| Messaging | Provider account, verified sender, consent/opt-out test, delivery tracking | Not connected |
| Calendar | OAuth connection, free/busy test, timezone test, idempotent booking test | Not connected |
| CRM | Organization-scoped credentials, webhook verification, field mapping | Not connected |
| Healthcare | BAA-eligible providers, PHI threat model, retention/deletion controls | Not approved |
| Video | Media worker, storage/egress budget, measured p95 render time, retry policy | Not connected |
| Operations | Queue, dead-letter path, alerts, pause switch, audit dashboard | Partial foundation |
| Public launch | Domain, TLS, reverse proxy, restrictive firewall, backups, monitoring | Operator-controlled |

## Release recommendation

Publish the current website and controlled backend foundation after the operator supplies real production environment values and verifies the OAuth callback on the final domain. Keep `lead.preview` in dry-run mode. Do not enable external outbound messaging, calendar booking, PHI workflows, or large-file video rendering until their specific gates pass.

The current system is technically coherent and materially stronger than the previous checkpoint. Its premium differentiation is not generic AI generation; it is the combination of Bengali-first workflow design, human-gated action, vertical configuration, transparent economics, and safe operational boundaries.
