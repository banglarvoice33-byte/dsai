#!/usr/bin/env node
/**
 * High-confidence production stub guard.
 *
 * This intentionally detects explicit unfinished implementation markers and
 * accidental imports of the repository's mock security helpers. It does not
 * claim to prove runtime correctness; browser, provider and storage acceptance
 * tests remain separate release gates.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { extname } from "node:path";

const ROOTS = ["client/src/", "server/", "shared/", "scanner/"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const TEST_FILE = /(?:^|\/)(?:__tests__\/|tests?\/)|\.(?:test|spec)\.[^.]+$/i;
const EXPLICIT_STUB_MARKERS = [
  { name: "TODO/FIXME/XXX/HACK marker", pattern: /\b(?:TODO|FIXME|XXX|HACK)\s*:/i },
  { name: "not-implemented exception", pattern: /\bthrow\s+new\s+Error\s*\(\s*["'`][^"'`]*(?:not implemented|implementation pending|stub)/i },
  { name: "explicit stub sentinel", pattern: /\b(?:IMPLEMENTATION_PENDING|STUB_ONLY|MOCK_PROVIDER_IN_PRODUCTION)\b/ },
  { name: "stub returned as user output", pattern: /\breturn\s+["'`](?:stub|not implemented|implementation pending)["'`]/i },
];

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean)
  .filter(path => ROOTS.some(root => path.startsWith(root)))
  .filter(path => SOURCE_EXTENSIONS.has(extname(path)))
  .filter(path => !TEST_FILE.test(path));

const findings = [];

// Interactive surfaces that previously looked like live agent/provider actions
// must keep an explicit capability boundary. These checks prevent a mock demo
// from silently returning to a production route.
const REQUIRED_CAPABILITY_BOUNDARIES = [
  {
    path: "client/src/pages/AgentDetail.tsx",
    required: [
      [/trpc\.workDesk\.createTextTask\.useMutation/, "real owner-scoped WorkDesk task mutation"],
      [/single-model/i, "single-model execution disclosure"],
      [/does not invoke the listed supporting models or tools/i, "support-model non-execution disclosure"],
    ],
    forbidden: [
      [/window\.setInterval|providerMode:\s*["']mock["']|Local task simulation completed/i, "fake agent task simulation"],
    ],
  },
  {
    path: "client/src/pages/ReadOnlyPilot.tsx",
    required: [
      [/Not connected/, "not-connected state"],
      [/GOOGLE_CLIENT_ID/, "Google OAuth prerequisite"],
      [/HUBSPOT_CLIENT_ID/, "HubSpot OAuth prerequisite"],
      [/no mock connection/i, "no fake connection disclosure"],
    ],
    forbidden: [
      [/Connect mock OAuth|Connected.*mock|window\.setInterval|providerMode:\\s*["']mock["']/, "mock OAuth or fake sync result"],
    ],
  },
  {
    path: "client/src/pages/AdminPlatformControl.tsx",
    required: [
      [/adapter planned/i, "planned adapter disclosure"],
      [/No provider API call is made/i, "no live scaling disclosure"],
    ],
    forbidden: [],
  },
  {
    path: "client/src/pages/AdminPayments.tsx",
    required: [
      [/Live charge: off/i, "payment disabled disclosure"],
      [/This page does not process payments/i, "no payment processing disclosure"],
    ],
    forbidden: [],
  },
  {
    path: "client/src/pages/AgentOperations.tsx",
    required: [
      [/নিজে কোনো model invocation বা multi-agent orchestration করে না/i, "registry-only execution boundary"],
      [/declared roles; not live workers/i, "support-role boundary"],
    ],
    forbidden: [],
  },
];

for (const contract of REQUIRED_CAPABILITY_BOUNDARIES) {
  let source = "";
  try { source = readFileSync(contract.path, "utf8"); }
  catch {
    findings.push({ path: contract.path, line: 1, rule: "required capability surface missing" });
    continue;
  }
  for (const [pattern, description] of contract.required) {
    if (!pattern.test(source)) findings.push({ path: contract.path, line: 1, rule: `missing capability boundary: ${description}` });
  }
  for (const [pattern, description] of contract.forbidden) {
    const match = pattern.exec(source);
    if (match) findings.push({ path: contract.path, line: source.slice(0, match.index).split("\n").length, rule: `forbidden production simulation: ${description}` });
  }
}
for (const path of tracked) {
  const source = readFileSync(path, "utf8");
  for (const marker of EXPLICIT_STUB_MARKERS) {
    marker.pattern.lastIndex = 0;
    const match = marker.pattern.exec(source);
    if (match) {
      const line = source.slice(0, match.index).split("\n").length;
      findings.push({ path, line, rule: marker.name, excerpt: source.split("\n")[line - 1]?.trim().slice(0, 180) });
    }
  }

  // Mock security helpers must stay test-only. A future production import is
  // a release blocker because simulated malware verdicts/deletions are unsafe.
  if (path !== "shared/mockSecurity.ts" && /(?:from|import)\s*["'][^"']*shared\/mockSecurity(?:\.ts)?["']|\bmock(?:MalwareScan|DeleteObject)\s*\(/.test(source)) {
    const match = /(?:from|import)\s*["'][^"']*shared\/mockSecurity(?:\.ts)?["']|\bmock(?:MalwareScan|DeleteObject)\s*\(/.exec(source);
    findings.push({ path, line: source.slice(0, match.index).split("\n").length, rule: "mock security helper referenced by production code", excerpt: source.split("\n")[source.slice(0, match.index).split("\n").length - 1]?.trim().slice(0, 180) });
  }
}

if (findings.length) {
  console.error("PRODUCTION_STUB_AUDIT=FAIL");
  for (const finding of findings) console.error(`-${finding.path}:${finding.line} [${finding.rule}] ${finding.excerpt ?? ""}`);
  process.exitCode = 1;
} else {
  console.log(`PRODUCTION_STUB_AUDIT=PASS scanned=${tracked.length} scope=tracked-production-source`);
  console.log("LIMITATION=static-marker-guard-only; not proof of feature completeness or runtime acceptance");
}
