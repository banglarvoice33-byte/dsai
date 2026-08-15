# DSAI Backend and Launch Guide

## What is now connected

The public Bengali-first landing page now uses the project’s typed tRPC client instead of placeholder-only actions for the first production workflow. The final launch-interest form calls `waitlist.join`, validates the email on the server, stores the signup in `waitlist_signups`, and reports success or failure in the UI. Authenticated users can enter the protected UAA and Creative Studio paths through the existing Manus OAuth flow. The backend exposes `access.create`, `access.list`, and `creative.request`; those procedures are protected and persist user-owned records.

| Surface | Backend contract | Access policy | Persistence |
|---|---|---|---|
| Launch-interest form | `waitlist.join` | Public, validated input | `waitlist_signups` |
| UAA case creation | `access.create` | Authenticated user | `access_cases` |
| UAA case listing | `access.list` | Authenticated user, own records | `access_cases` |
| Creative request queue | `creative.request` | Authenticated user | `creative_requests` |
| Lead action preview | `lead.preview` | Public, validated dry-run only | No external side effects |
| Identity | `auth.me`, `auth.logout`, Manus OAuth callback | Session-backed | `users` |

## Super System expansion boundary

The first safe foundation for the Response-to-Appointment Agent is now present in `server/leadAgent.ts` and the `lead.preview` tRPC procedure. It validates consent and minimum contact data, returns a deterministic action plan, and keeps outbound messaging and calendar actions disabled. It is intentionally not connected to Twilio, Google Calendar, Cal.com, a CRM, or a voice provider. Those connections require organization-scoped OAuth/API credentials, consent configuration, opt-out handling, provider-terms review, webhook verification, idempotent queue processing, and audit events.

The premium video workflow should remain a separate media-worker subsystem. The web application should orchestrate storage, job metadata, review state, usage meters, and delivery; it should not attempt large-file transcoding on the 1 vCPU/512 MB web runtime.

## Required production configuration

The managed project already provisions the core server values, including `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, and `VITE_OAUTH_PORTAL_URL`. Before making the site public, confirm that the OAuth application’s callback URL is configured for the final published domain and that the database connection is available in the target environment. Do not commit `.env` files or place secrets in the browser bundle.

For the self-managed one-command server package, upload the complete project directory rather than only `dist/`. Then run:

```bash
cd /path/to/genesis-platform-site && bash deploy-genesis.sh
```

The installer now builds the full-stack DSAI server entrypoint, selects the next free application port beginning at `3010`, and verifies the site locally. A public domain still needs a separately reviewed reverse proxy and TLS configuration; the installer intentionally does not overwrite other projects’ proxy or firewall rules.

## DSAI domain and contact setup

Use `info@banglarvoice24news.com` as the public contact address after the mailbox or forwarding rule has been created by the domain operator. For the web test environment, the conventional hostname is `dsai.banglarvoice24news.com`; `dsai@banglarvoice24news.com` is formatted like an email address, so confirm the intended registrar/DNS interpretation before publishing it as a URL. Create the DNS record, issue TLS, configure the reverse proxy, and register the exact final HTTPS origin and OAuth callback with the OAuth provider. Do not claim live access until first-time sign-in, returning-session, logout, and admin authorization have been tested on that final origin.

The DSAI installer stores process state in `.dsai-runtime/`, writes the selected port to `.dsai-runtime/port`, and writes logs to `.dsai-runtime/app.log`. The installer does not create mailboxes, change DNS, issue certificates, or overwrite existing proxy configurations.

## Runtime API connector console

Administrators can open `/admin/connectors` after signing in with an admin account. The console lists the supported connector registry, detects whether the required server-side environment values are present, runs a no-send environment test, and records an enable/disable policy in the `integration_connectors` table. It never renders secret values and it never turns provider credentials into browser-accessible configuration.

Connector states are deliberately conservative. `disabled` means no external action is attempted. `degraded` means the operator selected the policy but required provider values are absent, so the safe fallback remains active. `ready` means the expected environment values exist, but provider-specific OAuth, webhook, consent, terms, rate-limit, and health checks are still required before enabling live actions. A provider being absent never blocks the website build or deployment.

Adding a new provider still requires a small server-side adapter and its environment-key declaration; after that code is deployed, the operator can configure the secret through the project’s protected secret-management path and enable the connector from the admin console without changing the public frontend or stopping the deployment. Secret values must not be entered into the application database or exposed in the UI.

## Production rollout sequence

First, run the local validation suite with the project’s package manager: `pnpm check`, `pnpm test`, and `pnpm build`. Next, confirm the database migration has been applied in the target environment. The migration creates the connector registry table alongside the existing domain tables and contains no destructive `DROP` statements. Then verify the OAuth callback and launch-interest form on the published domain. Finally, review database access, logs, backups, rate limits, and the retention policy before inviting real users.

Authentication details, provider limits, disconnected-state diagnostics, and the admin WebAuthn/passkey roadmap are documented in `docs/AUTHENTICATION_AND_ADMIN_GUIDE.md`. The current implementation stores only the waitlist email and the minimum workflow metadata needed for the first UAA and Creative Studio queue. It does not upload user documents, call an external image-generation provider, or submit high-risk forms. Those features require separate consent, storage, cost-control, abuse-prevention, and human-review work before enabling them.

## Operational safeguards

The public waitlist mutation is limited to structured fields and server-side validation. Authenticated routes use the built-in protected procedure, which rejects unauthenticated requests before persistence. High-risk workflows remain represented as drafts and are not automatically submitted to external services. The product continues to exclude device cryptocurrency mining, wallets, token payouts, guaranteed-income claims, and unlimited-generation promises.

## Next implementation layer

The next engineering increment should add an authenticated `/app` workspace using the existing dashboard components, where users can see their own access cases and queued creative requests. A later increment can add S3-backed document uploads after reviewing the file-storage guidance and writing explicit consent, retention, deletion, and malware-scanning rules. Payment processing should be added only after pricing, tax, refund, and jurisdictional review are complete.


## DSAI discovery and public-answer layer

The public site now includes a Bengali-first `DSAI শিখুন` section, expanded FAQ answers, truthful Organization and FAQ JSON-LD, `client/public/robots.txt`, and `client/public/sitemap.xml`. The site explains how to use DSAI, why someone might choose it, what the current UAA and Creative Studio paths do, and which generation, billing, calendar, upload, OCR, and external-action features remain gated.

After the final HTTPS domain is active, verify it in Google Search Console and Bing Webmaster Tools, submit the sitemap, inspect the rendered homepage, and monitor search/citation signals. Keep `OAI-SearchBot` allowed if DSAI wants to be discoverable in ChatGPT search; do not block public Learn content through a CDN or WAF. The current robots file excludes `/admin/` and `/api/` while allowing the public site. Search visibility and AI citation are not guaranteed by structured data or robots settings.

DSAI currently has no verified official social account URLs published in the site. Do not add guessed Facebook, LinkedIn, YouTube, Instagram, or X links. After the operator creates and verifies canonical profiles, add only those URLs to the footer, the Organization `sameAs` field, and the social-content runbook. Until then, direct public questions to `info@banglarvoice24news.com` and the on-site Learn/FAQ layer. See `docs/DSAI_DISCOVERY_RESEARCH_2026-08-15.md` and `docs/DSAI_MARKET_READINESS_AND_USER_ANSWERS_2026-08-15.md` for the research-backed operating plan.
