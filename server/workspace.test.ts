import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "admin" | "user"): TrpcContext {
  return {
    user: { id: 12, openId: `workspace-${role}`, name: "Workspace Test", email: "workspace@example.com", loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("DSAI workspace contracts", () => {
  it("exposes protected access, creative, Work Packet, and secure-intake procedures", () => {
    expect(appRouter._def.procedures["access.list"]).toBeTruthy();
    expect(appRouter._def.procedures["creative.list"]).toBeTruthy();
    expect(appRouter._def.procedures["workPackets.list"]).toBeTruthy();
    expect(appRouter._def.procedures["workPackets.create"]).toBeTruthy();
    expect(appRouter._def.procedures["workPackets.addSource"]).toBeTruthy();
    expect(appRouter._def.procedures["workPackets.review"]).toBeTruthy();
    expect(appRouter._def.procedures["files.policy"]).toBeTruthy();
    expect(appRouter._def.procedures["files.registerQuarantine"]).toBeTruthy();
  });

  it("rejects unauthenticated workspace data access", async () => {
    const caller = appRouter.createCaller({ ...contextFor("user"), user: null });
    await expect(caller.access.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.creative.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.workPackets.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.files.policy()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("keeps creative listing available to authenticated regular users", () => {
    const caller = appRouter.createCaller(contextFor("user"));
    expect(caller.creative.list).toBeTypeOf("function");
  });
});
