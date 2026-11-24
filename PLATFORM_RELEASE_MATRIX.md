# DSAI platform distribution matrix

## Production origin
- Web: https://dsai-one.vercel.app
- Android application ID: com.dsai.platform
- Current Android version: 1.0.2 (versionCode 3)
- Android compile/target SDK: API 36 (Android 16); Gradle 8.11.1; Android Gradle Plugin 8.10.1

## Pipelines
| Platform | Output | Workflow | Signing status |
| --- | --- | --- | --- |
| Android | Debug APK, signed release APK, signed Play AAB (API 36) | android-apk.yml | Signed release artifacts verified on 2026-11-24; Play Console submission/acceptance remains separate |
| Windows | NSIS EXE and MSI | desktop-release.yml | Unsigned unless Windows code-signing certificate is configured |
| macOS | DMG | desktop-release.yml | Unsigned unless Developer ID signing and notarization are configured |
| iOS | Simulator app + generated Xcode project | ios-native.yml | macos-26 runner; Xcode 26+ and iOS 26+ SDK asserted; unsigned simulator build |
| iOS distribution | IPA | ios-native.yml signed-ipa job gate | Requires manual `workflow_dispatch` with `build_ipa=true`, `DSAI_IOS_SIGNING_ENABLED=true`, Apple-issued signing certificate, provisioning profile and team configuration |

The desktop shell loads the canonical HTTPS production origin in a sandboxed Electron window. Desktop dependency installation is pinned by committed `desktop/package-lock.json` and release jobs use `npm ci`. Node integration is disabled, context isolation and sandbox are enabled, and non-DSAI navigation is opened externally.

## iOS signing limitation
An Apple Developer signing identity cannot legitimately be minted offline or by ChatGPT. Apple issues distribution certificates and provisioning profiles to an enrolled developer team. The private key must be generated and retained securely by the account owner; Apple portal approval and team entitlements are required. Never send Apple ID passwords, private keys, certificates, or provisioning profiles through chat or commit them to Git.

The iOS workflow runs on the macos-26 GitHub runner, verifies Xcode 26+ and iOS 26+ SDK, generates and validates a Capacitor Xcode project, and builds an unsigned simulator app. This is not an IPA and cannot be installed on a physical iPhone. Signed IPA distribution requires Apple-issued credentials in protected GitHub Actions secrets or an approved signing service.

## Desktop signing limitation
Windows EXE/MSI and macOS DMG artifacts produced without platform certificates are unsigned. Windows SmartScreen and macOS Gatekeeper may warn or block installation. Production distribution requires an organization-controlled Windows code-signing certificate and Apple Developer ID signing plus notarization.

## Acceptance gates
1. Build from pinned toolchains and a specific commit.
2. Verify artifact type, bundle/package identifiers and version.
3. Generate SHA-256 checksums and provenance.
4. Keep all signing material outside Git and logs.
5. Test on real Windows/macOS/iOS devices before claiming production-ready.

## Desktop signing secrets (optional until distribution)
- Windows: `WINDOWS_CERTIFICATE_PFX_BASE64`, `WINDOWS_CERTIFICATE_PASSWORD`
- macOS: `MACOS_CERTIFICATE_P12_BASE64`, `MACOS_CERTIFICATE_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`

The signing import steps are deliberately skipped for pull-request events. Unsigned installers can be built for CI validation; production signing is available on trusted main-branch pushes or manual workflow dispatch after the protected secrets are configured.


## Verified release evidence (2026-11-24)

- Android workflow run `45313483042` produced `DSAI-Android-1.0.2-release.apk` and `DSAI-Android-1.0.2-release.aab`. APK/AAB signatures and SHA-256 sidecars were verified. Package: `com.dsai.platform`; version `1.0.2`; versionCode `3`; target SDK API 36.
- These Android packages are a Capacitor WebView wrapper for the production HTTPS site. They require network connectivity and are not offline-native applications.
- Desktop main-branch workflow run `45318902636` successfully built Windows NSIS EXE/MSI and macOS DMG using the committed lockfile. The main-branch run confirmed both Windows and Apple signing certificates are absent, so all three installers were unsigned and correctly withheld from production artifacts. Desktop and Android versions are now aligned to `1.0.2` / build `3` by merged PR #156; the post-merge main-branch build will verify the versioned Windows/macOS installers.
- iOS workflow run `45314735027` successfully built the unsigned simulator app and Xcode project. No IPA was produced because this was not a manual `workflow_dispatch` run with `build_ipa=true`; the Apple signing secrets and `DSAI_IOS_SIGNING_ENABLED` flag still need verification through that protected path.

## Remaining owner acceptance gates

- Google Play Console: upload the signed AAB and complete store listing, policy, and review acceptance.
- Windows: add protected `WINDOWS_CERTIFICATE_PFX_BASE64` and `WINDOWS_CERTIFICATE_PASSWORD`; the current main-branch run confirmed they are absent, so EXE/MSI are unsigned and not published.
- macOS: the main-branch run `45318902636` confirmed no `MACOS_CERTIFICATE_P12_BASE64` is configured; the DMG built unsigned and was correctly withheld from production artifacts. Add `MACOS_CERTIFICATE_P12_BASE64`, `MACOS_CERTIFICATE_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD` and `APPLE_TEAM_ID` to enable signed/notarized release.
- iOS: provide Apple Distribution P12, certificate password, App Store provisioning profile, team ID, and set `DSAI_IOS_SIGNING_ENABLED=true`; then run `workflow_dispatch` with `build_ipa=true`.
- Desktop dependency audit reported six moderate advisories and no high/critical advisories at the configured `npm audit --audit-level=high` gate. Review those moderate advisories before public distribution; do not suppress them without package-level assessment.
