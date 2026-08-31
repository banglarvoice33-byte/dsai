import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("DSAI Android wrapper contract", () => {
  it("uses a stable application identity and secure WebView defaults", () => {
    const manifest = read("android/app/src/main/AndroidManifest.xml");
    const activity = read("android/app/src/main/java/com/dsai/platform/MainActivity.java");
    expect(manifest).toContain('android:label="DSAI"');
    expect(manifest).toContain('android.permission.INTERNET');
    expect(manifest).toContain('android:usesCleartextTraffic="false"');
    expect(activity).toContain("BuildConfig.DSAI_ORIGIN");
    expect(activity).toContain("setAllowFileAccess(false)");
    expect(activity).toContain("setAllowContentAccess(false)");
    expect(activity).toContain("MIXED_CONTENT_NEVER_ALLOW");
  });

  it("keeps signing material external and exposes a reproducible build command", () => {
    const gradle = read("android/app/build.gradle");
    const script = read("scripts/build-android-apk.sh");
    expect(gradle).toContain('applicationId "com.dsai.platform"');
    expect(gradle).toContain('buildConfigField "String", "DSAI_ORIGIN"');
    expect(script).toContain("DSAI_ANDROID_ORIGIN");
    expect(script).toContain("assembleDebug");
    expect(script).toContain(":app:assembleRelease");
    expect(script).toContain(":app:bundleRelease");
    expect(script).toContain("DSAI_ANDROID_ARTIFACT");
    expect(script).toContain("DSAI_KEYSTORE_PATH is required for release signing");
    expect(script).not.toMatch(/storePassword\s*=\s*/u);
    expect(script).not.toMatch(/keyPassword\s*=\s*/u);
  });
});
