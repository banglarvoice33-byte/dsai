# DSAI Android Play Store and Low-Network Readiness Guide

**Status:** Mobile web foundations implemented and verified; Android publication remains a controlled release gate.

## Executive decision

The current DSAI product is a full-stack web application with a Bengali-first interface, Manus OAuth, protected workspace routes, privacy/deletion workflows, and a one-command server deployment script. The correct Android path is **PWA first, then a verified Trusted Web Activity (TWA)**. A TWA opens the web application in a fullscreen Android activity and verifies that the Android package and website belong to the same developer through Digital Asset Links [1].

This release adds the web foundations required for an installable PWA: `manifest.json`, lightweight vector icons, mobile install metadata, and a conservative service worker. The service worker caches only the public shell and static assets. It deliberately excludes `/api/`, OAuth, and `/manus-storage/` so private data, authentication, and user files are never silently served from a stale offline cache.

> **No honest production process can guarantee zero defects or Play approval.** This release is production-oriented and test-backed, but final Android readiness still depends on a real HTTPS domain, a signed AAB, a verified Digital Asset Links file, Play Console declarations, review credentials, device testing, and provider credentials where relevant.

## What is implemented

| Area | Current state | User impact |
|---|---|---|
| Install metadata | Implemented in `client/public/manifest.json` and `client/index.html` | Browser can recognize DSAI as an installable web app once served over HTTPS. |
| App identity | Bengali-first name, description, theme, portrait orientation, vector icons | Consistent DSAI identity across mobile browser and launcher surfaces. |
| Offline shell | Implemented in `client/public/sw.js` | Previously visited public shell can open without network. |
| Private data safety | API, OAuth, and storage paths bypass service-worker caching | Offline mode cannot fabricate fresh account or workspace results. |
| Network UX | Implemented global Bengali-first online/offline banner with retry action | Users understand when reading is possible and when a write/login needs connection. |
| Request recovery | React Query uses bounded query retries and refetch-on-reconnect; mutations do not retry automatically | Transient reads recover without duplicate critical writes. |
| Account deletion | Existing privacy page and deletion request path | Supports the web resource required for Play account-deletion disclosure, subject to final domain verification. |
| Native Android artifact | Not yet generated in this project | A signed AAB and package identity are still required before Play submission. |

## Low-network behavior and safety model

The application supports **offline reading of the previously visited public shell**, not offline execution of authenticated work. UAA case creation, Creative Studio submissions, OAuth login, deletion requests, file uploads, and any future provider action require a live connection. This is intentional: queueing authenticated writes in a browser cache without an idempotency key, conflict policy, and explicit user confirmation could duplicate or lose sensitive work.

When a request fails, read queries retry at most twice with a capped exponential delay. Mutations do not retry automatically because repeating a critical write can create duplicate cases or submissions. When the connection returns, read queries may refetch. The visible offline banner includes a retry control, while page content retains normal bottom-safe spacing so it does not cover mobile content.

For a future offline-write phase, add a server-issued idempotency key, an encrypted local queue, explicit pending/sent/failed states, conflict resolution, a user-controlled “send now” action, and a retention/deletion policy before enabling it. Do not claim offline case submission until these gates pass.

## Android/TWA release procedure

First publish the web application on the final HTTPS domain and confirm that `/manifest.json`, `/sw.js`, the icons, `/privacy`, and the account-deletion request path return successful responses. Then run Lighthouse installability and test the public pages on real Android devices across Wi-Fi, 4G/5G, airplane mode after a successful first visit, and a cold launch with no prior service-worker registration.

Next create the Android TWA wrapper with Bubblewrap or the Android Browser Helper. The package must target the current Play requirement. Android’s published guidance states that, starting **31 August 2026**, new apps and updates must target Android 16/API 36 or higher, with stated platform exceptions [2]. Confirm the current requirement in Play Console immediately before submission because policy dates can change.

