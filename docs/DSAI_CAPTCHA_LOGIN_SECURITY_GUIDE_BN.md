# DSAI CAPTCHA Login Security Guide

## What this release protects

The direct `/auth/login` entry now requires a provider-verified CAPTCHA before the OAuth redirect can begin when CAPTCHA is enabled. In production, the default is fail-closed: if the CAPTCHA provider secret or public site key is missing, login is blocked rather than silently bypassed. A successful browser-side widget is not trusted by itself; the server sends the token to the configured verification endpoint and accepts it only after provider confirmation.

The current adapter is compatible with Cloudflare Turnstile-style site verification. The provider may be changed through `CAPTCHA_VERIFY_URL`, but the response must provide a successful verification result and, when configured, the expected hostname.

## Required production values

The operator must create a provider site key and server secret from the chosen CAPTCHA provider. The public site key is exposed to the login page; the secret is server-only and must never be placed in a `VITE_` variable, browser code, repository, screenshot, chat, or log.

| Variable | Location | Purpose |
|---|---|---|
| `CAPTCHA_ENABLED=true` | Server environment | Enables the gate explicitly. Production also requires it by default. |
| `VITE_CAPTCHA_SITE_KEY` | Public frontend environment | Renders the mobile-friendly CAPTCHA widget. This is not a secret. |
| `CAPTCHA_SECRET_KEY` | Server-only secret manager | Verifies the token with the provider. |
| `CAPTCHA_VERIFY_URL` | Server environment | Provider verification endpoint; the default is Turnstile siteverify. |
| `CAPTCHA_ALLOWED_HOSTNAME` | Server environment | Optional exact hostname returned by the provider, for example `dsai.banglarvoice24news.com`. |

After provisioning, restart or redeploy the server and open `/auth/login`. If the provider is missing or unavailable, OAuth must remain blocked and the page should show a Bengali remediation message. This is safer than allowing unverified login.

## Privacy and accessibility

CAPTCHA is a third-party security service and may process security telemetry under its own terms. The production Privacy Policy and consent assessment must be reviewed for the selected provider and jurisdiction. The widget is rendered only on the direct login page, does not accept passwords or API keys, and retains the existing sanitized OAuth return path and nonce protection. Users who cannot complete the challenge should receive a clear retry path and an operator-supported alternative, without bypassing server verification.

## Operational checks

The operator should verify the public site key and server secret using the environment validator without printing values, confirm the allowed hostname, test the login page on a narrow Android viewport, complete a real provider challenge in staging, confirm that invalid or expired tokens are rejected, confirm that provider outage blocks login, and rotate the secret after any exposure. CAPTCHA reduces automated login attempts but does not replace rate limiting, OAuth nonce validation, session security, anomaly detection, or account recovery controls.
