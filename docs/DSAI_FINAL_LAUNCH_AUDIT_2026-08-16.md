# DSAI Final Launch-Readiness Audit

**Audit date:** 16 August 2026  
**Release classification:** Controlled alpha / design-partner ready  
**Project:** DSAI Bengali-first AI Workdesk

## Executive conclusion

DSAI is deployable as a controlled-alpha Workdesk foundation, not yet as the complete always-on Super Agent, media-production, billing, or multi-provider hosting platform described in the broadest roadmap. The current release has a public Bengali-first website, bilingual discovery content, OAuth entry path, protected Workspace, persisted UAA case drafts, persisted Creative brief queue, admin connector and operations surfaces, privacy/deletion workflows, security foundations, file-upload fail-closed gates, and a one-command deployment script.

The most important user-facing clarification is that **launch waitlist and login are different flows**. The homepage email form stores an interest record so a user can receive a launch update. It does not create a session. The actual personal workflow begins through **“Sign in / create account”**, which starts the configured OAuth flow. The Workspace then checks the session and either shows the sign-in screen or the authenticated case/creative queue.

> A successful deployment command cannot create OAuth credentials, domain/TLS configuration, database credentials, mailbox access, provider accounts, or legal/compliance approvals. Those values must be supplied and verified by the operator.

## Login and waitlist behavior

| User action | Implemented behavior | Honest interpretation |
|---|---|---|
| Submit the homepage email form | Calls the public `waitlist.join` procedure and stores email, interest, and language | Launch-update interest collection; not login |
| Click “Sign in / create account” | Calls `startLogin()`, creates a one-time OAuth state nonce, and redirects to the configured OAuth portal | Real OAuth entry path; requires valid production OAuth configuration |
| Open `/workspace` without a session | Shows “Sign in / create account” and does not request private lists | Correct protected-route behavior |
| Open `/workspace` with a session | Loads user-scoped UAA cases and Creative requests | Implemented authenticated foundation |
| Use invalid OAuth callback state | Rejected with HTTP 403 in runtime verification | Defensive callback boundary |

## Plan-versus-delivery matrix

| Original objective | Current delivery | Status | What remains |
|---|---|---|---|
| Bengali-first specialist Workdesk | Bengali-first public UI, BN/EN homepage toggle, Learn/FAQ/Evidence/Method/Platform pages | Implemented foundation | Continue language QA and domain glossary work |
| “Who is DSAI?” and “How to use DSAI?” answers | Homepage Learn layer, `/learn`, global Knowledge Help, search aliases, FAQ and Evidence ledger | Implemented and discoverable | Add unanswered-question analytics and editorial review queue |
| UAA document understanding | User-scoped case draft creation and listing | Implemented foundation | OCR, file intake, citations, document parsing and human reviewer operations |
| Creative Studio | User-scoped Creative brief queue | Implemented foundation | Image/video generation, worker, quotas, billing, provenance and moderation |
| Human-in-the-loop safety | No-auto-submit copy, risk boundaries, provider gates, protected workflows | Implemented policy boundary | Real reviewer assignment, approval records and escalation operations |
| 24/7 Super Agent | Lead-plan preview and connector registry | Designed / gated | Durable queue, provider adapters, consent, webhooks, idempotency and always-on hosting |
| Three-second client response | Local deterministic planner benchmark and best-effort SLO language | Measured core only | External messaging delivery and booking latency must be measured in staging |
| Calendar, CRM, SMS and voice | Connector registry and readiness surfaces | Not live | OAuth, scopes, consent, opt-out, signed webhooks, audit logs and provider tests |
| Text-to-video and large video editing | Honest roadmap status and Creative brief queue | Not live | Media provider, worker, storage, moderation, quota, billing and retention |
| One-command deployment | `bash deploy-genesis.sh`, port range 3010–3099, build, restart and `/healthz` probe | Implemented and smoke-tested | Operator must configure environment, DB, DNS/TLS, reverse proxy and OAuth |
| Runtime API additions | Admin connector registry and safe provider-absent fallback | Foundation only | Each connector still needs a server adapter and staging validation |
| Affiliate/influencer commission | Transparent partner architecture and non-live disclosure | Not live | Payment connector, attribution ledger, refunds, fraud, KYC/KYB, tax and disclosure review |
| Admin fingerprint login | No raw fingerprint storage; passkey/WebAuthn roadmap | Not implemented | Passkey enrollment, recovery, step-up authentication and audit policy |
| Crypto mining/passive device earnings | Explicitly excluded | Intentionally absent | No action required |