Generate a unique application ID and signing key, keep the upload key in a protected secret manager, and record the SHA-256 certificate fingerprint. Publish a production Digital Asset Links file at:

```text
https://<final-domain>/.well-known/assetlinks.json
```

The file must contain the exact package name and certificate fingerprint. Do not publish an example or placeholder file. A mismatch causes the TWA trust relationship to fail and may expose browser chrome or break deep-link expectations.

The first TWA launch has a special limitation: the service worker is not available until the web application has successfully loaded once. Chrome’s official offline-first guidance recommends a native launcher activity that checks connectivity and shows a native offline fallback before the first TWA launch [3]. DSAI’s current web release does not yet include that native fallback; therefore, the first cold launch must be tested online, or the Android wrapper must implement the launcher fallback before claiming first-launch offline support.

## Play Console submission checklist

| Gate | Required evidence or action | DSAI status |
|---|---|---|
| Signed Android App Bundle | Production `.aab`, package ID, version code, upload key, internal test track | Pending native wrapper and signing. |
| Target API | Current target SDK matching Play’s active requirement | Pending Android build. |
| Data Safety | Declare actual collection, processing, sharing, retention, security, and deletion behavior | Privacy data inventory exists; final declarations must be completed by the publisher. |
| Account deletion | In-app path plus public web resource when users can create accounts | Web deletion flow exists; verify final production URL and complete the Play form. Google explicitly requires both paths for apps that enable account creation [4]. |
| Privacy policy | Public, stable HTTPS URL matching the actual app behavior | Existing Privacy page; bind it to the final domain and re-audit after Android integrations. |
| App access | Reviewer instructions or test account where login is required | Must be supplied in Play Console; never publish credentials in the repository. |
| Content and AI declarations | Explain human review, generated-content boundaries, moderation, and prohibited claims | Controlled-alpha boundaries documented; complete Play declarations for the final feature set. |
| Store listing | Bengali/English title, short description, screenshots, icon, feature graphic, support email | Prepare from the final signed artifact; do not imply unavailable live generation or automation. |
| Testing | Internal/closed track, real devices, offline/cold-start, OAuth, deletion, upload/security, accessibility | Web checks pass; Android device and Play-track checks remain. |

## Required final acceptance tests

A release candidate is eligible for Play submission only when all of the following are recorded with date, device, Android version, network condition, and result: first install online; first launch offline; second launch offline after a successful online visit; navigation to every public route; login and returning session; protected workspace authorization; failed read retry; mutation no-retry behavior; reconnect refetch; data deletion request; file-upload rejection and scanner boundary; screen-reader labels; keyboard/focus behavior; portrait and small-screen layout; deep links; Digital Asset Links verification; and Play internal-test installation/update/uninstall.

The current web release passes the deterministic web contracts, TypeScript, production build, public route checks, security boundaries, and mobile visual verification. It does **not** claim that a signed AAB, Digital Asset Links, Play Console Data Safety form, native first-launch fallback, or Play review has already passed.

## One-command server operation

The existing `deploy-genesis.sh` remains the server deployment entry point. Before using it on the final host, configure the production environment, database, OAuth redirect URI, TLS, domain, owner/admin identity, and backup policy. After deployment, verify `/healthz`, `/readyz`, `/manifest.json`, `/sw.js`, `/privacy`, and the account-deletion URL. A successful health check does not by itself mean the Android artifact is Play-ready.

## References

[1]: https://developer.android.com/develop/ui/views/layout/webapps/trusted-web-activities "Android Developers — Overview of Trusted Web Activities"

[2]: https://developer.android.com/google/play/requirements/target-sdk "Android Developers — Meet Google Play’s target API level requirement"

[3]: https://developer.chrome.com/docs/android/trusted-web-activity/offline-first "Chrome Developers — Offline-First Trusted Web Activities"

[4]: https://support.google.com/googleplay/android-developer/answer/13327111?hl=en "Google Play Console Help — Understanding app account deletion requirements"
