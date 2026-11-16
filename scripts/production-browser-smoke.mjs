import assert from "node:assert/strict";
import { createRequire } from "node:module";

const runtimeRoot = process.env.RUNNER_TEMP ?? process.env.TMPDIR ?? "/tmp";
const require = createRequire(`${runtimeRoot}/dsai-browser-smoke/package.json`);
const { chromium } = require("playwright");

const baseUrl = new URL(process.env.DSAI_BROWSER_URL ?? "https://dsai-one.vercel.app");
const browserMode = process.env.DSAI_BROWSER_MODE ?? "production";
const localHttp = baseUrl.protocol === "http:" && ["127.0.0.1", "localhost"].includes(baseUrl.hostname);
assert.ok(baseUrl.protocol === "https:" || localHttp, "Browser smoke requires HTTPS except for an explicitly loopback-only local preview");

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

    const publicRoutes = ["/", "/learn", "/developer", "/method", "/platform", "/workspace", "/documents", "/ai-hub", "/scholarship", "/auth/login", "/auth/signup", "/quality-gates", "/creative-studio", "/capabilities", "/plans", "/try-first", "/lead-composer", "/evidence", "/privacy", "/governance", "/changelog"];

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
      assert.ok(
        !/Log in to Vercel|Continue with (?:Email|Google|GitHub|ChatGPT|SAML SSO|Passkey)/i.test(bodyText),
        `${route} was blocked by Vercel Deployment Protection instead of rendering DSAI`,
      );

      if (route === "/ai-hub") {
        const providerLinks = page.locator('a[aria-label^="Visit official website for "]');
        await providerLinks.first().waitFor({ state: "visible", timeout: 10_000 });
        const expectedProviderCount = 125;
        assert.equal(await providerLinks.count(), expectedProviderCount, "Every AI Hub directory entry must have an official website link");
        const unsafeLinks = await providerLinks.evaluateAll(links => links.filter(link => {
          const anchor = link;
          return !anchor.href.startsWith("https://") || anchor.target !== "_blank" || !anchor.rel.includes("noopener") || !anchor.rel.includes("noreferrer");
        }).map(link => link.getAttribute("aria-label")));
        assert.deepEqual(unsafeLinks, [], "Provider links must use HTTPS and safe new-tab attributes");
        await record("AI Hub official provider links", { pass: true, detail: `${expectedProviderCount} HTTPS official-site links; safe new-tab attributes` });
        const providerSearch = page.getByRole("textbox", { name: "Provider search" });
        if (browserMode === "preview" || browserMode === "production") {
          for (const term of ["ChatGPT", "Claude", "Kimi", "DeepSeek", "Meta AI", "Qwen", "Agnes AI", "Genspark", "Manus", "Canva", "Adobe Firefly", "Microsoft Designer", "NotebookLM", "Gamma"]) {
            await providerSearch.fill(term);
            await providerLinks.first().waitFor({ state: "visible", timeout: 10_000 });
            assert.ok(await providerLinks.count() >= 1, `AI Hub search must find newly added provider: ${term}`);
          }
          await record("AI Hub priority provider discovery", { pass: true, detail: "14 newly added provider searches return matching cards" });
        }
        await providerSearch.fill("Cerebras");
        await page.getByRole("heading", { name: /Cerebras/ }).waitFor({ state: "visible", timeout: 10_000 });
        assert.equal(await providerLinks.count(), 1, "Provider search must narrow results to matching providers");
        if (browserMode === "preview") {
          await providerSearch.fill("dsai-no-such-provider-should-exist");
          await page.getByRole("heading", { name: "কোনো AI provider পাওয়া যায়নি" }).waitFor({ state: "visible", timeout: 10_000 });
          await page.getByRole("button", { name: "ফিল্টার মুছুন" }).click();
          assert.equal(await providerLinks.count(), 125, "Clear filters must restore the full provider directory");
        } else {
          await providerSearch.fill("");
        }
        await page.getByRole("combobox", { name: "ক্যাটাগরি নির্বাচন" }).selectOption("vector-knowledge");
        await page.getByRole("heading", { name: /PostgreSQL pgvector/ }).waitFor({ state: "visible", timeout: 10_000 });
        assert.equal(await providerLinks.count(), 10, "Category filter must show the selected category only");
        await record("AI Hub search and category filter", { pass: true, detail: browserMode === "preview" ? "search → no results → reset → vector category" : "search → vector category" });
      }

      if (route === "/auth/login" && browserMode === "production") {
        await page.locator("#auth-email").waitFor({ state: "visible", timeout: 10_000 });
        await page.locator("#auth-password").waitFor({ state: "visible", timeout: 10_000 });
        const submit = page.locator('form button[type="submit"]');
        await submit.waitFor({ state: "visible", timeout: 10_000 });
        await page.locator('[aria-label="Human verification"]').waitFor({ state: "visible", timeout: 10_000 });
      }

      if (viewport.name === "mobile") {
        const overflow = await page.evaluate(() => {
          const offenders = Array.from(document.querySelectorAll("body *")).map(element => {
            const rect = element.getBoundingClientRect();
            return { tag: element.tagName, className: typeof element.className === "string" ? element.className.slice(0, 100) : "", text: (element.textContent || "").trim().slice(0, 100), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
          }).filter(item => item.width > 0 && item.right > window.innerWidth + 2).slice(0, 12);
          return { hasOverflow: document.documentElement.scrollWidth > window.innerWidth + 2, scrollWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth, offenders };
        });
        assert.equal(overflow.hasOverflow, false, `${route} has horizontal overflow on a 390px viewport: ${JSON.stringify(overflow)}`);
      }

      await record(`${viewport.name} ${route}`, { pass: true, detail: `HTTP ${response.status()}` });
    }

    if (viewport.name === "desktop") {
      const discoveryPage = await context.newPage();
      discoveryPage.on("pageerror", error => pageErrors.push(`discovery: ${error.message}`));
      await discoveryPage.goto(new URL("/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
      await discoveryPage.locator("body").waitFor({ state: "visible", timeout: 10_000 });
      console.log("HOME_SEARCH_DIAGNOSTIC", (await discoveryPage.locator("body").innerText()).slice(0, 500));
      const siteSearch = discoveryPage.locator("#dsai-home-search input");
      await siteSearch.waitFor({ state: "visible", timeout: 15_000 });
      await siteSearch.fill("Try First");
      const tryFirstResult = discoveryPage.getByRole("option").filter({ hasText: "Try First" }).first();
      await tryFirstResult.waitFor({ state: "visible", timeout: 10_000 });
      await tryFirstResult.click();
      await discoveryPage.waitForURL("**/try-first", { timeout: 10_000 });
      await record("homepage search discovers and opens Try First", { pass: true, detail: "search → suggestion → /try-first" });

      if (browserMode === "preview") {
        await discoveryPage.goto(new URL("/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
        await discoveryPage.locator("#dsai-home-search input").waitFor({ state: "visible", timeout: 15_000 });
        await discoveryPage.locator("#dsai-home-search input").fill("upload document");
        await discoveryPage.getByRole("option").filter({ hasText: "নথি আপলোড" }).first().click();
        await discoveryPage.waitForURL("**/documents", { timeout: 10_000 });
        await record("homepage search discovers Documents", { pass: true, detail: "search → Documents → /documents" });

        await discoveryPage.goto(new URL("/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
        await discoveryPage.locator("#dsai-home-search input").waitFor({ state: "visible", timeout: 15_000 });
        await discoveryPage.locator("#dsai-home-search input").fill("government service");
        await discoveryPage.getByRole("option").filter({ hasText: "সরকারি সেবা" }).first().click();
        await discoveryPage.waitForURL(url => url.pathname === "/workspace" && url.searchParams.get("panel") === "services", { timeout: 10_000 });
        const workspaceSignIn = discoveryPage.getByRole("button", { name: /প্রবেশ করুন/ });
        await workspaceSignIn.waitFor({ state: "visible", timeout: 10_000 });
        await workspaceSignIn.click();
        await discoveryPage.waitForURL("**/auth/login**", { timeout: 10_000 });
        const returnTo = new URL(discoveryPage.url()).searchParams.get("returnTo");
        assert.equal(returnTo, "/workspace?panel=services", "Login must preserve the requested Workspace panel");
        await record("government service deep link survives login gate", { pass: true, detail: "search → services panel → login returnTo preserved" });
      }
      await discoveryPage.close();

      if (browserMode === "production") {
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
      }

    } else {
      await page.goto(new URL("/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
      const mobileMenu = page.getByRole("button", { name: "Open menu" });
      await mobileMenu.waitFor({ state: "visible", timeout: 10_000 });
      await mobileMenu.click();
      const workspaceLink = page.getByRole("link", { name: "ওয়ার্কস্পেস" });
      await workspaceLink.waitFor({ state: "visible", timeout: 10_000 });
      await workspaceLink.click();
      await page.waitForURL("**/workspace", { timeout: 10_000 });
      await record("mobile navigation opens and reaches Workspace", { pass: true, detail: "390px menu → Workspace route" });
    }

    await context.close();
  }

  assert.deepEqual(pageErrors, [], `Uncaught browser errors: ${pageErrors.join(" | ")}`);
  await record("browser JavaScript runtime", { pass: true, detail: "no uncaught page errors" });
} catch (error) {
  console.error("DSAI_BROWSER_ACCEPTANCE=FAIL");
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
} finally {
  await browser.close();
}

console.log(`DSAI_BROWSER_ACCEPTANCE=${process.exitCode === 1 ? "FAIL" : "PASS"} checks=${results.length}`);
console.log(`MODE=${browserMode} URL=${baseUrl.origin}`);
console.log("SCOPE=real Chromium navigation, responsive smoke, direct discovery, liveness/readiness, unauthenticated API denial (production mode only)");
console.log("LIMITATION=no test credentials supplied; authenticated sign-in, real file bytes, cross-user isolation and delete lifecycle remain separate UAT gates");
