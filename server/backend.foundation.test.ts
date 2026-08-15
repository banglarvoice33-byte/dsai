import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const server = readFileSync(new URL("./_core/index.ts", import.meta.url), "utf8");
const deploy = readFileSync(new URL("../deploy-genesis.sh", import.meta.url), "utf8");
const plan = readFileSync(new URL("../docs/DSAI_BACKEND_MODERNIZATION_PLAN_2026-08-16.md", import.meta.url), "utf8");

describe("DSAI backend operational foundations", () => {
  it("exposes machine-readable liveness and readiness endpoints", () => {
    expect(server).toContain('app.get("/healthz"');
    expect(server).toContain('app.get("/readyz"');
    expect(server).toContain('res.status(ready ? 200 : 503)');
    expect(deploy).toContain('HEALTH_PATH="${DSAI_HEALTH_PATH:-/healthz}"');
  });

  it("sets defensive response headers and bounds request bodies", () => {
    expect(server).toContain('X-Content-Type-Options');
    expect(server).toContain('Referrer-Policy');
    expect(server).toContain('Permissions-Policy');
    expect(server).toContain('Cross-Origin-Opener-Policy');
    expect(server).toContain('Cross-Origin-Resource-Policy');
    expect(server).toContain('Strict-Transport-Security');
    expect(server).toContain('express.json({ limit: "1mb" })');
    expect(server).toContain('express.urlencoded({ limit: "1mb"');
  });

  it("correlates requests without logging sensitive bodies or query content", () => {
    expect(server).toContain("X-Request-ID");
    expect(server).toContain("http.request.completed");
    expect(server).toContain("req.path");
    expect(server).not.toContain("req.body");
    expect(server).not.toContain("req.query");
  });

  it("documents staged gates instead of claiming provider-backed services are live", () => {
    expect(plan).toContain("Idempotency table");
    expect(plan).toContain("Signed webhook endpoint");
    expect(plan).toContain("does not claim live OCR");
    expect(plan).toContain("modular monolith");
  });
});
