# DSAI platform distribution matrix

## Production origin
- Web: https://dsai-one.vercel.app
- Android application ID: com.dsai.platform
- Current Android version: 1.0.2 (versionCode 3)
- Android compile/target SDK: API 36 (Android 16); Gradle 8.11.1; Android Gradle Plugin 8.10.1

## Pipelines
| Platform | Output | Workflow | Signing status |
| --- | --- | --- | --- |
| Android | Debug APK, upload-signed release APK, Play AAB (API 36) | android-apk.yml | Android upload keystore secrets; signed job auto-skips if any required secret is absent |
| Windows | NSIS EXE and MSI | desktop-release.yml | Unsigned unless Windows code-signing certificate is configured |
| macOS | DMG | desktop-release.yml | Unsigned unless Developer ID signing and notarization are configured |
| iOS | Simulator app + generated Xcode project | ios-native.yml | macos-26 runner; Xcode 26+ and iOS 26+ SDK asserted; unsigned simulator build |
| iOS distribution | IPA | ios-native.yml signed-ipa job gate | Requires manual `workflow_dispatch` with `build_ipa=true`, `DSAI_IOS_SIGNING_ENABLED=true`, Apple-issued signing certificate, provisioning profile and team configuration |

The desktop shell loads the canonical HTTPS production origin in a sandboxed Electron window. Node integration is disabled, context isolation and sandbox are enabled, and non-DSAI navigation is opened externally.

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
