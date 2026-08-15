# DSAI Authentication and Admin Access Guide

## Current state

DSAI currently uses the project’s Manus OAuth flow. The public site does not contain a separate password database or a standalone email/password signup form. A first-time user begins through the OAuth portal; after the callback is verified, the backend upserts the user record and assigns the normal `user` role. Returning users receive a session cookie and can access protected UAA and Creative Studio procedures.

This means **account creation is provider-mediated**, not a local signup form. Whether Google, Microsoft, or another identity provider appears is controlled by the configured OAuth portal/application and its enabled providers. DSAI should not claim that Google login is available until the final OAuth portal visibly offers it and the published domain callback is registered. Google OpenID Connect is an established authentication option, but it still requires a correctly configured client, redirect URI, consent screen, scopes, and provider policy [1].

## Access policy

| User type | Entry | Capabilities |
|---|---|---|
| Visitor | Public homepage and waitlist | Read product information; submit validated launch interest |
| Authenticated user | OAuth session | Create/list own UAA cases; submit own Creative Studio requests |
| Administrator | OAuth session plus `role=admin` | Manage connector policy and run no-send environment tests |
| Future admin step-up | WebAuthn/passkey | Required for sensitive connector changes, provider credentials, and emergency actions |

The admin connector route is `/admin/connectors`. It must return an authentication gate when there is no session and a forbidden state when a signed-in account lacks the `admin` role. Connector secrets are never rendered in the browser or stored in the connector registry.

Admin promotion is an operator-controlled action. After the target user completes the configured OAuth login and appears in the `users` table, an existing trusted administrator or the protected database-management channel must change only that user’s `role` from `user` to `admin`, verify the user’s email/openId, record the reason and operator, and require the new administrator to sign out and sign in again. Never promote by email alone without verifying the provider identity. Keep at least two recovery administrators, review the admin list periodically, and demote or revoke a compromised account immediately. The application does not provide a public self-promotion path.

## Disconnected-state diagnosis

A message such as “disconnected” can represent three different conditions. If the browser has no valid session cookie, the user needs to sign in. If `auth.me` fails because the API gateway, cookie, or preview connection is unavailable, the console now shows a retryable connection diagnostic rather than incorrectly presenting the situation as an ordinary login requirement. If the connector registry loads but a provider is absent, the provider is shown as `disabled` or `degraded`; the website remains live and the external action remains paused.

The diagnostic path is therefore: check the page origin and TLS, check the `/api/trpc/auth.me` response, confirm the OAuth callback uses the exact published origin, confirm cookie policy for the final domain, then check the connector’s non-secret environment readiness. Provider credentials are not a substitute for a valid user session.

## Google and other reliable providers

The current architecture can use Google or another approved OIDC provider **through the configured OAuth portal**. The implementation does not silently add a new provider from the frontend. The operator must configure the provider in the OAuth application, register the exact production callback URL, restrict allowed redirect origins, review scopes, and test both first-time and returning-user flows. The final product copy should say “Sign in with an available provider” unless Google is visibly enabled in the production portal.

## Admin fingerprint requirement

Raw fingerprint images or biometric templates must not be collected by DSAI. The correct web implementation is WebAuthn/passkeys: the browser or device authenticates locally, while the server stores a public-key credential and counters rather than the user’s biometric material. WebAuthn is designed around scoped public-key credentials [2], and passkeys avoid sending a password or raw biometric secret to the website [3].

The recommended admin sequence is: first authenticate through the configured OAuth provider; enroll a passkey from a secure admin settings page; require a fresh WebAuthn assertion for connector secret changes, provider activation, destructive operations, and emergency controls; provide at least two recovery administrators; log credential creation, removal, failed assertions, and recovery events; and make the origin, RP ID, HTTPS, clock, and backup/revocation policy explicit.

**WebAuthn/passkey enrollment is not yet implemented in the current project.** It should be added as a gated security increment rather than simulated with a fingerprint upload field. Until then, OAuth plus the admin role remains the implemented control, and high-impact provider actions must remain disabled or dry-run only.

## References

[1] [Google OpenID Connect documentation](https://developers.google.com/identity/openid-connect/openid-connect) — official provider authentication and authorization guidance.

[2] [W3C WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/) — public-key credential standard for web authentication.

[3] [MDN Passkeys](https://developer.mozilla.org/en-US/docs/Web/Security/Authentication/Passkeys) — browser-level passkey and credential behavior.

## Independent branding and platform attribution

The public product should lead with **DSAI**, not with a “Powered by Manus” badge. A visible platform attribution can be useful for transparency or may be contractually required in a particular plan or integration, but it can also make a standalone institution look like a reseller or template. The current public interface does not display a “Powered by Manus” footer; the admin gate now describes the dependency generically as secure OAuth, while the internal documentation identifies the actual Manus OAuth implementation for operators.

Attribution and ownership are different questions. A “Powered by” phrase is not, by itself, a transfer of copyright, equity, product ownership, or the right to claim DSAI as someone else’s institution. Official Manus guidance states that users own content created with Manus for personal or commercial use, while also warning that AI outputs may not be unique or protectable and remain subject to applicable law and third-party rights [4]. That guidance does not replace a review of the applicable Terms of Use, branding/trademark rules, hosting plan, and any enterprise agreement. DSAI should therefore use its own domain, logo, legal entity details, privacy/terms pages, and customer contracts, while disclosing infrastructure/authentication providers where transparency or contract requires it.

Recommended public language is **“DSAI — Bengali-first workflow intelligence”** with a discreet legal or privacy-page disclosure such as “Authentication and hosting services may be provided by third-party infrastructure partners.” Avoid implying that Manus endorses DSAI, owns DSAI, or is a co-founder. Before commercial launch, obtain written confirmation from the relevant platform support or legal channel if a required attribution is unclear.

[4] [Official Manus guidance on ownership of websites and other generated assets](https://help.manus.im/en/articles/13125514-do-i-own-the-assets-websites-images-videos-slides-generated-via-manus)

## Launch gate: live OAuth verification

The code path, environment presence, protected-route rejection, OAuth state construction, retryable disconnected state, and backend authentication boundaries have been audited. However, **live OAuth sign-in, session persistence across a real browser restart, and admin-console interaction through a user-connected browser remain unverified launch gates** because this audit session did not have an authenticated user browser available. Before inviting real users, an operator must complete one first-time sign-in, one returning-session check, one logout/re-login check, and one admin-route authorization check on the final published domain. Record the callback origin, provider shown by the OAuth portal, resulting user row, role decision, and logout behavior without recording access tokens or biometric data.
