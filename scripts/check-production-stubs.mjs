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
