#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
SDK_DIR="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
OUT_DIR="${DSAI_APK_OUT_DIR:-$ROOT_DIR/../dsai-apk-release}"
ORIGIN="${DSAI_ANDROID_ORIGIN:-https://dsai-one.vercel.app}"
GRADLE_BIN="${GRADLE_BIN:-}"
VARIANT="${DSAI_APK_VARIANT:-debug}"
FORMAT="${DSAI_ANDROID_ARTIFACT:-apk}"
EXPECTED_GRADLE_VERSION="8.11.1"
EXPECTED_PACKAGE="com.dsai.platform"
EXPECTED_BUILD_TOOLS="35.0.0"
EXPECTED_TARGET_SDK="36"

if [[ -z "$GRADLE_BIN" ]]; then
  GRADLE_BIN="$(command -v gradle || true)"
fi
[[ -n "$GRADLE_BIN" && -x "$GRADLE_BIN" ]] || {
  echo 'APK_BUILD_FAIL: Gradle 8.11.1 is required; set GRADLE_BIN to its executable'
  exit 1
}
[[ -n "$SDK_DIR" && -d "$SDK_DIR" ]] || {
  echo 'APK_BUILD_FAIL: ANDROID_HOME or ANDROID_SDK_ROOT must point to an installed Android SDK'
  exit 1
}
command -v java >/dev/null 2>&1 || { echo 'APK_BUILD_FAIL: JDK 17 or newer is required'; exit 1; }
JAVA_VERSION="$(java -XshowSettings:properties -version 2>&1 | grep 'java.specification.version =' | awk '{print $3; exit}')"
[[ "$JAVA_VERSION" =~ ^[0-9]+$ && "$JAVA_VERSION" -ge 17 ]] || {
  echo 'APK_BUILD_FAIL: JDK 17 or newer is required'
  exit 1
}
GRADLE_VERSION_OUTPUT="$("$GRADLE_BIN" --version)"
grep --quiet --fixed-strings --line-regexp -- "Gradle $EXPECTED_GRADLE_VERSION" <<<"$GRADLE_VERSION_OUTPUT" || {
  echo "APK_BUILD_FAIL: expected Gradle $EXPECTED_GRADLE_VERSION"
  exit 1
}
[[ -d "$SDK_DIR/platforms/android-36" ]] || { echo 'APK_BUILD_FAIL: Android SDK Platform 36 is required'; exit 1; }
[[ -x "$SDK_DIR/build-tools/$EXPECTED_BUILD_TOOLS/apksigner" ]] || { echo "APK_BUILD_FAIL: Android Build Tools $EXPECTED_BUILD_TOOLS are required"; exit 1; }
[[ -x "$SDK_DIR/build-tools/$EXPECTED_BUILD_TOOLS/aapt" ]] || { echo "APK_BUILD_FAIL: Android aapt from Build Tools $EXPECTED_BUILD_TOOLS is required"; exit 1; }

[[ "$ORIGIN" =~ ^https://[A-Za-z0-9.-]+(:[0-9]{1,5})?$ ]] || {
  echo 'APK_BUILD_FAIL: DSAI_ANDROID_ORIGIN must be a bare HTTPS origin'
  exit 1
}
case "$VARIANT" in debug|release) ;; *) echo 'APK_BUILD_FAIL: DSAI_APK_VARIANT must be debug or release'; exit 1 ;; esac
case "$FORMAT" in apk|aab) ;; *) echo 'APK_BUILD_FAIL: DSAI_ANDROID_ARTIFACT must be apk or aab'; exit 1 ;; esac
mkdir -p "$OUT_DIR"

