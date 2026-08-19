import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");
const home = readFileSync(resolve(root, "client/src/pages/Home.tsx"), "utf8");
const governance = readFileSync(resolve(root, "client/src/pages/Governance.tsx"), "utf8");
const composition = readFileSync(resolve(root, "client/src/hooks/useComposition.ts"), "utf8");

 describe("public authority and input contracts", () => {
  it("exposes the public governance route and substantive authority sections", () => {
    expect(app).toContain('path="/governance" component={Governance}');
    expect(governance).toContain("Code ও system architecture authority");
    expect(governance).toContain("Open-source ও third-party license");
    expect(governance).toContain("billion-dollar valuation claim");
  });

  it("keeps keyboard discovery deterministic and IME-safe", () => {
    expect(home).toContain("event.metaKey || event.ctrlKey");
    expect(home).toContain("event.isComposing");
    expect(home).toContain("aria-activedescendant");
    expect(home).toContain("সম্ভাব্য পথ:");
    expect(composition).toContain("c.current");
  });
});
