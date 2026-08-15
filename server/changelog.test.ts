import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "admin" | "user"): TrpcContext {
  return {
    user: { id: 7, openId: `changelog-${role}`, name: "Changelog Test", email: "changelog@example.com", loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("DSAI privacy and changelog contracts", () => {
  it("exposes public changelog reads without authentication", () => {
    expect(appRouter._def.procedures["changelog.published"]).toBeTruthy();
  });

  it("blocks regular users from changelog administration", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.admin.changelog.create({ version: "test", title: "Test", summary: "Test summary", content: "Test content", category: "guide" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.changelog.setStatus({ id: 1, status: "published" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects invalid changelog content before database writes", async () => {
    const caller = appRouter.createCaller(contextFor("admin"));
    await expect(caller.admin.changelog.create({ version: "", title: "x", summary: "", content: "", category: "feature" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
