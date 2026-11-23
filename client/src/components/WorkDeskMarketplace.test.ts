import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { DSAI_AI_HUB_CATEGORIES } from "@shared/aiHubCatalog";
import { governmentServices } from "@/data/governmentServices";

const component = readFileSync(new URL("./WorkDeskMarketplace.tsx", import.meta.url), "utf8");
const workspace = readFileSync(new URL("../pages/Workspace.tsx", import.meta.url), "utf8");
const workdesk = readFileSync(new URL("./WorkDeskTextPanel.tsx", import.meta.url), "utf8");
const router = readFileSync(new URL("../../../server/routers.ts", import.meta.url), "utf8");

describe("WorkDesk marketplace catalog and integration", () => {
  it("surfaces the complete curated AI catalog and all current government portals", () => {
    expect(DSAI_AI_HUB_CATEGORIES.flatMap(category => category.providers)).toHaveLength(140);
    expect(governmentServices).toHaveLength(19);
    expect(component).toContain("DSAI_AI_HUB_CATEGORIES");
    expect(component).toContain("governmentServices");
  });

  it("provides free-tier filters while distinguishing consumer access from API credits", () => {
    expect(component).toContain("freeOnly");
    expect(component).toContain("Free consumer access ≠ free API credits");
    expect(component).toContain("Free quota not confirmed");
  });

  it("loads marketplace skills into the authenticated WorkDesk task composer", () => {
    expect(component).toContain("onUseSkill(skill.prompt)");
    expect(workspace).toContain("skillPrompt={workdeskSkillPrompt}");
    expect(workdesk).toContain("skillPrompt?.prompt.trim()");
    expect(workdesk).toContain("trpc.workDesk.createTextTask.useMutation");
  });

  it("routes each government portal into the real WorkDesk task composer without claiming government API access", () => {
    expect(component).toContain("onUseGovernmentService(service)");
    expect(workspace).toContain("onUseGovernmentService={(service: GovernmentService)");
    expect(workspace).toContain("buildGovernmentServiceGuidance(service)");
    expect(workspace).toContain("কোনো সরকারি ফর্ম জমা, OTP, পেমেন্ট বা অনুমোদনের কাজ করবেন না");
  });

  it("saves government portal checklists through the existing owner-scoped worklist API", () => {
    expect(component).toContain("onSaveGovernmentService(service)");
    expect(workspace).toContain("accessCreate.mutate");
    expect(workspace).toContain("service.officialUrl");
  });

  it("provides owner-scoped install, test, and disconnect actions for personal connectors", () => {
    expect(component).toContain("trpc.userConnectors.list.useQuery");
    expect(component).toContain("Verify & connect");
    expect(component).toContain("Test connection");
    expect(component).toContain("Disconnect");
    expect(router).toContain("userConnectors: router({");
    expect(router).toContain("connect: protectedProcedure");
    expect(router).toContain("disconnect: protectedProcedure");
  });
});
