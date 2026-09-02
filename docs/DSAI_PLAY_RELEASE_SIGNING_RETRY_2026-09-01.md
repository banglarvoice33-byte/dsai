# DSAI Play Release Signing Retry

## Result

The release-signing workflow was retried on 2026-09-01 without reading or exposing any secret values. The Android project and signing configuration were found intact. The build script was improved to discover the pinned local Gradle binary at `$HOME/gradle-8.10.2/bin/gradle` when Gradle is not on `PATH`.

The retry then reached the intended fail-closed gate:

> `APK_BUILD_FAIL: DSAI_KEYSTORE_PATH is required for release signing`

This is the correct outcome. The only keystore found in the sandbox was the standard Android debug keystore; no production or Play upload keystore was present, and all release credential variables were missing. No release artifact was mislabeled as Play-ready.

## Required operator handoff

| Item | Required input | Safe handling |
|---|---|---|
| Keystore | Existing Play upload keystore or a newly created upload keystore | Keep outside Git, ZIP, APK project, and chat |
| Store path | Absolute path on the controlled build machine | Path only may be recorded |
| Alias | Keystore alias | Non-secret metadata |
| Passwords | Keystore/key passwords | Inject only through the controlled build environment |
| Certificate | SHA-256 public certificate fingerprint | Safe to copy to Play Console and evidence console |
| Artifact | Signed `.aab` preferred for Play; signed `.apk` if specifically required | Verify signature and SHA-256 before upload |

The build command is already prepared for both formats. Once the external inputs exist, the operator can run `DSAI_APK_VARIANT=release DSAI_ANDROID_ARTIFACT=aab bash scripts/build-android-apk.sh` or select `apk` for a signed APK. The script refuses to continue when any keystore input is missing and verifies the resulting signature before copying the artifact.

## Honest status

Project-side release signing is configured and tested. A production-signed APK/AAB and Play Console submission evidence remain pending because the signing key must be supplied from an operator-controlled environment. This boundary preserves signing-key continuity and prevents accidental publication under a key that the project owner cannot retain.
