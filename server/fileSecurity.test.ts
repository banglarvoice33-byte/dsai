import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isFileAssetAvailableForUse,
  isMalwareScannerHealthy,
  toUserFileAssetView,
} from "./fileSecurity";

const originalEnv = {
  NODE_ENV: process.env.NODE_ENV,
  MALWARE_SCANNER_URL: process.env.MALWARE_SCANNER_URL,
  MALWARE_SCANNER_API_KEY: process.env.MALWARE_SCANNER_API_KEY,
};

function configureScanner(url: string) {
  process.env.NODE_ENV = "test";
  process.env.MALWARE_SCANNER_URL = url;
  process.env.MALWARE_SCANNER_API_KEY = "test-only-scanner-key";
}

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("live malware scanner health gate", () => {
  it("fails closed when scanner configuration is absent", async () => {
    delete process.env.MALWARE_SCANNER_URL;
    delete process.env.MALWARE_SCANNER_API_KEY;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(isMalwareScannerHealthy()).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts only a healthy ClamAV readiness response", async () => {
    configureScanner("http://scanner-healthy.test:8080");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "ok", engine: "clamav", ready: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(isMalwareScannerHealthy()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBeInstanceOf(URL);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("http://scanner-healthy.test:8080/healthz");
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: "GET", redirect: "error", cache: "no-store" });
  });

  it("rejects a healthy HTTP response when the scanner reports not ready", async () => {
    configureScanner("http://scanner-not-ready.test:8080");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "ok", engine: "clamav", ready: false }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ));

    await expect(isMalwareScannerHealthy()).resolves.toBe(false);
  });

  it("rejects non-success and non-JSON health responses", async () => {
    configureScanner("http://scanner-bad-status.test:8080");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response("unavailable", { status: 503, headers: { "content-type": "text/plain" } }),
    ));
    await expect(isMalwareScannerHealthy()).resolves.toBe(false);

    configureScanner("http://scanner-bad-json.test:8080");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response("ok", { status: 200, headers: { "content-type": "text/plain" } }),
    ));
    await expect(isMalwareScannerHealthy()).resolves.toBe(false);
  });

  it("rejects public cleartext scanner URLs in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.MALWARE_SCANNER_URL = "http://public-scanner.example";
    process.env.MALWARE_SCANNER_API_KEY = "test-only-scanner-key";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(isMalwareScannerHealthy()).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("deduplicates concurrent probes and briefly caches a healthy result", async () => {
    configureScanner("http://scanner-cache.test:8080");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "ok", engine: "clamav", ready: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const [first, second] = await Promise.all([
      isMalwareScannerHealthy(),
      isMalwareScannerHealthy(),
    ]);
    expect(first).toBe(true);
    expect(second).toBe(true);
    await expect(isMalwareScannerHealthy()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("file asset availability", () => {
  const cleanAsset = {
    id: 1,
    originalName: "report.pdf",
    mimeType: "application/pdf",
    byteSize: 128,
    scanStatus: "clean" as const,
    retentionExpiresAt: new Date("2026-12-01T00:00:00.000Z"),
  };

  it("never exposes a historical clean verdict while the scanner is unhealthy", () => {
    expect(isFileAssetAvailableForUse("clean", false)).toBe(false);
    expect(toUserFileAssetView(cleanAsset, false).status).toBe("unavailable");
  });

  it("exposes a clean asset only after a positive live scanner check", () => {
    expect(isFileAssetAvailableForUse("clean", true)).toBe(true);
    expect(toUserFileAssetView(cleanAsset, true).status).toBe("ready");
    expect(toUserFileAssetView({ ...cleanAsset, scanStatus: "quarantined" }, true).status).toBe("pending");
  });
});
