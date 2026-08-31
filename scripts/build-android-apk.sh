#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
OUT_DIR="${DSAI_APK_OUT_DIR:-$ROOT_DIR/../dsai-apk-release}"
ORIGIN="${DSAI_ANDROID_ORIGIN:-https://genesisai-86cmsdxx.manus.space}"
GRADLE_BIN="${GRADLE_BIN:-gradle}"

command -v "$GRADLE_BIN" >/dev/null || { echo 'APK_BUILD_FAIL: gradle is required'; exit 1; }
test -d "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" || { echo 'APK_BUILD_FAIL: ANDROID_HOME or ANDROID_SDK_ROOT is required'; exit 1; }
mkdir -p "$OUT_DIR"

BUILD_ARGS=(--no-daemon -p "$ANDROID_DIR" -PdsaiOrigin="$ORIGIN")
if [[ "${DSAI_APK_VARIANT:-debug}" == "release" ]]; then
  TASK=":app:assembleRelease"
  APK="$ANDROID_DIR/app/build/outputs/apk/release/app-release-unsigned.apk"
else
  TASK=":app:assembleDebug"
  APK="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
fi

"$GRADLE_BIN" "${BUILD_ARGS[@]}" "$TASK"
test -s "$APK"
NAME="${DSAI_APK_NAME:-DSAI-Android-1.0.0-${DSAI_APK_VARIANT:-debug}.apk}"
cp "$APK" "$OUT_DIR/$NAME"
sha256sum "$OUT_DIR/$NAME" | tee "$OUT_DIR/$NAME.sha256"
printf 'APK=%s\nORIGIN=%s\nVARIANT=%s\n' "$OUT_DIR/$NAME" "$ORIGIN" "${DSAI_APK_VARIANT:-debug}"
