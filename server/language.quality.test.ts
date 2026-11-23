import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const index = readFileSync(new URL("../client/index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");
const workspace = readFileSync(new URL("../client/src/pages/Workspace.tsx", import.meta.url), "utf8");
const workDeskPanel = readFileSync(new URL("../client/src/components/WorkDeskTextPanel.tsx", import.meta.url), "utf8");

describe("DSAI language quality contracts", () => {
  it("makes the homepage BN/EN toggle change visible navigation and core copy", () => {
    expect(home).toContain("homepageCopy");
    expect(home).toContain("localizedNavItems");
    expect(home).toContain("Switch to English");
    expect(home).toContain("বাংলায় ফিরুন");
    expect(home).toContain("From complex information");
    expect(home).toContain("জটিল তথ্য থেকে");
  });

  it("keeps Bengali as the document language and loads Bengali-capable fonts", () => {
    expect(index).toContain('<html lang="bn">');
    expect(index).toContain("Noto+Sans+Bengali");
    expect(index).toContain("Noto+Serif+Bengali");
    expect(css).toContain("Noto Serif Bengali");
  });

  it("preserves Bengali-first workflow wording and clear user boundaries", () => {
    expect(workDeskPanel).toContain("কী করতে চান?");
    expect(workDeskPanel).toContain("লিখুন, নথি যোগ করুন, কাজ পাঠান");
    expect(workspace).toContain("Work Desk");
    expect(workspace).not.toContain("সৃজনশীল পরিকল্পনা");
  });
});