BUILD_ARGS=(--no-daemon --stacktrace -p "$ANDROID_DIR" -PdsaiOrigin="$ORIGIN")
if [[ "$VARIANT" == "release" ]]; then
  : "${DSAI_KEYSTORE_PATH:?APK_BUILD_FAIL: DSAI_KEYSTORE_PATH is required for release signing}"
  : "${DSAI_KEYSTORE_PASSWORD:?APK_BUILD_FAIL: DSAI_KEYSTORE_PASSWORD is required for release signing}"
  : "${DSAI_KEY_ALIAS:?APK_BUILD_FAIL: DSAI_KEY_ALIAS is required for release signing}"
  : "${DSAI_KEY_PASSWORD:?APK_BUILD_FAIL: DSAI_KEY_PASSWORD is required for release signing}"
  test -f "$DSAI_KEYSTORE_PATH" || { echo 'APK_BUILD_FAIL: external keystore path does not exist'; exit 1; }
  if [[ "$FORMAT" == "aab" ]]; then
    TASK=":app:bundleRelease"
    ARTIFACT="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"
  else
    TASK=":app:assembleRelease"
    ARTIFACT="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
  fi
else
  [[ "$FORMAT" == "apk" ]] || { echo 'APK_BUILD_FAIL: debug AAB is not supported'; exit 1; }
  TASK=":app:assembleDebug"
  ARTIFACT="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
fi

"$GRADLE_BIN" "${BUILD_ARGS[@]}" "$TASK"
test -s "$ARTIFACT" || { echo 'APK_BUILD_FAIL: Gradle did not produce the expected artifact'; exit 1; }

APKSIGNER="$SDK_DIR/build-tools/$EXPECTED_BUILD_TOOLS/apksigner"
AAPT="$SDK_DIR/build-tools/$EXPECTED_BUILD_TOOLS/aapt"
if [[ "$FORMAT" == "apk" ]]; then
  "$APKSIGNER" verify --verbose "$ARTIFACT"
  BADGING="$("$AAPT" dump badging "$ARTIFACT")"
  grep --quiet --fixed-strings "package: name='$EXPECTED_PACKAGE'" <<<"$BADGING" || {
    echo "APK_BUILD_FAIL: APK package name is not $EXPECTED_PACKAGE"
    exit 1
  }
  grep --quiet --fixed-strings "sdkVersion:'23'" <<<"$BADGING" || {
    echo 'APK_BUILD_FAIL: unexpected minimum SDK'
    exit 1
  }
  grep --quiet --fixed-strings "targetSdkVersion:'$EXPECTED_TARGET_SDK'" <<<"$BADGING" || {
    echo 'APK_BUILD_FAIL: unexpected target SDK'
    exit 1
  }
  grep --quiet --fixed-strings "versionCode='3' versionName='1.0.2'" <<<"$BADGING" || {
    echo 'APK_BUILD_FAIL: unexpected Android version metadata'
    exit 1
  }
else
  command -v jarsigner >/dev/null 2>&1 || { echo 'APK_BUILD_FAIL: JDK jarsigner is required to verify signed AAB'; exit 1; }
  jarsigner -verify -verbose -certs "$ARTIFACT"
fi

NAME="${DSAI_APK_NAME:-DSAI-Android-1.0.2-$VARIANT.$FORMAT}"
case "$NAME" in *."$FORMAT") ;; *) echo "APK_BUILD_FAIL: DSAI_APK_NAME must end with .$FORMAT"; exit 1 ;; esac
cp "$ARTIFACT" "$OUT_DIR/$NAME"
# Store a portable relative filename so checksum verification works after artifact download.
(cd "$OUT_DIR" && sha256sum -- "$NAME") > "$OUT_DIR/$NAME.sha256"
cat "$OUT_DIR/$NAME.sha256"
{
  printf 'artifact=%s\n' "$NAME"
  printf 'origin=%s\n' "$ORIGIN"
  printf 'variant=%s\n' "$VARIANT"
  printf 'format=%s\n' "$FORMAT"
  printf 'package=%s\n' "$EXPECTED_PACKAGE"
  printf 'version=1.0.2 (3)\n'
  printf 'gradle=%s\n' "$EXPECTED_GRADLE_VERSION"
  printf 'java=%s\n' "$JAVA_VERSION"
  printf 'source_commit=%s\n' "${GITHUB_SHA:-local}"
} > "$OUT_DIR/$NAME.metadata.txt"
printf 'APK_BUILD_SUCCESS=1\nARTIFACT=%s\nORIGIN=%s\n' "$OUT_DIR/$NAME" "$ORIGIN"
