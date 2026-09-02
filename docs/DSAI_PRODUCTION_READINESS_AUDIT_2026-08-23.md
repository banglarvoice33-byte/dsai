# DSAI Production-Readiness Audit

**Audit date:** 2026-08-23  
**Project:** `genesis-platform-site` / DSAI  
**Author:** Manus AI  
**Release posture:** Controlled-alpha production candidate; not an unconditional public-production or provider-complete release.

## Executive conclusion

The DSAI project-side implementation is in a **controlled-alpha production-candidate state**. The Bengali-first interface, Tactile Kinetic UI, universal multilingual lead composer, 40-market catalog, live draft preview, privacy-safe Excel export, admin operational dashboard, authentication boundary, security headers, bounded request bodies, release packaging controls, and external-secret contract are implemented and test-backed.

A production deployment can be attempted only after the operator completes the external gates listed in this report. The sandbox cannot truthfully verify the target VPS, DNS, TLS certificate, Nginx configuration, systemd persistence, database availability on the VPS, real OAuth click-through, backup restoration, provider credentials, or real-device field performance. Those items remain **operator evidence gates**, not completed project features.

A material deployment-contract drift was found and corrected during this audit. The bootstrap helper had been able to place a populated `.env.production` inside the application tree, and the self-extracting bundle’s interactive fallback assigned its generated environment file to the release directory. Both paths now target the protected external environment contract and remove any stale in-tree `.env.production` file. Git ignore rules now exclude populated dotenv files while retaining only `.env.production.example`.

The `/readyz` endpoint was also strengthened. It now executes a non-mutating `SELECT 1` probe through Drizzle rather than treating the presence of `DATABASE_URL` and a lazily-created database handle as proof that the database is reachable.

## Evidence standard

> A local test, source assertion, or preview route proves project behavior. It does not prove that a separately managed VPS, domain, DNS record, certificate, OAuth provider, database instance, backup, or external provider is correctly configured.

The audit uses repository evidence, executable tests, production build output, and an isolated local production-server smoke test. No real secret values are included in this document.

## Verified project controls

| Area | Verified result | Evidence | Status |
|---|---|---|---|
| Bengali-first product surface | Bengali-first navigation, dashboard copy, operational labels, loading state, lead workflow, and documentation remain present. | `client/src/pages/AdminOverview.tsx`, `client/src/pages/LeadComposer.tsx`, prior responsive previews | Verified project-side |
| Tactile Kinetic UI | CSS-only depth, texture, kinetic type treatment, restrained motion, responsive behavior, and reduced-motion safeguards are implemented without WebGL runtime weight. | `client/src/index.css`, homepage/admin visual checkpoints | Verified project-side |
| Multilingual lead composer | Any-language brief, target market/language, business context, AI refinement with deterministic fallback, consent, opt-out, human review, no-auto-send, live preview, search/filter, and XLSX export are implemented. | `client/src/pages/LeadComposer.tsx`, `shared/marketCatalog.ts`, lead tests | Verified project-side; delivery remains manual |
| 40-market catalog | Market defaults and editable country, locale, currency, time-zone, formality, region, and language context are encoded. | `shared/marketCatalog.ts`, catalog tests | Verified project-side |
| Admin dashboard | Capability pulse, authoritative status counts, management surface links, evidence snapshot, health posture, and operator queue are implemented. | `client/src/pages/AdminOverview.tsx`, checkpoint `1884a19c` | Verified project-side |
| Authentication boundary | OAuth state includes a one-time nonce bound to a host-only cookie; invalid state is rejected and stale nonce is cleared; return paths are sanitized. | `client/src/const.ts`, `server/_core/oauth.ts`, `server/oauth.state.test.ts`, `server/auth.route.test.ts` | Verified project-side; real provider click-through pending |
| Database contract | Drizzle uses MySQL/TiDB via `mysql2`; feature writes fail closed when the database is unavailable; `/readyz` now executes `SELECT 1`. | `server/db.ts`, `server/_core/index.ts`, `server/config.validation.test.ts`, `server/backend.foundation.test.ts` | Verified project-side; target VPS DB pending |
| Security headers and request limits | Security headers are applied, `x-powered-by` is disabled, JSON/urlencoded bodies are bounded to 1 MB, and request IDs are emitted. | `server/securityPolicy.ts`, `server/_core/index.ts`, backend foundation tests | Verified project-side |
| Telemetry privacy | Structured completion records redact keys containing token, secret, password, authorization, cookie, API key, prompt, body, or payload. | `server/telemetry.ts`, `server/telemetry.test.ts` | Verified project-side |
| File-upload boundary | Uploads reject unauthenticated requests and remain disabled until a scanner adapter is configured and staging-tested. | `server/_core/index.ts`, `server/fileSecurity.ts` | Intentionally fail-closed |
| Secret separation | The release packager excludes dotenv variants and sensitive key material; the external file is `/etc/dsai/dsai.env` with mode `0600`; populated `.env.production` is removed from the app tree during bootstrap. | `scripts/package-credential-free-release.sh`, `scripts/bootstrap-dsai-vm.sh`, `.gitignore`, VPS environment tests | Verified project-side |
| One-command bundle | The bundle contains the credential-free release, checksum validation, current-target rollback, protected environment selection, local health/login probes, and no in-tree secret fallback. | `scripts/build-one-command-vps-bundle.mjs`, `server/one-command-bundle.test.ts` | Verified project-side |
| Deployment script | Locked dependency install, port selection, build, controlled previous-process stop, external environment loading, health polling, readiness check, and local route probes are present. | `deploy-genesis.sh`, deployment docs | Verified project-side; systemd/Nginx persistence pending |
| Performance packaging | Homepage and lead composer are route-split; Excel is lazy-loaded; stable React/tRPC/UI vendor chunks are configured. | `vite.config.ts`, `LeadComposer.tsx`, remediation tests, production build | Verified project-side; field RUM pending |
| Release tests | Full Vitest suite, TypeScript, accessibility contract, and production build passed during this audit. | Audit run on 2026-08-23 | Verified project-side |

