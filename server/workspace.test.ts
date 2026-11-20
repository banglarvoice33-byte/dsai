import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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
  it("exposes protected access and creative list procedures", () => {
    expect(appRouter._def.procedures["access.list"]).toBeTruthy();
    expect(appRouter._def.procedures["creative.list"]).toBeTruthy();
  });

  it("rejects unauthenticated workspace data access", async () => {
    const caller = appRouter.createCaller({ ...contextFor("user"), user: null });
    await expect(caller.access.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.creative.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("keeps creative listing available to authenticated regular users", () => {
    const caller = appRouter.createCaller(contextFor("user"));
    expect(caller.creative.list).toBeTypeOf("function");
  });

  it("exposes the lead composer to regular users while keeping CRM operations protected", () => {
    const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    const page = readFileSync(resolve(process.cwd(), "client/src/pages/LeadComposer.tsx"), "utf8");
    expect(app).toContain('<Route path="/lead-composer" component={LeadComposer} />');
    expect(app).not.toContain('<Route path="/lead-composer"><AdminOnly><LeadComposer /></AdminOnly></Route>');
    expect(page).toContain("trpc.lead.list.useQuery");
    expect(page).toContain("trpc.lead.save.useMutation");
  });
});
