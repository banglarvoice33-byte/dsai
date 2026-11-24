import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { governmentServices } from "@/data/governmentServices";
const component = readFileSync(new URL("./WorkDeskMarketplace.tsx", import.meta.url), "utf8");
const workspace = readFileSync(new URL("../pages/Workspace.tsx", import.meta.url), "utf8");
const workdesk = readFileSync(new URL("./WorkDeskTextPanel.tsx", import.meta.url), "utf8");
const aiHub = readFileSync(new URL("../pages/AIHub.tsx", import.meta.url), "utf8");
const router = readFileSync(new URL("../../../server/routers.ts", import.meta.url), "utf8");

describe("WorkDesk information architecture and real actions", () => {
  it("keeps AI Hub separate and limits WorkDesk marketplace to government services, skills and connectors", () => {
    expect(governmentServices).toHaveLength(20);
    expect(component).toContain('type MarketplaceTab = "government" | "skills" | "connectors"');
    expect(component).toContain('useState<MarketplaceTab>("government")');
    expect(component).toContain("governmentServices");
    expect(component).not.toContain("#963a28");
    expect(component).not.toContain("#7e3023");
    expect(component).toContain("bg-[#176b4b]");
    expect(component).toContain("onUseSkill(skill.prompt)");
    expect(component).toContain("trpc.userConnectors.list.useQuery");
    expect(component).not.toContain("DSAI_AI_HUB_CATEGORIES");
    expect(component).not.toContain("AI সেবা");
    expect(component).not.toContain("allProviders");
    expect(workspace).not.toContain("workspace-ai-hub-title");
    expect(workspace).toContain('setLocation("/ai-hub")');
    expect(aiHub).toContain("DSAI_AI_HUB_CATEGORIES");
  });
  it("routes skills into the authenticated durable WorkDesk task composer", () => {
    expect(workspace).toContain("skillPrompt={workdeskSkillPrompt}");
    expect(workdesk).toContain("skillPrompt?.prompt.trim()");
    expect(workdesk).toContain("trpc.workDesk.createTextTask.useMutation");
    expect(workdesk).toContain("trpc.workDesk.retryTextTask.useMutation");
    expect(workdesk).toContain("trpc.workDesk.cancelTextTask.useMutation");
    expect(workdesk).toContain("trpc.workDesk.saveTextTaskResult.useMutation");
  });
  it("presents generated content as a DSAI-owned readable answer and tucks provider internals into disclosure", () => {
    expect(workdesk).toContain("DSAI উত্তর");
    expect(workdesk).toContain("প্রযুক্তিগত তথ্য");
    expect(workdesk).toContain("DSAI Free route");
    expect(workdesk).toContain("<Streamdown>{editedResult}</Streamdown>");
    expect(workdesk).toContain("prose prose-base max-w-none");
    expect(workdesk).toContain("sm:prose-lg");
    expect(workdesk).toContain('aria-label="DSAI উত্তর"');
    expect(workdesk).toContain("max-w-7xl space-y-6");
    expect(workdesk).toContain("min-h-72 rounded-2xl border");
    expect(workdesk).not.toContain("max-h-[min(68vh,820px)]");
    expect(workdesk).toContain('isEditingResult ? (');
    expect(workdesk).not.toContain('"Provider: " + activeTask.provider');
  });
  it("routes government services to AI guidance, an owner-scoped worklist and their official portal", () => {
    expect(component).toContain("onUseGovernmentService(service)");
    expect(component).toContain("onSaveGovernmentService(service)");
    expect(workspace).toContain("buildGovernmentServiceGuidance(service)");
    expect(workspace).toContain("assistantComplete.mutate({ messages:");
    expect(workspace).toContain("accessCreate.mutate");
    expect(workspace).toContain("service.officialUrl");
    expect(component).toContain("সরকারি পোর্টাল");
    expect(component).toContain("OTP, password, payment, application submission");
  });
  it("exposes only the Free-policy-approved OpenRouter connector for credential setup", () => {
    expect(component).toContain('const canConnect = row.id === "openrouter"');
    expect(component).toContain("Verify & connect");
    expect(component).toContain("Test connection");
    expect(component).toContain("Disconnect");
    expect(component).toContain("trpc.userConnectors.connect.useMutation");
    expect(router).toContain("userConnectors: router({");
    expect(router).toContain("connect: protectedProcedure");
    expect(router).toContain("disconnect: protectedProcedure");
  });
});
