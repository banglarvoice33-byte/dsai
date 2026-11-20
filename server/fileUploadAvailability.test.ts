import { describe, expect, it } from "vitest";
import { fileUploadAvailability } from "./fileSecurity";

describe("file upload availability security gate", () => {
  it("blocks uploads when private storage is unavailable", () => {
    const policy = fileUploadAvailability({
      configured: false,
      scannerConfigured: true,
      storageConfigured: false,
      storageProvider: null,
      r2Configured: false,
      supabaseConfigured: false,
      mode: "auto",
      failClosed: true,
    });
    expect(policy.uploadsEnabled).toBe(false);
    expect(policy.uploadMode).toBe("disabled");
    expect(policy.unavailableReason).toContain("সংরক্ষণের ব্যবস্থা");
  });

  it("allows private quarantine intake when storage exists but no malware scanner is configured", () => {
    const policy = fileUploadAvailability({
      configured: false,
      scannerConfigured: false,
      storageConfigured: true,
      storageProvider: "r2",
      r2Configured: true,
      supabaseConfigured: false,
      mode: "auto",
      failClosed: true,
    });
    expect(policy.uploadsEnabled).toBe(true);
    expect(policy.uploadMode).toBe("quarantine");
    expect(policy.scannerAvailable).toBe(false);
    expect(policy.unavailableReason).toBeNull();
    expect(policy.scanNotice).toContain("ব্যক্তিগত quarantine");
    expect(policy.scanNotice).toContain("ডাউনলোড");
  });

  it("allows normal upload only when both storage and scanner are configured", () => {
    const policy = fileUploadAvailability({
      configured: true,
      scannerConfigured: true,
      storageConfigured: true,
      storageProvider: "r2",
      r2Configured: true,
      supabaseConfigured: false,
      mode: "auto",
      failClosed: true,
    });
    expect(policy.uploadsEnabled).toBe(true);
    expect(policy.uploadMode).toBe("scanned");
    expect(policy.unavailableReason).toBeNull();
    expect(policy.scanNotice).toContain("নিরাপত্তা যাচাই");
  });
});
