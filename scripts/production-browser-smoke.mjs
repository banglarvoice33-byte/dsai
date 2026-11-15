import assert from "node:assert/strict";
import { createRequire } from "node:module";

const runtimeRoot = process.env.RUNNER_TEMP ?? process.env.TMPDIR ?? "/tmp";
const require = createRequire(`${runtimeRoot}/dsai-browser-smoke/package.json`);
const { chromium } = require("playwright");

const baseUrl = new URL(process.env.DSAI_PRODUCTION_URL ?? "https://dsai-one.vercel.app");
assert.equal(baseUrl.protocol, "https:", "Production browser smoke requires HTTPS");

const browser = await chromium.launch({ headless: true });
const results = [];
const pageErrors = [];

async function record(label, outcome) {
  results.push({ label, ...outcome });
  console.log(`${outcome.pass ? "PASS" : "FAIL"} ${label}${outcome.detail ? ` — ${outcome.detail}` : ""}`);
}

try {
  for (const viewport of [
    { name: "desktop", width: 1365, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.on("pageerror", error => pageErrors.push(`${viewport.name}: ${error.message}`));

    const publicRoutes = ["/", "/learn", "/developer", "/method", "/platform", "/workspace", "/documents", "/scholarship", "/auth/login", "/auth/signup", "/quality-gates", "/creative-studio", "/capabilities", "/plans", "/try-first", "/lead-composer", "/evidence", "/privacy", "/governance", "/changelog"];

    for (const route of publicRoutes) {
      const response = await page.goto(new URL(route, baseUrl).toString(), {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      assert.ok(response, `${route} returned no document response`);
      assert.ok(response.status() < 400, `${route} returned HTTP ${response.status()}`);
      await page.locator("body").waitFor({ state: "visible", timeout: 15_000 });
      await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => undefined);
      const bodyText = (await page.locator("body").innerText()).trim();
      assert.ok(bodyText.length >= 30, `${route} rendered an unexpectedly empty page`);

      if (route === "/auth/login") {
        await page.locator("#auth-email").waitFor({ state: "visible", timeout: 10_000 });
        await page.locator("#auth-password").waitFor({ state: "visible", timeout: 10_000 });
        const submit = page.locator('form button[type="submit"]');
        await submit.waitFor({ state: "visible", timeout: 10_000 });
        await page.locator('[aria-label="Human verification"]').waitFor({ state: "visible", timeout: 10_000 });
      }

      if (viewport.name === "mobile") {
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
        assert.equal(overflow, false, `${route} has horizontal overflow on a 390px viewport`);
      }

      await record(`${viewport.name} ${route}`, { pass: true, detail: `HTTP ${response.status()}` });
    }

    if (viewport.name === "desktop") {
      await page.goto(new URL("/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
      const siteSearch = page.getByRole("combobox", { name: "DSAI content search" });
      await siteSearch.fill("Try First");
      const tryFirstResult = page.getByRole("option").filter({ hasText: "Try First" }).first();
      await tryFirstResult.waitFor({ state: "visible", timeout: 10_000 });
      await tryFirstResult.click();
      await page.waitForURL("**/try-first", { timeout: 10_000 });
      await record("homepage search discovers and opens Try First", { pass: true, detail: "search → suggestion → /try-first" });
      const health = await context.request.get(new URL("/healthz", baseUrl).toString());
      assert.equal(health.status(), 200, "/healthz must return HTTP 200");
      const healthBody = await health.json();
      assert.equal(healthBody.status, "ok", "/healthz must report status=ok");
      await record("production liveness", { pass: true, detail: "GET /healthz → 200" });

      const ready = await context.request.get(new URL("/readyz", baseUrl).toString());
      assert.equal(ready.status(), 200, "/readyz must return HTTP 200");
      const readyBody = await ready.json();
      assert.equal(readyBody.status, "ready", "/readyz must report status=ready");
      await record("production database readiness", { pass: true, detail: "GET /readyz → 200 ready" });

      const unauthenticatedChecks = await page.evaluate(async () => {
        const json = { "content-type": "application/json" };
        const calls = [
          ["upload-init", "/api/files/upload/init", {
            method: "POST",
            headers: json,
            body: JSON.stringify({
              originalName: "dsai-browser-smoke.txt",
              mimeType: "text/plain",
              byteSize: 1,
              sha256: "0".repeat(64),
            }),
          }],
          ["finalize", "/api/files/1/finalize", { method: "POST", headers: json, body: "{}" }],
          ["download", "/api/files/1/download", { method: "GET" }],
          ["delete", "/api/files/1", { method: "DELETE" }],
        ];
        const outcomes = [];
        for (const [name, path, init] of calls) {
          const response = await fetch(path, { ...init, credentials: "include" });
          outcomes.push({ name, status: response.status, body: (await response.text()).slice(0, 240) });
        }
        return outcomes;
      });

      for (const outcome of unauthenticatedChecks) {
        assert.equal(outcome.status, 401, `Unauthenticated ${outcome.name} must be rejected with 401; got ${outcome.status}`);
        await record(`private file API rejects unauthenticated ${outcome.name}`, { pass: true, detail: "HTTP 401" });
      }
    } else {
      await page.goto(new URL("/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
      const mobileMenu = page.getByRole("button", { name: "Open menu" });
      await mobileMenu.waitFor({ state: "visible", timeout: 10_000 });
      await mobileMenu.click();
      await page.getByRole("link", { name: "ওয়ার্কস্পেস" }).waitFor({ state: "visible", timeout: 10_000 });
      const closeMenu = page.getByRole("button", { name: "Close menu" });
      await closeMenu.waitFor({ state: "visible", timeout: 5_000 });
      await closeMenu.click();
      await page.getByRole("link", { name: "ওয়ার্কস্পেস" }).waitFor({ state: "hidden", timeout: 5_000 });
      await record("mobile navigation opens and closes accessibly", { pass: true, detail: "390px menu expanded state and close action" });
    }

    await context.close();
  }

  assert.deepEqual(pageErrors, [], `Uncaught browser errors: ${pageErrors.join(" | ")}`);
  await record("browser JavaScript runtime", { pass: true, detail: "no uncaught page errors" });
} catch (error) {
  console.error("PRODUCTION_BROWSER_ACCEPTANCE=FAIL");
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
} finally {
  await browser.close();
}

console.log(`PRODUCTION_BROWSER_ACCEPTANCE=${process.exitCode === 1 ? "FAIL" : "PASS"} checks=${results.length}`);
console.log("SCOPE=real Chromium navigation, responsive smoke, liveness/readiness, unauthenticated API denial");
console.log("LIMITATION=no test credentials supplied; authenticated sign-in, real file bytes, cross-user isolation and delete lifecycle remain separate UAT gates");
