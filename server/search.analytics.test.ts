import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "admin" | "user"): TrpcContext {
  return {
    user: { id: 9, openId: `search-${role}`, name: "Search Test", email: "search@example.com", loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("DSAI search analytics contracts", () => {
  it("exposes public recording and protected aggregate procedures", () => {
    expect(appRouter._def.procedures["search.record"]).toBeTruthy();
    expect(appRouter._def.procedures["admin.searchAnalytics.list"]).toBeTruthy();
  });

  it("blocks regular users from aggregate search trends", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.admin.searchAnalytics.list({ limit: 10 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects short or unsupported search capture input before database writes", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.search.record({ term: "a", source: "homepage" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.search.record({ term: "api key", source: "learn" as "homepage" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
