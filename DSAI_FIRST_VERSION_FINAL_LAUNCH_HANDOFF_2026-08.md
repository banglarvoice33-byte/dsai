# DSAI First-Version Final Launch Handoff

**Review date:** 18 August 2026  
**Release:** DSAI first public version / controlled-alpha production candidate  
**Decision:** **Ready for operator-controlled deployment; not yet eligible for an unconditional public-launch or zero-defect claim until the external gates below are evidenced.**

## Executive conclusion

The current DSAI release is technically prepared for a controlled production deployment. The public site, Bengali-first navigation, Developer area, privacy and deletion-request surfaces, protected workspace boundaries, admin authorization, PWA/offline shell, persistent Night Workdesk theme, one-command VPS deployment workflow, and fail-closed environment validation are implemented in the project. The release has passed the automated and preview checks listed in this handoff.

The remaining gates are operational rather than a reason to add more frontend features before first release. They require real production credentials, a reachable database, an active HTTPS hostname, OAuth click-through, backups, rollback rehearsal, and operator confirmation of privacy and provider policies. These gates cannot be honestly verified from a credential-free preview.

## Evidence matrix

| Area | Current evidence | Status |
|---|---|---|
| Automated regression | 52 Vitest tests passed across 17 test files | **Pass** |
| Type safety | `pnpm exec tsc --noEmit` passed | **Pass** |
| Production bundle | `pnpm build` passed; shared entry chunk remains above the advisory 500 kB threshold | **Pass with warning** |
| Public routes | `/`, `/learn`, `/developer`, `/platform`, `/method`, `/privacy`, `/changelog` returned HTTP 200 | **Pass** |
| Static launch assets | `/manifest.json` and `/sw.js` returned HTTP 200 | **Pass** |
| Runtime health | `/healthz` and `/readyz` returned HTTP 200 in the managed preview | **Pass** |
| Protected boundary | Unauthenticated `/api/trpc/access.list` returned HTTP 401 | **Pass** |
| Admin boundary | Unauthenticated `/api/trpc/admin.connectors.list` returned HTTP 403 | **Pass** |
| Deployment scripts | `deploy-genesis.sh`, `setup-vps-env.mjs`, and `validate-production-env.mjs` passed syntax checks | **Pass** |
| Mobile presentation | Homepage, Learn, Developer, and Privacy verified at 390×844; no blocking overlap observed | **Pass for tested viewport** |
| Authentication | OAuth flow is implemented but live provider click-through requires operator credentials and final HTTPS callback | **External gate** |
| Production environment | VPS helper creates mode-600 `.env.production`; real values must be supplied by the operator | **External gate** |
| Domain and TLS | Requires active DNS, reverse proxy, HTTPS certificate, and final hostname | **External gate** |
| Android / Play Store | PWA foundation is ready; signed AAB, Digital Asset Links, Data Safety declaration, and internal-track tests remain | **Future gate** |

## Required operator sequence

First, upload the credential-free release to the VPS and enter the project directory. Do not upload a secret file from the sandbox or commit one to Git. Run the protected environment helper and provide the mandatory production values through its hidden prompts:

```bash
cd /var/www/dsai-platform
chmod +x deploy-genesis.sh scripts/setup-vps-env.mjs
node scripts/setup-vps-env.mjs
node scripts/validate-production-env.mjs .env.production
chmod 600 .env.production
bash ./deploy-genesis.sh
```

The helper must complete without placeholder rejection. Then record the selected port and verify the service:

```bash
PORT=$(cat .dsai-runtime/port)
curl -fsS "http://127.0.0.1:${PORT}/healthz"
curl -fsS "http://127.0.0.1:${PORT}/readyz"
curl -I "http://127.0.0.1:${PORT}/manifest.json"
curl -I "http://127.0.0.1:${PORT}/sw.js"
tail -n 100 .dsai-runtime/app.log
```

Next, configure the reverse proxy and final HTTPS hostname. Confirm the production OAuth application allows the exact origin and callback used by `/api/oauth/callback`. In a connected browser, complete a new login, return to the site, visit `/workspace`, and verify logout. Do not describe OAuth as live-verified until this click-through succeeds.

Finally, perform a no-write smoke pass for the public homepage, Learn, Developer, Privacy, login, health, readiness, and admin boundary. Submit one controlled scholarship test application only in staging if the operator has a suitable test account and approved test policy; do not create synthetic customer data in production.

## Launch boundaries that remain intentional

The release does not claim that live third-party messaging, CRM, calendar booking, payments, affiliate payouts, autonomous lead contact, malware scanning, OCR, media generation, or Play Store approval are active. Those capabilities remain provider- and policy-gated. File uploads remain fail-closed until a signed malware-scanning adapter is configured and staging-tested. Authenticated writes and private API paths are not treated as offline-capable.

The public site may be announced as a **controlled-alpha Bengali-first AI Workdesk** after the operator completes the external gates. Avoid claims such as “flawless,” “world’s fastest,” “guaranteed income,” “fully autonomous,” or “Play-approved.” The current trust position is stronger when it describes what is implemented and states what still requires human review or provider activation.

## First 30 days after release

During the first week, monitor health/readiness, application logs, failed OAuth callbacks, authentication errors, deletion requests, and mobile layout reports. During weeks two and three, review real search phrases and user-reported friction, but do not use fabricated testimonials or reviews. During week four, publish a truthful changelog entry based on shipped improvements, review retention and support patterns, and select only one next workflow to deepen.

Every update should follow the same release loop: create a small scope item, update schema through the migration workflow when necessary, add a regression test, run the full suite and production build, verify public/protected boundaries, capture desktop and mobile preview evidence, save a checkpoint, then deploy through the same one-command script. Keep rollback available until the new health and readiness checks pass.

## Final go/no-go

**Go:** controlled production deployment can begin after the operator supplies valid environment values and completes the database, TLS, OAuth, backup, and rollback gates.  
**No-go:** do not publicly promote the release if environment validation fails, readiness is unhealthy, OAuth callback verification fails, the database backup/restore path is unknown, or the reverse proxy exposes the application without HTTPS.

The release is therefore **prepared for the operator’s launch procedure**, not independently live. The final publish action remains an operator action in the Management UI or on the configured VPS.

## References

1. [DSAI Production Release Guide](DSAI_PRODUCTION_RELEASE_GUIDE.md)
2. [DSAI Android, Play Store, and Low-Network Guide](docs/DSAI_ANDROID_PLAYSTORE_AND_LOW_NETWORK_GUIDE_2026-08-16.md)
3. [DSAI Security Audit](docs/DSAI_SECURITY_AUDIT_2026-08-16.md)
4. [DSAI Full-Stack Regression Audit](docs/DSAI_FULL_STACK_REGRESSION_AUDIT_2026-08-16.md)
5. [Deployment Guide](DEPLOYMENT.md)
