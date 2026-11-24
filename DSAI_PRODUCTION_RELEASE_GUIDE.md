# DSAI Production Release Guide

**Release posture:** Controlled-alpha production candidate. The web application, deployment script, privacy/deletion workflow, protected workspace, admin boundaries, PWA foundation, and low-network read experience are implemented and test-backed. The guide does not claim Play approval, live provider integrations, zero defects, or successful external OAuth persistence without operator credentials.

## 1. Upload and prepare the server

Upload the complete credential-free project directory to a Linux server. Do not upload a populated environment file from another environment. Create the protected external file `/etc/dsai/dsai.env` with mode `0600`; use `.env.production.example` only as a reference:

```bash
sudo install -d -o "$USER" -g "$USER" -m 700 /etc/dsai
sudo touch /etc/dsai/dsai.env
sudo chown "$USER:$USER" /etc/dsai/dsai.env
sudo chmod 600 /etc/dsai/dsai.env
nano /etc/dsai/dsai.env
chmod 600 /etc/dsai/dsai.env
```

Enter the required production values locally on the VPS. The deployment script loads `/etc/dsai/dsai.env`; it does not require or create a populated `.env.production` in the project directory. Supply built-in server integration values through this protected file or the approved secret manager; never place credentials in frontend code or commit them. Confirm the database is reachable, migrations are applied through the project’s schema workflow, and the OAuth application allows the final HTTPS origin and callback.

## 2. One-command deployment

Run exactly one command from the uploaded project directory:

```bash
cd /path/to/genesis-platform-site && bash deploy-genesis.sh
```

The script checks Linux prerequisites, installs only missing Node/corepack dependencies when supported by `apt-get`, prepares a verified pnpm binary, stops only the previously recorded DSAI process, selects a free port beginning at `3010`, loads and validates required environment values, installs with the frozen lockfile, builds the frontend/server bundle, starts the server, and polls `/healthz`. It records the PID, selected port, and log under `.dsai-runtime/`.

The default range `3010–3099` follows the requested eleventh-slot convention when `3000–3009` are occupied, but the script always checks actual listeners. To use another range:

```bash
DSAI_START_PORT=4010 DSAI_END_PORT=4099 bash deploy-genesis.sh
```

## 3. Verify the running service

Replace `PORT` with the value printed by the installer:

```bash
PORT=$(cat .dsai-runtime/port)
curl -fsS "http://127.0.0.1:${PORT}/healthz"
curl -fsS "http://127.0.0.1:${PORT}/readyz"
curl -I "http://127.0.0.1:${PORT}/manifest.json"
curl -I "http://127.0.0.1:${PORT}/sw.js"
tail -n 100 .dsai-runtime/app.log
```

A successful health response confirms process liveness; readiness confirms the current database check. It does not confirm OAuth, third-party providers, malware scanning, payments, Android packaging, or Play review.

## 4. Domain, TLS, and OAuth

Use a normal web hostname such as `dsai.banglarvoice24news.com`. The value `dsai@banglarvoice24news.com` is syntactically an email address, not a normal web subdomain. Keep `info@banglarvoice24news.com` as the public contact address only after the operator provisions the mailbox, SPF, DKIM, and DMARC.

Create the DNS record pointing the web hostname to the reverse proxy or server. Terminate TLS at the reverse proxy, keep the application port private when possible, and forward the original host/protocol headers. Add the exact HTTPS origin and OAuth callback required by the application to the OAuth provider. Test a new login and a returning session in a connected browser; do not describe OAuth as verified until that click-through succeeds.

## 5. Production safety boundaries

DSAI stores account/workflow metadata in the configured database and keeps private API and OAuth paths out of the service-worker cache. File uploads remain fail-closed until a signed malware-scanner adapter is configured and staging-tested. The public privacy page contains the deletion request form; operators must verify identity and review legal retention obligations before completing deletion. Admin routes require an authenticated admin role, and protected workspace routes reject unauthenticated requests.

Do not expose `/etc/dsai/dsai.env`, database credentials, API keys, raw documents, or user data in screenshots or support tickets. Do not enable external messaging, calendar booking, payment, affiliate payout, autonomous lead contact, media generation, or OCR claims until their provider credentials, consent model, rate limits, idempotency, audit trail, refund/legal review, and staged tests are complete.

## 6. Android and low-network release

The current release includes a PWA-ready Bengali-first web app and a native Android WebView shell that loads the canonical remote origin `https://dsai-one.vercel.app`. The APK is not a fully bundled offline web app. The web app includes lightweight icons, conservative public-shell caching, a Bengali offline status surface, bounded read retries, reconnect refetch, and no automatic mutation retry. Authenticated writes, login, deletion requests, uploads, and provider actions intentionally require connectivity.

Before Play submission, create a signed Android App Bundle with Android 16 / API 36 (compileSdk 36 and targetSdk 36), using Android Gradle Plugin 8.10.1 and Gradle 8.11.1. The current release candidate is 1.0.2 (versionCode 3). Configure the final package ID and upload key, publish the exact Digital Asset Links file at `/.well-known/assetlinks.json`, complete Play Data Safety and account-deletion disclosures, provide reviewer access instructions, and run internal-track tests. Test first online launch, subsequent offline launch, 320/360/390px layouts, system text scaling, OAuth, deletion, authorization, retry behavior, and service-worker exclusion of `/api/`, OAuth, and storage paths.

## 7. iOS and desktop distribution

The iOS workflow now uses the GitHub `macos-26` runner and fails closed unless `xcodebuild` reports Xcode 26 or later and an iOS 26 or later SDK. It builds an unsigned simulator app for CI. A signed IPA is produced only when `DSAI_IOS_SIGNING_ENABLED=true` and the Apple-issued distribution certificate, private key, provisioning profile, team ID, and export configuration are supplied through protected GitHub secrets. The CI toolchain check does not constitute App Store Connect upload approval.

Windows EXE/MSI and macOS DMG can be built unsigned for validation. Production distribution requires organization-controlled Windows code-signing and Apple Developer ID signing/notarization credentials. Do not treat an unsigned installer as a production release.

## 8. Final release gate

The release is ready for controlled production deployment when the operator records successful results for environment validation, migration/readiness, TLS, OAuth, backups, rollback, real-device layout, privacy deletion, protected/admin boundaries, and staged provider checks. The release is not eligible for an unconditional “flawless” or “Play-approved” claim until those external gates are evidenced.

## 9. Recovery and update

To update, upload the new project files and rerun the same deployment command. The installer reuses the saved port when available, rebuilds from the lockfile, stops only the previous DSAI PID, and performs a new health check. If the build or health check fails, inspect `.dsai-runtime/app.log`, restore the last known-good checkpoint, and do not expose the failed process publicly.

For the complete feature and risk evidence, read:

- `docs/DSAI_FINAL_LAUNCH_AUDIT_2026-08-16.md`
- `docs/DSAI_ANDROID_PLAYSTORE_AND_LOW_NETWORK_GUIDE_2026-08-16.md`
- `docs/DSAI_FULL_STACK_REGRESSION_AUDIT_2026-08-16.md`
- `docs/DSAI_SECURITY_AUDIT_2026-08-16.md`
- `DEPLOYMENT.md`
