# DSAI Final Go-Live Readiness Audit

**Audit scope:** inherited chat requirements, current managed preview, application routes, backend contracts, tests, security and governance surfaces, scholarship pilot, creative workflow, credential-free release, VPS handoff, and the requested custom domain.

**Audit classification:** evidence-based controlled-alpha readiness review.

## Executive decision

DSAI is now a coherent **Bengali-first Controlled Alpha Workdesk** with a public discovery surface, a no-document Try First experience, protected workspace foundations, OAuth entry code, scholarship application and entitlement surfaces, admin governance surfaces, provider-gated Creative Studio planning, rate and safety boundaries, and a credential-free VPS deployment path.

It is **not currently live on the requested custom domain**. On 20 August 2026, both `https://dsai.banglarvoice24news.com/` and `https://dsai.banglarvoice24news.com/auth/login` returned a page titled `Error` with visible text `Not Found`. This is a production domain/upstream/history-fallback failure, not evidence that the managed preview is broken. Until the domain serves the current release and the final-domain OAuth flow is verified, a public launch announcement must not claim that the custom-domain deployment is live.

The correct final launch target is therefore:

> **Launch DSAI as a controlled-alpha Bengali-first Workdesk first. Activate external providers, payments, live media rendering, CRM/Calendar actions, and commercial promotion only after their operator gates produce evidence.**

## Expectation versus achievement

| Expected capability from the planning conversation | Current achievement | Classification | Remaining condition |
|---|---|---|---|
| Bengali-first AI Workdesk | Bengali-first public homepage, BN/EN discovery, Workdesk positioning, Learn, Evidence, Method, Privacy, Governance and Changelog routes | **Preview-ready** | Final-domain route and language QA |
| Visitors from Facebook can test before bringing documents | `/try-first` offers a bounded Bengali local preview without login, document, file upload, provider call, or external action | **Preview-ready** | Re-test after VPS deployment |
| Text-to-image | Creative Studio plans **2 or 3 image variations** from one text prompt; no fake generated asset is shown | **Preview/provider-gated** | Provider adapter, quota, moderation, storage and provenance |
| Text-to-video | Creative Studio plans one bounded video from one text prompt | **Preview/provider-gated** | Media worker, provider credentials, cost ceiling, storage and moderation |
| Image-to-video | Creative Studio plans one video from one approved source-image reference | **Preview/provider-gated** | Secure upload, asset verdict, provider adapter, storage and deletion |
| UAA/document assistance | Authenticated case-draft contract and user-scoped records | **Foundation** | OCR, file intake, citations, reviewer operations and external submission |
| First 100 Student Pro pilot | Scholarship page shows 100 approved seats, 30 days, 20/day and 300/month, manual review, age boundary, privacy and AI-error warning | **Policy/UI-ready** | Real applicants, review staffing, entitlement observation and final-domain testing |
| OAuth login | Secure state nonce, callback validation, protected procedures and login route | **Code-ready/operator-gated** | Real credentials, exact final-domain callback, first login, returning session and logout/revoke evidence |
| Google/HubSpot/Calendar/CRM | Connector registry and readiness surfaces | **Operator-gated** | Provider OAuth, scopes, consent, revocation, adapters, webhooks, retries and staging tests |
| 3-second client-response agent | Deterministic local planner and honest best-effort language | **Measured-core only** | Real messaging delivery, consent, booking and external latency evidence |
| Payments: Card, bKash, Nagad, Rocket | Admin control surface with fixed order and all channels disabled by default | **Prepared, not active** | Licensed merchant, hosted checkout, webhook verification, refund, entitlement, tax and support controls |
| Admin management | Role-gated admin overview, connector, scholarship, payment, deletion, search and platform surfaces | **Foundation** | Final-domain admin login, recovery procedure and independent security review |
| Fingerprint/biometric admin login | No raw fingerprint storage; passkey/WebAuthn documented as future step-up control | **Not implemented by design** | WebAuthn enrollment, recovery and audit policy |
| 24/7 autonomous agent | Architecture, traces, quality gates and provider boundaries | **Roadmap/operator-gated** | Durable queue, process supervision, consent, retries, idempotency, webhooks and always-on hosting |
| Passive income or device mining | Explicitly excluded; no crypto-mining or guaranteed-income claim | **Intentionally absent** | None; this is the lawful boundary |
| One-command VPS deployment | Locked install/build/restart/health script plus clean-room bootstrap and preflight | **Release-ready, not live** | Refresh archive after latest code, configure VM, DB, domain, Nginx/TLS and OAuth |

