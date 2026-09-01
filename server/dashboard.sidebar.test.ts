import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("DSAI dashboard sidebar contract", () => {
  it("uses the shared sidebar primitive with smooth, accessible collapse controls", () => {
    const layout = read("client/src/components/DashboardLayout.tsx");
    expect(layout).toContain('collapsible="icon"');
    expect(layout).toContain('aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}');
    expect(layout).toContain("aria-expanded={!isCollapsed}");
    expect(layout).toContain("tooltip={item.label}");
    expect(layout).toContain('aria-current={isActive ? "page" : undefined}');
    expect(layout).toContain("duration-200");
    expect(layout).toContain("ease-[cubic-bezier(0.23,1,0.32,1)]");
  });

  it("closes the mobile drawer after navigation and retains keyboard support", () => {
    const layout = read("client/src/components/DashboardLayout.tsx");
    const sidebar = read("client/src/components/ui/sidebar.tsx");
    expect(layout).toContain("if (isMobile) setOpenMobile(false);");
    expect(layout).toContain('aria-label="Open navigation"');
    expect(sidebar).toContain('event.key === SIDEBAR_KEYBOARD_SHORTCUT');
    expect(sidebar).toContain("event.metaKey || event.ctrlKey");
  });

  it("mounts the sidebar around the actual admin dashboard route", () => {
    const app = read("client/src/App.tsx");
    expect(app).toContain("function AdminShell()");
    expect(app).toContain("<DashboardLayout>");
    expect(app).toContain('<Route path="/admin" component={AdminShell} />');
  });

  it("does not expose placeholder page labels in the DSAI navigation", () => {
    const layout = read("client/src/components/DashboardLayout.tsx");
    expect(layout).not.toContain('label: "Page 1"');
    expect(layout).not.toContain('label: "Page 2"');
    expect(layout).toContain('label: "Overview"');
    expect(layout).toContain('label: "Lead composer"');
    expect(layout).toContain('label: "Creative Studio"');
  });
});
