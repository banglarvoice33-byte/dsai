import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { mockDeleteObject, mockMalwareScan } from "@shared/mockSecurity";

describe("DSAI isolated mock security and prototype contracts", () => {
  it("returns deterministic clean, infected, and provider-error verdicts", () => {
    expect(mockMalwareScan({ filename: "report.pdf", mode: "clean", attempt: 1 }).verdict).toBe("clean");
    expect(mockMalwareScan({ filename: "sample.pdf", mode: "infected", attempt: 1 }).message).toContain("simulated threat");
    expect(mockMalwareScan({ filename: "report.pdf", mode: "error", attempt: 2 }).verdict).toBe("error");
  });

  it("simulates deletion without exposing a real storage operation", () => {
    const result = mockDeleteObject({ assetId: 42, attempt: 1 });
    expect(result.provider).toBe("dsai-mock-storage");
    expect(result.deleted).toBe(true);
    expect(result.deletionId).toContain("mock-delete-42");
  });

  it("keeps mock flows explicitly isolated in the UI", () => {
    const securityLab = readFileSync(new URL("../client/src/pages/SecurityLifecycleLab.tsx", import.meta.url), "utf8");
    const approval = readFileSync(new URL("../client/src/pages/IntegrationApprovalPrototype.tsx", import.meta.url), "utf8");
    const compliance = readFileSync(new URL("../client/src/pages/DepartmentCompliance.tsx", import.meta.url), "utf8");
    const profile = readFileSync(new URL("../client/src/pages/ProfileSettings.tsx", import.meta.url), "utf8");
    const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
    expect(securityLab).toContain("Mock API lab");
    expect(securityLab).toContain("no real object storage");
    expect(securityLab).toContain("security-progress");
    expect(securityLab).toContain("toast.success");
    expect(securityLab).toContain("toast.error");
    expect(securityLab).toContain("SCAN HISTORY");
    expect(securityLab).toContain("scanHistory");
    expect(securityLab).toContain("Filter scan status");
    expect(securityLab).toContain("Filter scan date");
    expect(approval).toContain("MOCK OAUTH");
    expect(approval).toContain("Token is simulated in browser state only");
    expect(approval).toContain("syncMockData");
    expect(approval).toContain("RECENT SYNC HISTORY");
    expect(approval).toContain("retrySync");
    expect(approval).toContain("Simulate failure");
    expect(approval).toContain("Automatic retry");
    expect(approval).toContain("integration-sync-alert");
    expect(compliance).toContain("exportCsv");
    expect(compliance).toContain("window.print");
    expect(compliance).toContain("Status multi-select");
    expect(compliance).toContain("Low score threshold");
    expect(compliance).toContain("Advanced evidence search");
    expect(compliance).toContain("FILTERED SUMMARY");
    expect(compliance).toContain("compliance-bar-chart");
    expect(compliance).toContain("Save baseline");
    expect(compliance).toContain("Export image");
    expect(compliance).toContain("dsai-compliance-chart-");
    expect(app).toContain('path="/security-lab"');
    expect(app).toContain("WorkdeskActivityProvider");
    expect(app).toContain("GlobalWorkdeskNotifications");
    const notificationTray = readFileSync(new URL("../client/src/components/GlobalWorkdeskNotifications.tsx", import.meta.url), "utf8");
    const activityContext = readFileSync(new URL("../client/src/contexts/WorkdeskActivityContext.tsx", import.meta.url), "utf8");
    expect(notificationTray).toContain("Mark all as read");
    expect(notificationTray).toContain("Clear notifications");
    expect(notificationTray).toContain("Muted:");
    expect(activityContext).toContain("setNotificationsEnabled");
    expect(activityContext).toContain("toggleModuleMute");
    expect(activityContext).toContain("markAllRead");
    expect(activityContext).toContain("mutedCategories");
    expect(activityContext).toContain("mutedSeverities");
    expect(activityContext).toContain("dsai-workdesk-notification-preferences-v2");
    expect(activityContext).toContain("toggleCategoryMute");
    expect(activityContext).toContain("toggleSeverityMute");
    const muteBadge = readFileSync(new URL("../client/src/components/NotificationMuteBadge.tsx", import.meta.url), "utf8");
    const alphaDashboard = readFileSync(new URL("../client/src/pages/AlphaDashboard.tsx", import.meta.url), "utf8");
    expect(muteBadge).toContain("notifications muted");
    expect(alphaDashboard).toContain("NotificationMuteBadge");
    expect(securityLab).toContain("workdesk-theme-toggle");
    expect(compliance).toContain("workdesk-theme-toggle");
    expect(profile).toContain("profile-activity-card");
  });
});
