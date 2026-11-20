# DSAI platform distribution matrix

This document distinguishes installable deliverables from browser-based access. A workflow must never publish a file under a platform label unless it is a valid, tested artifact for that platform.

## Current production origin

- Web application: https://dsai-one.vercel.app
- Android application ID: com.dsai.platform
- Android version currently configured in Gradle: 1.0.1 (versionCode 2)

## Implemented in this change

| Platform | Deliverable | Pipeline status |
| --- | --- | --- |
| Android direct install | Upload-key-signed release APK | Added to the existing manual Android release job |
| Google Play | Upload-key-signed Android App Bundle (.aab) | Existing manual Android release job retained |
| Android controlled testing | Debug APK | Existing push/PR job retained |

The signed APK and AAB use the same externally managed keystore and are verified before upload. The workflow does not expose keystore contents in logs or artifacts. The release job remains opt-in through workflow_dispatch and the build_release input.

## Remaining platform work and release gates

### Windows and macOS

The repository is a Vite + React web application with a Node server; it is not currently a desktop-native application. A Windows .exe/.msi or macOS .dmg/.pkg must not be fabricated by renaming a web build.

Before adding desktop installers, choose and implement a supported desktop shell (for example, Tauri or Electron), define whether the desktop app loads the hosted production origin or bundles a local frontend, and test authentication, file upload/download, external links, deep links, updates, and offline/error behavior. Then add signed/notarized release jobs on Windows and macOS runners. Windows code signing and Apple Developer ID notarization credentials are separate optional secrets and must be supplied out of band.

### iOS and iPadOS

The Android WebView wrapper is not an iOS application. An iOS deliverable requires an iOS project and a deliberate WebView/native-shell implementation, privacy declarations, entitlements, and device testing. A distributable .ipa requires Apple signing assets and provisioning (or an approved Xcode Cloud/App Store Connect distribution route). These credentials must never be committed or pasted into chat. Until those prerequisites exist, use the production web app or Add to Home Screen as a web app; do not label that as an IPA.

## Release acceptance criteria

1. Build from a pinned toolchain and a specific commit.
2. Validate package/bundle identifiers and version metadata.
3. Verify signatures for signed binaries.
4. Generate SHA-256 checksums and provenance metadata.
5. Upload each platform artifact under an unambiguous name.
6. Run platform-specific smoke tests on real devices/OS runners.
7. Publish a GitHub Release only after all required checks pass.

## Security

Signing keys, passwords, provisioning profiles, API tokens, and notarization credentials must remain in GitHub Actions secrets or an approved signing service. Never upload them as artifacts or print them in logs.
