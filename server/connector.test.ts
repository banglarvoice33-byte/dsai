import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { testConnector } from "./db";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "admin" | "user"): TrpcContext {
  return {
    user: {
      id: 7,
      openId: `connector-${role}`,
      name: "Connector Test",
      email: "connector@example.com",
      loginMethod: "test",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("runtime connector safety", () => {
  it("reports a safe degraded fallback when provider credentials are absent", async () => {
    const result = await testConnector("twilio");
    expect(result.configured).toBe(false);
    expect(result.status).toBe("degraded");
    expect(result.message).toContain("safe fallback");
  });

  it("allows an admin to run a no-send connector environment test", async () => {
    const caller = appRouter.createCaller(contextFor("admin"));
    const result = await caller.admin.connectors.test({ slug: "twilio" });
    expect(result.slug).toBe("twilio");
    expect(result.message).toBeTruthy();
  });

  it("blocks regular users from connector administration", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.admin.connectors.test({ slug: "twilio" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
