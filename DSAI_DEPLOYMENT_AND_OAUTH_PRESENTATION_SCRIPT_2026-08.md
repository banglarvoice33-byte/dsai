# DSAI Deployment Status and OAuth Integration

## Presentation script

### Opening — What is ready

“DSAI is a Bengali-first AI Workdesk designed to turn complex information into accountable, human-reviewed work. The current release includes authenticated durable traces, Bengali evaluation contracts, security headers, API rate limiting, retention and deletion evidence, signed billing-webhook verification boundaries, backup and restore drill contracts, accessibility automation, a capability ledger, and provider-gated creative workflows for image and video planning.”

### Slide 1 — Deployment status

“The one-command deployment package has been rebuilt as a credential-free ZIP. It contains the source, lockfile, deployment scripts, migrations, validation tools, and documentation, while excluding dependencies, builds, runtime state, populated environment files, and private keys. The latest archive contains 309 files, passed ZIP integrity and secret scanning, and has SHA-256 hash `7f21bc002cbdb9fd4aaa9f78e3ddb56f70f576188324472023eeae3b872fee40`.”

### Slide 2 — What has been tested

“We completed the test suite, TypeScript validation, production build, accessibility automation, public route smoke tests, security-header checks, unauthenticated boundary checks, package inspection, and managed-domain route checks. The public homepage, capability ledger, Creative Studio, and readiness surface returned successfully. The managed `/readyz` endpoint returned 200. The managed `/healthz` path still has an edge-routing discrepancy and must be corrected at the reverse-proxy layer before it is used as the production health signal.”

### Slide 3 — Why OAuth is currently blocked

“The OAuth page is authenticated and the audit records are being stored correctly. The visible `state_mismatch` records are intentional fail-closed tests. They prove that an invalid state or PKCE verifier is rejected; they do not prove a successful provider callback. The environment has structurally configured sandbox variables, but real execution still depends on provider-console redirect allowlists, test-user approval, least-privilege scopes, and a consent session.”

### Slide 4 — OAuth integration sequence

“The integration sequence is precise. First, register the exact HTTPS callback URL in the provider console. Second, confirm that the same URI exists in the DSAI environment. Third, enable only read-only scopes. Fourth, add the sandbox test account. Fifth, start authorization from the DSAI pilot. Sixth, verify callback success with redacted metadata. Seventh, revoke the token. Eighth, verify that post-revoke access is denied. No access token, refresh token, client secret, password, or OTP is displayed in the audit UI or telemetry.”

### Slide 5 — Required OAuth evidence

“The release gate closes only when the callback, state and PKCE verification, token redaction, revocation, and post-revoke denial are all recorded. If any redirect URI, issuer, scope, state, or verifier check fails, the system remains blocked and does not claim provider readiness.”

### Slide 6 — Lawful zero-cost video live test

“Zero-cost video testing means a bounded preview with no additional paid provider charge; it does not mean unlimited generation or bypassing provider quotas. The first live test uses a three-to-five-second low-resolution preview, one active job per user, a daily preview budget, deterministic cache reuse, visible queue state, safety and rights checks, provenance metadata, and explicit provider/model labeling.”

### Slide 7 — Cost-control order

“The system checks for a cache hit first. If there is no hit, it can produce a local storyboard or animatic fallback. Next it may use an authorized free-tier provider adapter. Paid or self-hosted rendering is only available after explicit entitlement and consent. Retry counts, prompt hashes, asset hashes, provider response classes, and elapsed time are recorded as privacy-safe evidence. Raw media and credentials are never placed in telemetry.”

### Slide 8 — Release decision

“The current release is ready for controlled-alpha deployment and provider-free creative preview demonstration. It is not yet approved for unrestricted production provider operations. The remaining gates are real OAuth consent/callback/revoke evidence, post-revoke denial, authenticated module-by-module field-performance samples, and correction of the custom-domain health-route discrepancy.”

### Closing — Immediate next actions

“To proceed, the operator must confirm the provider callback allowlists, use a sandbox test account to complete consent and revoke in the browser, and configure the custom-domain reverse proxy so the health endpoint is routed correctly. No additional password or secret needs to be shared in chat. Once those evidence items are recorded, DSAI can move from controlled-alpha readiness toward a bounded production pilot.”

## Presenter notes

The presenter must not describe mock, blocked, or provider-gated states as real generation or live integration success. Any mention of zero cost must be accompanied by quota, provider, safety, and entitlement limits. The ZIP hash should be verified after download, and secrets should be supplied only through the project secret manager or provider console.
