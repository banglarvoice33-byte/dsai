import { describe, expect, it, vi } from "vitest";
import { getOptionalUserOpenRouterKey } from "./aiAssistant";

describe("AI assistant user-owned OpenRouter key resolution", () => {
  it("uses the signed-in owner's OpenRouter connector key", async () => {
    const readKey = vi.fn(async (userId: number, provider: "openrouter") => {
      expect(userId).toBe(42);
      expect(provider).toBe("openrouter");
      return "owner-scoped-test-key";
    });
    await expect(getOptionalUserOpenRouterKey(42, readKey)).resolves.toBe("owner-scoped-test-key");
    expect(readKey).toHaveBeenCalledTimes(1);
  });

  it("falls back only when the owner has not connected OpenRouter", async () => {
    const readKey = vi.fn(async () => {
      throw Object.assign(new Error("connector_not_connected"), { code: "CONNECTOR_NOT_CONNECTED" });
    });
    await expect(getOptionalUserOpenRouterKey(42, readKey)).resolves.toBeUndefined();
  });

  it.each([
    Object.assign(new Error("connector_database_unavailable"), { code: "DATABASE_UNAVAILABLE" }),
    Object.assign(new Error("connector_secret_unreadable"), { code: "CONNECTOR_SECRET_UNREADABLE" }),
  ])("does not swallow security or infrastructure failures", async error => {
    await expect(getOptionalUserOpenRouterKey(42, async () => { throw error; })).rejects.toBe(error);
  });
});