## Validation results from this audit

| Check | Result |
|---|---:|
| Full Vitest suite | **45 test files passed; 137 tests passed** |
| Focused deployment/security suite after corrections | **7 test files passed; 30 tests passed** |
| Accessibility contract | **5 checks passed across 102 client files** |
| TypeScript | **`tsc --noEmit` passed** |
| Production build | **Vite build passed in 5.66 seconds; server bundle emitted** |
| Script syntax | **Bash and Node syntax checks passed** |
| Isolated built-server smoke test | **`/healthz`, `/readyz`, `/`, `/auth/login`, `/lead-composer`, `/try-first`, `/creative-studio`, and `/scholarship` returned 200** |
| Smoke-log sensitive error scan | **No matching error/warn/exception/unhandled lines** |

## Capability truth table

| Capability | Current truthful status | What is still required before calling it live |
|---|---|---|
| Public access and Bengali-first Workdesk | Implemented controlled-alpha foundation | Final domain, TLS, OAuth persistence, support process, and field testing |
| Universal multilingual lead drafting | Implemented controlled-alpha | Human review, local compliance review, recipient consent, and any future delivery adapter |
| Excel export | Implemented as local draft-only export | User acceptance testing across target browsers and organizational data policy |
| Creative image/video generation | Preview/provider-gated | Provider adapter, worker, storage, moderation, quota, billing/refund policy, provenance, and staged tests |
| Secure file service | Foundation/fail-closed | Real malware scanner, object storage deletion, OCR/large-file pipeline, retention drills, and operator review |
| CRM/calendar/messaging | Connector foundation only | Server adapters, OAuth scopes, consent, webhook verification, idempotency, rate limits, audit logs, and rollback |
| Payments | Not active | SSLCOMMERZ or approved provider integration, secret setup, webhook verification, refund/legal review, and staged payment tests |
| Autonomous agent actions | Not live | Durable jobs, approval checkpoints, idempotency, opt-out, audit trail, monitoring, and always-on process policy |
| Android/Play release | PWA-ready foundation only | Signed Android App Bundle, Digital Asset Links, Play disclosures, reviewer access, and internal-track tests |
| 100-student free pilot | Policy/schema foundation | Identity/institution verification, reviewer operations, quota monitoring, abuse handling, and actual pilot evidence |

## Remote gates that remain unverified

The following must not be marked PASS from sandbox evidence alone:

| Gate | Required operator evidence |
|---|---|
| VPS service | `dsai.service` is active and enabled after reboot; only the intended DSAI process is supervised |
| Environment | `/etc/dsai/dsai.env` exists, has mode `0600`, passes validation, and is not copied into the release tree |
| Database | `/readyz` returns 200 against the target VPS database and migrations/schema are confirmed |
| Nginx | `nginx -t` passes; Nginx is active; `/api` and SPA routes proxy to the recorded private application port |
| Firewall | Only required public ports are open; the application port is not unintentionally public |
| DNS | `dsai.banglarvoice24news.com` resolves to the intended public edge |
| TLS | The final hostname serves a valid certificate and HTTPS redirects/headers are correct |
| OAuth | A new login and returning session succeed through the final HTTPS origin and configured callback |
| Backups | Encrypted backup manifest, recent backup age, restore completeness, RPO, and RTO are evidenced on the target environment |
| Rollback | A failed release can restore the previous `current` target without exposing the failed process |
| Providers | Every enabled connector has real credentials, webhook verification, consent, rate limits, idempotency, audit logs, and staged success/failure tests |
| Real-device UX | Bengali-first layout, reduced motion, PWA/offline behavior, OAuth, deletion, and accessibility are tested on supported devices |
| Operations | Alerting, log retention, support/abuse handling, incident response, and secret rotation ownership are documented and exercised |

## Safe remote verification command

Run this only on the target VPS after the credential-free release has been extracted and the protected environment file has been created. It does not print secret values and does not modify the application, Nginx, firewall, DNS, database, or provider configuration.

```bash
cd /home/dulal_sarder90/dsai/current
DSAI_DOMAIN=dsai.banglarvoice24news.com DSAI_PORT_FILE=.dsai-runtime/port bash scripts/remote-production-gate-report.sh
```

If the release is installed at another path, change only the `cd` path. Send back only the final named PASS/FAIL lines and counts. Do not send `/etc/dsai/dsai.env`, `DATABASE_URL`, tokens, cookies, private keys, or full logs.

## Required additions before unconditional public launch

The next additions are operational rather than cosmetic: real VPS service supervision and reboot testing; final DNS/TLS/Nginx verification; external OAuth click-through; database migration and restore rehearsal; encrypted backup retention; secret rotation and incident response; malware-scanner and object-storage adapters; provider-specific CRM/calendar/messaging/media/payment adapters; consent and idempotency records; field performance measurements; and a staged pilot with human support.

The product should retain the current boundaries: no fabricated testimonials, no automatic lead outreach, no unreviewed consequential decisions, no unsupported text-to-video claim, no hidden provider success, no secrets in source or browser bundles, and no unconditional “flawless” or “fully live” claim before the remote gates are evidenced.

## References

[1]: [`deploy-genesis.sh`](../deploy-genesis.sh) — canonical application deployment launcher.  
[2]: [`scripts/validate-production-env.mjs`](../scripts/validate-production-env.mjs) — fail-closed environment validator.  
[3]: [`scripts/build-one-command-vps-bundle.mjs`](../scripts/build-one-command-vps-bundle.mjs) — credential-free self-extracting bundle generator.  
[4]: [`scripts/bootstrap-dsai-vm.sh`](../scripts/bootstrap-dsai-vm.sh) — protected VPS bootstrap helper.  
[5]: [`server/_core/index.ts`](../server/_core/index.ts) — runtime health, readiness, security, and routing entrypoint.  
[6]: [`server/_core/oauth.ts`](../server/_core/oauth.ts) — OAuth callback state and session boundary.  
[7]: [`shared/capabilityMatrix.ts`](../shared/capabilityMatrix.ts) — authoritative capability status ledger.  
[8]: [`docs/DSAI_REMEDIATION_AND_REMOTE_GATE_RUNBOOK_BN.md`](./DSAI_REMEDIATION_AND_REMOTE_GATE_RUNBOOK_BN.md) — Bengali operator runbook.  
[9]: [`docs/DSAI_REMOTE_GATE_HANDOFF_COMMANDS_BN.md`](./DSAI_REMOTE_GATE_HANDOFF_COMMANDS_BN.md) — copy-pasteable non-secret remote verification commands.


## Scope note — non-news platform review

The separate architecture comparison at `docs/DSAI_SUPPLIED_ARCHITECTURE_PREDEPLOYMENT_AUDIT_BN_2026-09-02.md` is the controlling review for the non-news DSAI scope. Newspaper, newsroom, article publishing, RSS, live-news, editorial SEO, and news-ad metrics are excluded from the final platform claim. The remaining product claim is limited to the Bengali-first AI Workdesk, multilingual lead drafting, governed Creative Studio planning, secure-file foundation, agent operations, scholarship controls, admin evidence surfaces, payment readiness, user-only Android wrapper, and secret-separated deployment packaging.
