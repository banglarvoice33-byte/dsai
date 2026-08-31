# DSAI Android wrapper

This module packages the DSAI web application as an installable Android WebView app. The default origin is `https://genesisai-86cmsdxx.manus.space`; override it without editing source by passing `-PdsaiOrigin=https://your-approved-host` to Gradle or setting `DSAI_ANDROID_ORIGIN` when using the repository build script.

## Build an installable debug APK

The debug build is signed with the local Android debug key and is suitable for direct installation on a phone for controlled testing:

```bash
export ANDROID_HOME=/path/to/android-sdk
export PATH=/path/to/gradle/bin:$PATH
DSAI_APK_VARIANT=debug bash scripts/build-android-apk.sh
```

Install it on a connected Android device with:

```bash
adb install -r ../dsai-apk-release/DSAI-Android-1.0.0-debug.apk
```

The APK requests only `android.permission.INTERNET`, disables cleartext traffic, disables file/content access, keeps third-party cookies disabled, and opens external links outside the DSAI origin in the system browser.

## Production signing

The checked-in project intentionally contains no keystore, passwords, signing key, or production certificate. A release APK requires an operator-managed keystore outside the repository. Configure the Android Gradle signing block through a private local or CI-only mechanism before publishing to an app store. Do not send keystore material through chat or commit it to the source tree.

The supplied APK is an installable debug build, not a store-signed production release. It uses the verified Manus production web origin and therefore still depends on the remote service, DNS/TLS, OAuth, database, and provider gates being operational.
