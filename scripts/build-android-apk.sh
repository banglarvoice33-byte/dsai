#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
OUT_DIR="${DSAI_APK_OUT_DIR:-$ROOT_DIR/../dsai-apk-release}"
ORIGIN="${DSAI_ANDROID_ORIGIN:-https://genesisai-86cmsdxx.manus.space}"
GRADLE_BIN="${GRADLE_BIN:-gradle}"
VARIANT="${DSAI_APK_VARIANT:-debug}"
FORMAT="${DSAI_ANDROID_ARTIFACT:-apk}"

command -v "$GRADLE_BIN" >/dev/null || { echo 'APK_BUILD_FAIL: gradle is required'; exit 1; }
test -d "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" || { echo 'APK_BUILD_FAIL: ANDROID_HOME or ANDROID_SDK_ROOT is required'; exit 1; }
case "$VARIANT" in debug|release) ;; *) echo 'APK_BUILD_FAIL: DSAI_APK_VARIANT must be debug or release'; exit 1 ;; esac
case "$FORMAT" in apk|aab) ;; *) echo 'APK_BUILD_FAIL: DSAI_ANDROID_ARTIFACT must be apk or aab'; exit 1 ;; esac
mkdir -p "$OUT_DIR"

BUILD_ARGS=(--no-daemon -p "$ANDROID_DIR" -PdsaiOrigin="$ORIGIN")
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
  [[ "$FORMAT" == "apk" ]] || { echo 'APK_BUILD_FAIL: debug AAB is not supported by this release handoff'; exit 1; }
  TASK=":app:assembleDebug"
  ARTIFACT="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
fi

"$GRADLE_BIN" "${BUILD_ARGS[@]}" "$TASK"
test -s "$ARTIFACT"
if [[ "$VARIANT" == "release" ]]; then
  if [[ "$FORMAT" == "apk" ]]; then
    APKSIGNER="${ANDROID_HOME:-${ANDROID_SDK_ROOT}}/build-tools/35.0.0/apksigner"
    test -x "$APKSIGNER" || { echo 'APK_BUILD_FAIL: Android apksigner 35.0.0 is required'; exit 1; }
    "$APKSIGNER" verify "$ARTIFACT"
  else
    command -v jarsigner >/dev/null || { echo 'APK_BUILD_FAIL: jarsigner is required for AAB verification'; exit 1; }
    jarsigner -verify "$ARTIFACT" >/dev/null
  fi
fi
EXTENSION="${FORMAT}"
NAME="${DSAI_APK_NAME:-DSAI-Android-1.0.0-${VARIANT}.${EXTENSION}}"
case "$NAME" in *."$EXTENSION") ;; *) echo "APK_BUILD_FAIL: DSAI_APK_NAME must end with .$EXTENSION"; exit 1 ;; esac
cp "$ARTIFACT" "$OUT_DIR/$NAME"
sha256sum "$OUT_DIR/$NAME" | tee "$OUT_DIR/$NAME.sha256"
printf 'ARTIFACT=%s\nORIGIN=%s\nVARIANT=%s\nFORMAT=%s\n' "$OUT_DIR/$NAME" "$ORIGIN" "$VARIANT" "$FORMAT"