## A-to-Z deployment checklist

### Before upload

Use the credential-free release archive from the checkpoint. Confirm the target Linux server has network access, a supported Node.js runtime or permission to install it, and a database reachable from the server. Do not upload populated `.env.production`, runtime state, `node_modules`, build output, or managed project metadata.

### Environment and database

Copy `.env.production.example` to `.env.production`, set mode `0600`, and replace all placeholders. Required values are `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, and `VITE_OAUTH_PORTAL_URL`. Confirm the MySQL schema migrations have been applied, including changelog, deletion requests, search analytics, file assets, and all earlier tables.

### Domain, TLS, and OAuth

Point the chosen domain or subdomain to the server or reverse proxy. Terminate TLS and preserve the `/api` path. Register the exact final-domain callback URL `/api/oauth/callback` with the OAuth provider. Test first login, logout, returning session, expired state, invalid state, and mobile browser persistence. A local preview HTTP 200 does not prove final-domain OAuth persistence.

### One command

From the extracted project directory, run:

```bash
chmod 600 .env.production
bash deploy-genesis.sh
```

The script installs locked dependencies, builds the frontend and server bundle, selects or reuses a free port in the 3010–3099 range, restarts the process, stores PID/log/port state under `.dsai-runtime`, and probes `/healthz`. After launch, verify `/healthz`, `/readyz`, the public homepage, `/learn`, `/platform`, `/privacy`, `/workspace`, and the protected admin pages.

### Operator verification

Sign in on the final domain. Create one UAA draft and one Creative request. Confirm user-scoped data is not visible in an unauthenticated browser. Check that the admin role is correct, deletion requests can be reviewed, search analytics remain aggregate, connector actions remain gated, and no secret value appears in the UI or logs.

### Do not promote as live until

Calendar/messaging/CRM adapters pass staging tests; file scanning is configured; storage deletion is confirmed; rate limiting, idempotency and signed webhook verification are active; payment/refund/KYC/tax controls are reviewed; backup/restore and rollback are tested; support and abuse handling are staffed; and an independent security review has assessed the final deployment.

## Final verification evidence

The final audit passed TypeScript checking, **32 Vitest tests**, production build, deployment-script syntax, root HTTP 200, readiness HTTP 200, Learn HTTP 200, Platform HTTP 200, Workspace HTTP 200, admin-page HTTP 200, and invalid OAuth callback HTTP 403. Responsive captures covered the complete homepage on mobile and the homepage, Learn, Workspace and admin platform on desktop.

## Final answer to the launch question

DSAI can be deployed today as a **controlled-alpha Bengali-first Workdesk** if the operator supplies real environment values, database access, final-domain DNS/TLS, OAuth registration, mailbox/support handling and migration readiness. It cannot honestly be launched today as a fully integrated 24/7 autonomous agent, text-to-video editor, calendar-booking service, affiliate payout platform, or self-hosted VPS marketplace because those provider and operational gates are not yet live.

## Internal evidence sources

The audit reconciles the implementation with `docs/CONVERSATION_ALIGNMENT_AUDIT.md`, `docs/DSAI_CAPABILITY_AND_OPERATOR_GUIDE_2026-08-15.md`, `docs/DSAI_SECURITY_AUDIT_2026-08-16.md`, `docs/DSAI_FILE_UPLOAD_SECURITY_POLICY_2026-08-16.md`, `deploy-genesis.sh`, the protected `Workspace` page, and the public `Learn`, `Evidence`, `Method`, `Platform`, `Privacy`, and `Changelog` routes.
