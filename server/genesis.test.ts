import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context = (user: TrpcContext["user"] = null): TrpcContext => ({
  user,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
});

describe("GENESIS backend contract", () => {
  it("exposes the launch and product routers", () => {
    expect(appRouter._def.procedures).toHaveProperty("waitlist.join");
    expect(appRouter._def.procedures).toHaveProperty("access.create");
    expect(appRouter._def.procedures).toHaveProperty("access.list");
    expect(appRouter._def.procedures).toHaveProperty("creative.request");
  });

  it("rejects malformed waitlist emails before persistence", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.waitlist.join({ email: "not-an-email", interest: "both", language: "bn" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("protects UAA case creation behind authentication", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.access.create({ title: "Passport renewal", workflow: "government", language: "bn", riskLevel: "high" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
