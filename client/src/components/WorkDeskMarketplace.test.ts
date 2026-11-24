import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { governmentServices } from "@/data/governmentServices";
const component = readFileSync(new URL("./WorkDeskMarketplace.tsx", import.meta.url), "utf8");
const workspace = readFileSync(new URL("../pages/Workspace.tsx", import.meta.url), "utf8");
const workdesk = readFileSync(new URL("./WorkDeskTextPanel.tsx", import.meta.url), "utf8");
const aiHub = readFileSync(new URL("../pages/AIHub.tsx", import.meta.url), "utf8");
const router = readFileSync(new URL("../../../server/routers.ts", import.meta.url), "utf8");

describe("WorkDesk information architecture and real actions", () => {
  it("keeps Work Desk navigation focused and uses progressive disclosure for separate catalogs", () => {
    expect(workspace).not.toContain('href="/privacy#deletion-request"');
    expect(workspace).toContain('href="/workspace?panel=marketplace"');
    // Government, skills and connectors are distinct catalogs; the component
    // owns one query state rather than rendering three nested search dashboards.
    expect(component).toContain('const [query, setQuery] = useState("")');
    expect(component).toContain('setTab(item.id); setQuery("")');
    expect(component).not.toContain("skillsQuery");
    expect(component).not.toContain("connectorQuery");
  });
  it("keeps AI Hub separate and limits WorkDesk marketplace to government services, skills and connectors", () => {
    expect(governmentServices).toHaveLength(20);
    expect(component).toContain('type MarketplaceTab = "government" | "skills" | "connectors"');
    expect(component).toContain('useState<MarketplaceTab>("government")');
    expect(component).toContain("governmentServices");
    expect(component).not.toContain("#963a28");
    expect(component).not.toContain("#176b4b");
    expect(component).not.toContain("#10563b");
    expect(workspace).not.toContain("#176b4b");
    expect(workspace).toContain("bg-primary");
    expect(component).not.toContain("#7e3023");
    expect(component).toContain("bg-primary");
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
  it("keeps connector setup Bengali-first while retaining the required API credential terminology", () => {
    expect(component).toContain("সেবাদাতার API key");
    expect(component).toContain("যাচাই করে সংযোগ দিন");
    expect(component).toContain("সংযোগ পরীক্ষা");
    expect(component).toContain("সংযোগ বিচ্ছিন্ন");
    expect(component).not.toContain("Verify & connect");
    expect(component).not.toContain("Not connected");
    expect(component).not.toContain("Free-only policy");
    expect(component).not.toContain("AES-256-GCM");
    expect(component).not.toContain("Test Connection");
  });
  it("keeps the public-facing catalog labels and setup guidance Bengali-first", () => {
    expect(component).toContain("উৎপাদন-উপযোগী কোড পর্যালোচনা");
    expect(component).toContain("API সংযোগের নকশা");
    expect(component).toContain("সংযোগ নিরাপদে যুক্ত হয়েছে।");
    expect(component).not.toContain("Verify & connect");
    expect(component).not.toContain("Not connected");
    expect(component).not.toContain("Free-only policy");
  });
  it("exposes only the Free-policy-approved OpenRouter connector for credential setup", () => {
    expect(component).toContain('const canConnect = row.id === "openrouter"');
    expect(component).toContain("যাচাই করে সংযোগ দিন");
    expect(component).toContain("সংযোগ পরীক্ষা");
    expect(component).toContain("সংযোগ বিচ্ছিন্ন");
    expect(component).toContain("trpc.userConnectors.connect.useMutation");
    expect(router).toContain("userConnectors: router({");
    expect(router).toContain("connect: protectedProcedure");
    expect(router).toContain("disconnect: protectedProcedure");
  });
});