## Verified implementation evidence

The current managed project passed **36 Vitest files with 107 tests**, TypeScript validation, and the production build. The final visual smoke pass covered `/`, `/try-first`, `/creative-studio`, and `/scholarship` at desktop size. The Try First and Creative Studio pages visibly communicate their limits rather than implying that a provider-generated asset already exists.

The latest refreshed archive `/home/ubuntu/DSAI_production_release_FINAL_2026-08-20.zip` passed ZIP integrity testing and contains the expected deployment files, including `package.json`, `pnpm-lock.yaml`, `deploy-genesis.sh`, `.env.production.example`, `scripts/bootstrap-dsai-vm.sh`, `scripts/one-time-vm-bootstrap.sh`, and `scripts/validate-production-env.mjs`. Its file count, byte size, and SHA-256 are recorded in the separate integrity manifest. Use that manifest as the sole source of truth for the upload checksum; the project document does not hardcode its own archive hash.

Upload only this latest refreshed archive and use the new hash. If any deployment documentation is edited afterward, regenerate the ZIP and manifest again before upload.

## Launch-critical gaps

### 1. The requested custom domain is not serving DSAI

This is the only directly observed production blocker. The root and `/auth/login` both return `Not Found`. The likely closure sequence is to confirm DNS points to the intended VM or reverse proxy, confirm the DSAI process is listening on the selected localhost port, route `/api` and all SPA paths to the same upstream, enable history fallback to the built `index.html`, and then verify `/`, `/auth/login`, `/readyz`, `/healthz`, and `/api/oauth/callback` on the public HTTPS origin.

### 2. The release artifact is stale relative to the current project

The latest code includes the visitor Try First flow, the corrected three-mode Creative Studio, and scholarship-copy alignment, but the verified ZIP was built earlier. A fresh credential-free archive and a new SHA-256 manifest are required before upload.

### 3. Live OAuth remains unverified

The code contains a strict OAuth-state boundary, but code correctness is not the same as production authentication evidence. The operator must test first login, returning session, logout, invalid state, revoke/consent behavior, cookie persistence on mobile, and final-domain callback allowlisting without exposing tokens.

### 4. Provider and commercial actions remain disabled

Payments, live media generation, external CRM/Calendar actions, messaging, affiliate payouts, and autonomous publishing are not live. This is a safe state. Activating them without provider credentials, consent, webhook verification, usage limits, refunds, retention/deletion, and support handling would create material operational and legal risk.

### 5. Production CAPTCHA credentials need rotation/verification

The test suite reported that the configured sandbox CAPTCHA secret is rejected by the provider and explicitly states that production validation requires a rotated live Turnstile secret. This is an operator credential gate, not a reason to weaken the fail-closed login boundary.

## Final controlled-alpha launch definition

The launch announcement should say that DSAI is opening a **Controlled Alpha**. A visitor can read the public explanation, use Try First without documents, sign in when they are ready, apply for the first-100-student pilot, create protected work drafts, and inspect the Creative Studio planning workflow. The announcement must not say that DSAI already performs live video generation, automatic CRM/Calendar booking, guaranteed three-second conversion, live payments, biometric administration, or 24/7 external automation.

The first public release should keep all provider-dependent features visibly labeled as **Preview**, **Provider-gated**, or **Coming after verification**. The current UI direction is correct because it separates useful planning from unverified execution.

## Final VPS closure sequence

The following sequence is the final operational order. Values shown in uppercase are operator placeholders; secrets should never be pasted into chat or committed to the project.

### A. Prepare and upload a refreshed archive

```bash
export GCP_PROJECT_ID="YOUR_GCP_PROJECT_ID"
export GCP_ZONE="YOUR_VM_ZONE"
export VM_NAME="dsai"
export VM_USER="YOUR_VM_SSH_USER"
export LOCAL_ZIP="$HOME/DSAI_production_release_FINAL.zip"

gcloud compute scp "$LOCAL_ZIP" \
  "${VM_USER}@${VM_NAME}:~/" \
  --project="$GCP_PROJECT_ID" \
  --zone="$GCP_ZONE"
```

### B. Verify and extract on the VM

