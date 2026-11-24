# DSAI Android wrapper

This module packages the DSAI web application as an installable Android WebView app. The canonical Production origin is `https://dsai-one.vercel.app`. The Android app ID is `com.dsai.platform`; current Android version is `1.0.2 (versionCode 3)`.

## Reproducible build requirements

- JDK 17 or newer (CI uses Temurin 17)
- Gradle 8.11.1 (pinned by the Android build workflow)
- Android SDK Platform 36
- Android SDK Build Tools 35.0.0
- Android SDK licenses accepted

The repository intentionally does not commit a Gradle wrapper JAR. The CI workflow installs the exact Gradle version through the official Gradle setup action and invokes the checked-in build script. Local builds must use the same pinned version.

## Build an installable debug APK

The debug build is signed with the local Android debug key and is suitable for direct installation on a phone for controlled testing. From the repository root:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="/path/to/gradle-8.11.1/bin:$ANDROID_HOME/platform-tools:$PATH"
DSAI_APK_VARIANT=debug DSAI_ANDROID_ORIGIN=https://dsai-one.vercel.app \
  DSAI_APK_OUT_DIR="$PWD/artifacts" bash scripts/build-android-apk.sh
```

The script fails closed unless the required SDK packages and exact Gradle version are present. It verifies the APK signature, package ID and minimum SDK, then writes a SHA-256 checksum and build metadata beside the APK.

Install on a connected Android device:

```bash
adb install -r artifacts/DSAI-Android-1.0.2-debug.apk
```

The GitHub Actions workflow builds this same debug APK for pull requests and pushes to `main`, and uploads it as a workflow artifact. It does not deploy a Vercel Preview or change Supabase.

## Security and app behavior

The APK requests only `android.permission.INTERNET`, disables cleartext traffic, disables file/content access, keeps third-party cookies disabled, and opens links outside the configured DSAI origin in the system browser. The app loads the canonical Production website; its AI and data features continue to depend on the remote Vercel and Supabase services.

## Production signing

The repository intentionally contains no keystore, passwords, signing key, or production certificate. A release APK or Android App Bundle requires an operator-managed keystore outside the repository. Never send keystore material through chat or commit it to the source tree.

For a release-signed APK, set these values in a private shell or CI secret store:

```bash
export DSAI_KEYSTORE_PATH=/secure/path/dsai-upload.jks
export DSAI_KEYSTORE_PASSWORD='provided-out-of-band'
export DSAI_KEY_ALIAS='provided-out-of-band'
export DSAI_KEY_PASSWORD='provided-out-of-band'
DSAI_APK_VARIANT=release DSAI_ANDROID_ARTIFACT=apk \
  bash scripts/build-android-apk.sh
```

For Google Play, prefer a signed Android App Bundle by setting `DSAI_ANDROID_ARTIFACT=aab`. The release task fails closed without all keystore inputs. Obtain the certificate fingerprint locally with `keytool -list -v -keystore /secure/path/dsai-upload.jks`; never place the keystore or passwords in chat, Git, or the Android source tree.

A debug APK is installable for controlled testing but is not a store-signed production release. Play Console publication additionally requires final Data Safety and account-deletion disclosures, app asset/domain decisions, and internal-track/device testing.
