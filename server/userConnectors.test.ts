import { afterEach, describe, expect, it, vi } from "vitest";
import {
  decryptConnectorSecret,
  encryptConnectorSecret,
  USER_CONNECTOR_CATALOG,
  verifyConnectorCredential,
} from "./userConnectors";

const testKey = Buffer.alloc(32, 7);

describe("user connector security", () => {
  it("encrypts credentials with authenticated AES-256-GCM and decrypts them", () => {
    const encrypted = encryptConnectorSecret({ apiKey: "test-fixture-api-key-not-real" }, testKey);
    expect(encrypted.ciphertext).not.toContain("test-fixture-api-key-not-real");
    expect(decryptConnectorSecret(encrypted, testKey)).toEqual({ apiKey: "test-fixture-api-key-not-real" });
  });

  it("rejects tampered ciphertext", () => {
    const encrypted = encryptConnectorSecret({ apiKey: "test-fixture-api-key-not-real" }, testKey);
    expect(() => decryptConnectorSecret({ ...encrypted, ciphertext: Buffer.from("tampered").toString("base64") }, testKey)).toThrow();
  });

  it("does not label paid APIs as free or allow them in WorkDesk free route", () => {
    const openrouter = USER_CONNECTOR_CATALOG.find(item => item.id === "openrouter");
    const openai = USER_CONNECTOR_CATALOG.find(item => item.id === "openai");
    expect(openrouter?.workDeskEnabled).toBe(true);
    expect(openai?.freeTier).toBe("paid");
    expect(openai?.workDeskEnabled).toBe(false);
  });

  it("validates key format before contacting provider", async () => {
    const result = await verifyConnectorCredential("openrouter", "short");
    expect(result).toMatchObject({ ok: false, code: "INVALID_KEY_FORMAT" });
  });

  it("uses a non-generation metadata request and reports invalid credentials safely", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 401 }));
    const result = await verifyConnectorCredential("openrouter", "test-fixture-api-key-not-real");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/key",
      expect.objectContaining({ method: "GET", redirect: "error" }),
    );
    expect(result).toMatchObject({ ok: false, code: "CREDENTIAL_REJECTED" });
    expect(JSON.stringify(result)).not.toContain("test-fixture-api-key-not-real");
  });
});

afterEach(() => vi.restoreAllMocks());