```bash
set -Eeuo pipefail
umask 077
ZIP="$HOME/DSAI_production_release_FINAL.zip"
APP_ROOT="$HOME/dsai"
RELEASE_DIR="$APP_ROOT/releases/$(date -u +%Y%m%dT%H%M%SZ)"

sha256sum "$ZIP"
unzip -tq "$ZIP"
mkdir -p "$RELEASE_DIR"
unzip -q "$ZIP" -d "$RELEASE_DIR"

test -f "$RELEASE_DIR/package.json"
test -f "$RELEASE_DIR/pnpm-lock.yaml"
test -f "$RELEASE_DIR/deploy-genesis.sh"
test -f "$RELEASE_DIR/.env.production.example"

if find "$RELEASE_DIR" -type f \( -name '.env' -o -name '.env.production' -o -iname '*.pem' -o -iname '*.key' \) | grep -q .; then
  echo "forbidden secret file found" >&2
  exit 1
fi

ln -sfn "$RELEASE_DIR" "$APP_ROOT/current"
cd "$APP_ROOT/current"
```

### C. Bootstrap secrets and validate without printing them

```bash
chmod +x scripts/bootstrap-dsai-vm.sh
./scripts/bootstrap-dsai-vm.sh
node scripts/validate-production-env.mjs /etc/dsai/dsai.env
```

The core startup contract requires `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, and `VITE_OAUTH_PORTAL_URL`. Production CAPTCHA values must also be valid for the final hostname. Optional provider keys should remain absent until their corresponding adapter, consent, rate limit, webhook, retention and rollback behavior is ready.

### D. Build, start and verify locally

```bash
chmod 600 .env.production
bash deploy-genesis.sh

PORT="$(cat .dsai-runtime/port)"
curl -fsS "http://127.0.0.1:${PORT}/healthz"
curl -fsS "http://127.0.0.1:${PORT}/readyz"
curl -fsS -o /dev/null -w 'root:%{http_code}\n' "http://127.0.0.1:${PORT}/"
curl -fsS -o /dev/null -w 'login:%{http_code}\n' "http://127.0.0.1:${PORT}/auth/login"
```

Expected local results are `healthz: 200`, `readyz: 200` only when the database is ready, and `root:200` plus `login:200`. The deployment script intentionally fails if health passes but `/auth/login` does not return HTTP 200.

### E. Configure reverse proxy and final domain

The proxy must forward `/api` and all application routes to the port recorded in `.dsai-runtime/port`. It must preserve HTTPS, forward the original host, and apply SPA history fallback for `/auth/login`, `/try-first`, `/creative-studio`, `/scholarship`, and other client routes. Then verify:

```bash
curl -fsS https://dsai.banglarvoice24news.com/ >/dev/null
curl -fsS https://dsai.banglarvoice24news.com/auth/login >/dev/null
curl -fsS https://dsai.banglarvoice24news.com/try-first >/dev/null
curl -fsS https://dsai.banglarvoice24news.com/creative-studio >/dev/null
curl -fsS https://dsai.banglarvoice24news.com/readyz
```

### F. Complete the operator gates before promotion

The operator must complete final-domain OAuth first login and returning-session tests, confirm the admin role and recovery contact, rotate and verify production CAPTCHA, confirm database backup and restore, verify TLS renewal, confirm support mailbox delivery, and record the refreshed release hash from `DSAI_production_release_FINAL_2026-08-20.integrity.txt`. Keep payments and external providers disabled until their individual staging evidence is complete.

## Final go/no-go rule

The project is **GO for controlled-alpha release after the refreshed archive is uploaded and the requested custom domain passes the public route and OAuth checks**. It is **NO-GO for claiming a fully live, fully integrated autonomous platform today** because the custom domain currently returns `Not Found` and the external provider gates remain unverified.

This is not a failure of the project. It is the correct engineering boundary between a tested product foundation and a production operation that has actually been connected to a real VM, domain, database, identity provider, payment merchant and external media/connectors.

## References

[1]: ./DSAI_FINAL_LAUNCH_AUDIT_2026-08-16.md "Previous DSAI final launch-readiness audit"
[2]: ./CONVERSATION_ALIGNMENT_AUDIT.md "Conversation-to-project alignment audit"
[3]: ../DSAI_VM_UPLOAD_AND_EXTRACT_BN.md "Bengali VPS upload and extraction handoff"
[4]: ./DSAI_CAPABILITY_AND_OPERATOR_GUIDE_2026-08-15.md "Capability and operator guide"
[5]: ./AUTHENTICATION_AND_ADMIN_GUIDE.md "Authentication and admin guide"
[6]: ./DSAI_FINAL_CUSTOM_DOMAIN_CHECK_2026-08-20.md "Direct custom-domain production check"
[7]: ../DSAI_FINAL_TERMINAL_COMMAND_MATRIX_BN.md "Final Bengali terminal command matrix"
