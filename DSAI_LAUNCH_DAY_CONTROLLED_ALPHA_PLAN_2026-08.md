# DSAI Launch-Day Controlled-Alpha Plan

**Launch posture:** Controlled alpha on the managed DSAI domain. This plan does not authorize unrestricted production provider operations until the remaining OAuth, custom-domain, and authenticated performance gates are closed.

## What the operator must provide, and where

| Requirement | Where it is supplied | What must never be sent in chat |
|---|---|---|
| Google or HubSpot client ID and secret | Project secret manager or the provider integration settings | Client secret, access token, refresh token |
| Exact OAuth callback URI | Provider developer console and matching project environment variable | Password, OTP, authorization code |
| Provider test user | Provider console test-user list | Personal recovery codes |
| Custom-domain reverse proxy | VPS/Nginx configuration or hosting control panel | SSH private key or root password |
| Field-performance samples | Signed-in DSAI Quality Gates page, one route at a time | Private prompts or customer data |
| Launch announcement | Public DSAI website and verified social accounts | Unverified social URLs or fabricated engagement |

The user should sign in through the normal Google/OAuth flow in the browser. No DSAI password is created for a Google-based account, and no password reset is required inside DSAI.

## Launch-day sequence

### T-minus 24 hours

Confirm the managed domain, project checkpoint, ZIP hash, environment validator, database migration status, backup drill evidence, privacy/deletion runbook, provider scope list, and support contact. Confirm that the announcement copy says “controlled alpha” and does not claim live image/video generation, unlimited free generation, guaranteed income, or completed real-provider OAuth unless the corresponding evidence exists.

### T-minus 2 hours

Run the clean build, complete test suite, TypeScript check, accessibility automation, ZIP integrity test, secret scan, local `/healthz`, managed `/readyz`, and unauthenticated protected-route checks. Verify that the current checkpoint is the intended release. Confirm rollback ownership and a written stop condition for security, database, OAuth, or provider failures.

### Launch window

Publish the controlled-alpha announcement. Monitor request correlation IDs, error rate, latency, authentication failures, storage failures, lifecycle audit events, and provider-gated attempts. Keep all CRM and Calendar actions read-only. Keep video previews bounded by the shared quota, cache, safety, rights, and retry policy.

### T-plus 30 minutes

Check the public homepage, capability ledger, Creative Studio, Learn route, sign-in entry, readiness page, and support entry on desktop and mobile. Record the first operational review. If a provider callback fails, a token remains usable after revoke, customer data is exposed, or the error rate exceeds the approved threshold, stop new pilot invitations and use the rollback runbook.

## Go/no-go table

| Gate | Current status | Launch decision |
|---|---|---|
| Credential-free deployment ZIP | Passed | Go for controlled alpha |
| Tests, typecheck, build, accessibility | Passed | Go |
| Managed public routes and `/readyz` | Passed | Go with monitoring |
| Managed `/healthz` edge route | 404 discrepancy | Fix before using as production health signal |
| Real OAuth callback, consent, revoke, post-revoke denial | Not evidenced | No real-provider pilot side effects |
| Authenticated module field-performance samples | Incomplete | Do not claim Super Fast approval |
| Read-only CRM/Calendar pilot | Provider-gated | No writes, sends, invites, or deletes |
| Video generation | Preview/provider-gated | Use bounded preview and truthful status |

## Rollback

Rollback to the last approved checkpoint if a release causes authentication failure, unsafe provider scope, data-lifecycle inconsistency, a migration error, a reproducible security-header regression, or a material increase in error rate. Do not use destructive database commands to recover the release. Preserve correlation IDs and redacted audit evidence for the incident review.

## Announcement boundary

The launch message should describe DSAI as a Bengali-first AI Workdesk for structured, evidence-aware, human-reviewed work. It may highlight the Workdesk, traces, Bengali evaluation, read-only pilots, creative planning, and responsible deployment. It must describe live provider generation and external CRM/Calendar effects as gated unless independently verified.
