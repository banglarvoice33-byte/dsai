# DSAI End-to-End Deployment Readiness Audit

**Audit date:** 19 August 2026  
**Project:** `genesis-platform-site` / DSAI  
**Current managed release under review:** `b92e0efc` before this audit remediation

## Executive verdict

DSAI is **technically deployable as a controlled alpha on the managed domain**, but it is **not yet ready for an unrestricted production launch on the requested custom domain**. The managed preview returned HTTP 200, `/healthz` returned `status: ok`, `/readyz` returned `status: ready` with database checks true, the frozen dependency install succeeded, deployment-script syntax passed, the complete tests/build/typecheck/accessibility pipeline passed before the final audit changes, and unauthenticated protected boundaries correctly returned 401/403.

The final production verdict remains conditional because the requested custom hostname currently returns an Nginx 404 rather than the DSAI application, real OAuth callback/revocation has not been exercised with user consent, all Super Fast field samples have not been collected, and `pnpm audit --prod` still reports unresolved transitive high/moderate advisories. These are not cosmetic issues and must remain visible in launch communications.

## Sequential readiness results

| Layer | Check | Evidence | Status | Required action |
|---|---|---|---|---|
| Source | TypeScript and production build | `pnpm exec tsc --noEmit`; `pnpm build` | Pass | Keep in CI/release gate |
| Dependencies | Frozen reproducibility | `pnpm install --frozen-lockfile --offline` | Pass | Preserve lockfile and upgrade policy |
| Dependencies | Production advisory scan | `pnpm audit --prod`: 4 high, 30 moderate, 7 low, 0 critical after Drizzle ORM upgrade | Conditional | Review Express/path-to-regexp, lodash/Recharts, nanoid/PostCSS, and Mermaid/DOMPurify exposure before unrestricted launch |
| Database | Readiness | `/readyz` reported `databaseConfigured: true`, `databaseHandle: true` | Pass in current environment | Re-run against final deployment database after migration |
| Runtime | Liveness | `/healthz` returned `status: ok` | Pass | Add external uptime alerting |
| Auth | Protected trace route | Unauthenticated request returned 401 | Pass | Perform final-origin OAuth persistence test |
| Auth/RBAC | Admin connector route | Unauthenticated request returned 403 | Pass | Verify admin and non-admin sessions on final origin |
| Security | Browser headers and request IDs | `nosniff`, HSTS, frame denial, permissions policy, request ID observed | Pass | Configure report collection and review CSP reports |
| Deployment | Script syntax and env validator syntax | `bash -n deploy-genesis.sh`, `node --check` for setup/validator | Pass | Run on a clean VPS with production env |
| Domain/TLS | Managed domain | `https://genesisai-86cmsdxx.manus.space/` returned HTTP/2 200 | Pass | Use as alpha domain if desired |
| Domain/TLS | Requested custom domain | `https://dsai.banglarvoice24news.com/` resolved and served TLS but returned Nginx 404 | Blocked | Configure reverse proxy/upstream and verify `/healthz`, `/readyz`, homepage, OAuth callback |
| Storage/files | Lifecycle contracts | Quarantine, deletion tombstones, retention audit and backup-drill contracts exist | Foundation | Configure real scanner, object storage deletion, OCR, isolated restore, and retention worker |
| Providers | OAuth | No-grant credential checks exist; real callback/revoke remains blocked | Blocked | Verify exact redirect URIs, run consent, callback, scope, expiry, revoke and post-revoke denial tests |
| Performance | Field evidence | Quality Gates records truthful samples and now links to each module | Incomplete | Collect samples for every critical module; do not infer or fabricate pass values |
| Accessibility | Static contract | `pnpm check:a11y` passed 5 checks across 94 client files | Pass for static contract | Add browser axe/keyboard/contrast checks in CI before public launch |
| Backup | Drill contract | Manifest, integrity, RTO/RPO assessment and runbook exist | Foundation | Execute isolated restore against a real production-like backup |

## Remediations completed during this audit

The direct Drizzle ORM dependency was upgraded from `0.44.7` to `0.45.2` because the initial production advisory scan identified a high-severity Drizzle SQL-identifier advisory. TypeScript and targeted regression tests passed after the upgrade. The remaining advisory set is predominantly transitive: Express 4's old `path-to-regexp`, Recharts' lodash path, PostCSS/Vite nanoid branches, and Mermaid/DOMPurify. These require dependency-path review and compatibility testing rather than an unsafe blind major-version upgrade.

The deployment checklist was expanded so source, environment, database, runtime, security, provider, performance, domain, backup, and accessibility evidence are recorded in one sequence. The Quality Gates page now offers a route-specific “Open module” action for collecting real navigation samples while preserving a “Not measured” state. The capability ledger and low-cost video policy remain truthful: free previews are bounded and lawful; no provider quota, billing, or access control is bypassed.

## Required final launch sequence

First, provision and validate the final custom-domain reverse proxy. The current DNS record resolves to `34.92.112.34` and TLS responds, but the application is not routed there; the observed Nginx 404 is therefore a deployment configuration failure, not a frontend route failure. Second, run `validate-production-env.mjs` on the target host and apply migrations against the target database. Third, run the clean-host deployment script and verify `/healthz` and `/readyz`. Fourth, test first-time login, returning login, logout, non-admin authorization, admin authorization, OAuth callback state/PKCE, denial, insufficient scope, expiration, revoke, and post-revoke denial on the final HTTPS origin. Fifth, collect field samples for Homepage, Workspace, Alpha Dashboard, Security Lab, Integration Pilot, Trace Store, Agent Operations, and Compliance Dashboard. Sixth, execute an isolated backup restore drill and review production dependency advisories. Only after these gates pass should the service be announced as a full production launch.

> The current evidence supports a **controlled alpha launch**, not a claim that every provider, external integration, custom-domain route, media worker, OCR service, billing flow, or autonomous action is live.

## References

[1]: https://www.w3.org/TR/WCAG22/ "W3C Web Content Accessibility Guidelines 2.2"

[2]: https://www.nist.gov/privacy-framework "NIST Privacy Framework"

[3]: https://ffmpeg.org/ffmpeg.html "FFmpeg Documentation"

[4]: https://owasp.org/www-project-application-security-verification-standard/ "OWASP Application Security Verification Standard"
