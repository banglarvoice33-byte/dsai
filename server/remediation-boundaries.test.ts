import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

function readProjectFile(relativePath: string) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

describe("DSAI remediation boundaries", () => {
  it("lazy-loads the Excel library only when export is requested", () => {
    const source = readProjectFile("client/src/pages/LeadComposer.tsx");
    expect(source).toContain('await import("xlsx")');
    expect(source).not.toContain('import * as XLSX from "xlsx"');
  });

  it("keeps stable vendor chunking in the production build contract", () => {
    const source = readProjectFile("vite.config.ts");
    expect(source).toContain("manualChunks");
    expect(source).toContain('react: ["react", "react-dom"]');
    expect(source).toContain('trpc: ["@trpc/client", "@trpc/react-query", "@tanstack/react-query", "superjson"]');
  });

  it("documents the external VPS environment and remote gate boundaries", () => {
    const runbook = readProjectFile("docs/DSAI_REMEDIATION_AND_REMOTE_GATE_RUNBOOK_BN.md");
    expect(runbook).toContain("/etc/dsai/dsai.env");
    expect(runbook).toContain("Public promotion-এর আগে বাধ্যতামূলক stop conditions");
    expect(runbook).toContain("Provider activation order");
  });

  it("keeps remote gate probes aligned with runtime port discovery and GET semantics", () => {
    const report = readProjectFile("scripts/remote-production-gate-report.sh");
    expect(report).toContain('"$HOME/dsai/current/.dsai-runtime/port"');
    expect(report).toContain('curl -fsS --max-time 15 -o /dev/null "https://${DOMAIN}/auth/login"');
    expect(report).not.toContain("curl -fsSIL");
  });
});
