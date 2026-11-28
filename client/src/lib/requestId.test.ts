import { afterEach, describe, expect, it, vi } from "vitest";
import { createRequestId } from "./requestId";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("createRequestId browser compatibility", () => {
  it("uses the native UUID implementation when available", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "native-request-id" } as unknown as Crypto);
    expect(createRequestId()).toBe("native-request-id");
  });

  it("creates a UUID-shaped id when randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {
      getRandomValues: (bytes: Uint8Array) => {
        bytes.fill(7);
        return bytes;
      },
    } as unknown as Crypto);
    expect(createRequestId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("keeps legacy non-cryptographic fallback isolated to request correlation when Web Crypto is absent", () => {
    vi.stubGlobal("crypto", undefined);
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    // This fallback is an idempotency/correlation identifier only, never a credential.
    expect(createRequestId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
