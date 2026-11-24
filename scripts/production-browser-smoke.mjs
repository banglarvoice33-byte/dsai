import assert from "node:assert/strict";
import { createRequire } from "node:module";

const runtimeRoot = process.env.RUNNER_TEMP ?? process.env.TMPDIR ?? "/tmp";
const require = createRequire(`${runtimeRoot}/dsai-browser-smoke/package.json`);
const playwright = (() => {
  try { return require("playwright"); }
  catch { return require("playwright-core"); }
})();
const { chromium, devices } = playwright;
const { AxeBuilder } = require("@axe-core/playwright");
let launchOptions = { headless: true };
try {
  const bundledChromium = require("@sparticuz/chromium");
  launchOptions = {
    headless: bundledChromium.headless,
    args: bundledChromium.args,
    executablePath: await bundledChromium.executablePath(),
  };
} catch {
  // GitHub Actions installs the standard Playwright browser separately.
}

const baseUrl = new URL(process.env.DSAI_BROWSER_URL ?? "https://dsai-one.vercel.app");
const browserMode = process.env.DSAI_BROWSER_MODE ?? "production";
const localHttp = baseUrl.protocol === "http:" && ["127.0.0.1", "localhost"].includes(baseUrl.hostname);
assert.ok(baseUrl.protocol === "https:" || localHttp, "Browser smoke requires HTTPS except for an explicitly loopback-only local preview");

let browser;
const results = [];
const pageErrors = [];

async function record(label, outcome) {
  results.push({ label, ...outcome });
  console.log(`${outcome.pass ? "PASS" : "FAIL"} ${label}${outcome.detail ? ` — ${outcome.detail}` : ""}`);
}

try {
  // Use one Pixel 7 Android Chrome context and resize it for desktop, 320px and Pixel 7 passes.
  // A single context avoids Chromium process exits in constrained build containers.
  browser = await chromium.launch(launchOptions);
  const pixel7 = devices["Pixel 7"];
  const context = await browser.newContext({
    ...pixel7,
    viewport: { width: 1365, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.on("pageerror", error => pageErrors.push(error.message));
  for (const viewport of [
    { name: "desktop", size: { width: 1365, height: 900 } },
    { name: "mobile-320", size: { width: 320, height: 740 } },
    { name: "android-chrome-pixel-7", size: pixel7.viewport },
  ]) {
    await page.setViewportSize(viewport.size);

    const publicRoutes = ["/", "/learn", "/developer", "/method", "/platform", "/workspace", "/workspace?panel=files", "/documents", "/ai-hub", "/scholarship", "/auth/login", "/auth/signup", "/quality-gates", "/creative-studio", "/capabilities", "/plans", "/try-first", "/lead-composer", "/confirm/invalid", "/evidence", "/privacy", "/governance", "/changelog", "/terms", "/about", "/contact"];

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
      const routePath = new URL(route, baseUrl).pathname.replace(/\/+$/, "") || "/";
      const privatePrefixes = ["/workspace", "/documents", "/auth", "/quality-gates", "/integration-pilot", "/traces", "/agents", "/admin", "/confirm"];
      const isPrivateRoute = privatePrefixes.some(prefix => routePath === prefix || routePath.startsWith(`${prefix}/`));
      const seoState = await page.evaluate(() => ({
        robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null,
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
        ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute("content") ?? null,
      }));
      assert.equal(seoState.robots, isPrivateRoute ? "noindex,nofollow" : "index,follow", `${route} has the correct robots policy`);
      if (isPrivateRoute) {
        assert.equal(seoState.canonical, null, `${route} must not publish a canonical URL`);
        assert.equal(seoState.ogUrl, null, `${route} must not publish a public Open Graph URL`);
      } else {
        const expectedCanonical = `https://dsai-hub.vercel.app${routePath === "/" ? "/" : routePath}`;
        assert.equal(seoState.canonical, expectedCanonical, `${route} has the correct canonical URL`);
        assert.equal(seoState.ogUrl, expectedCanonical, `${route} has the correct Open Graph URL`);
      }
      if (route === "/") {
        const websiteSchema = await page.locator("#dsai-website-schema").textContent();
        assert.match(websiteSchema ?? "", /"@type":"WebSite"/);
        assert.match(websiteSchema ?? "", /"name":"DSAI"/);
      }
      if (route === "/about") {
        assert.match(bodyText, /DSAI কী করতে সাহায্য করে/);
        assert.match(bodyText, /React 19/);
        assert.match(bodyText, /Wouter/);
        assert.match(await page.title(), /DSAI সম্পর্কে/);
        await record("About page factual content and metadata", { pass: true, detail: "Source-verified product and stack statements" });
      }
      if (route === "/contact") {
        assert.match(bodyText, /যোগাযোগের মাধ্যম আসছে/);
        assert.match(bodyText, /কোনো ইমেইল, ফোন নম্বর বা যোগাযোগ ফর্ম/);
        assert.equal(await page.locator("form").count(), 0, "Contact must not render a form without a verified backend mutation");
        assert.match(await page.title(), /যোগাযোগ/);
        await record("Contact page honest no-channel state", { pass: true, detail: "No fabricated channel and no non-functional form" });
      }
      if (route === "/terms") {
        assert.match(bodyText, /ব্যবহারের শর্তাবলি/);
        assert.match(await page.title(), /ব্যবহারের শর্তাবলি/);
        assert.equal(await page.locator("#dsai-website-schema").count(), 0, "WebSite site-name schema should be emitted on Home only");
      }
      const publicMetadata = await page.locator("head").evaluate((head) => {
        const metaContent = Array.from(head.querySelectorAll("meta")).map((meta) => meta.getAttribute("content") ?? "");
        const structuredData = Array.from(head.querySelectorAll('script[type="application/ld+json"]')).map((script) => script.textContent ?? "");
        return [...metaContent, ...structuredData].join("\\n");
      });
      assert.doesNotMatch(
        publicMetadata,
        /supabase|cloudflare\\s+r2|vercel\\s+serverless|openrouter|clamav|provider or account configuration|backend architecture|database schema|connector registry/i,
        "public metadata must not disclose internal implementation details",
      );
      assert.ok(bodyText.length >= 30, `${route} rendered an unexpectedly empty page`);
      assert.ok(
        !/Log in to Vercel|Continue with (?:Email|Google|GitHub|ChatGPT|SAML SSO|Passkey)/i.test(bodyText),
        `${route} was blocked by Vercel Deployment Protection instead of rendering DSAI`,
      );

      assert.ok(!/(API integration status|API key|CAPABILITY LEDGER|provider gate|connector registry|database schema|system architecture|backend architecture|Supabase Auth|Supabase Storage|Cloudflare R2|Vercel serverless|OpenRouter key|ClamAV|MALWARE_SCANNER|AI_FREE_ONLY_MODE|self-hosted|\bSDK\b|\bframework\b|\bRLS\b|HOME_SEARCH_DIAGNOSTIC|UNIVERSAL ACCESS AGENT|\bUAA\b|Workdesk|Work Packet|Student Pro|CRM Workdesk|server-saved|admin review|manual review|human review|global_user_limit|users_today|provider_daily_limit|provider_minute_limit|Guest session|account ID|model retirement|free model|\bKYC\b|\bKYB\b|\bOAuth\b|webhook|staging gate)/i.test(bodyText), `${route} exposed internal implementation details in public UI`);
      if (route === "/plans") {
        assert.ok(!(/\bPro\b|Enterprise|subscription|billing|payment gateway|checkout/i.test(bodyText)), "Plans page exposed unavailable paid tiers or billing internals");
        assert.match(bodyText, /বিনামূল্যে/);
      }
      if (route === "/scholarship") {
        assert.ok(!(/Pro access|Student Pro|admin review|manual review|daily usage limit|monthly usage|২০\/দিন|৩০০\/মাস|100 approved seat/i.test(bodyText)), "Student support page exposed internal quota or review details");
      }
      if (route === "/try-first") {
        assert.ok(!(/local preview|providerMode|rate-limit|per 10 minutes|5 requests|remaining requests|guest session/i.test(bodyText)), "Free sample page exposed internal rate-limit details");
      }
      if (route === "/privacy") {
        assert.ok(!(/Supabase|Cloudflare|Vercel|OpenRouter|ClamAV|RLS|database schema|API key|fingerprint|risk level|guest session/i.test(bodyText)), "Privacy page exposed backend implementation details");
      }
      if (route === "/creative-studio") {
        assert.ok(
          !/(OpenRouter|Recraft|Cloudflare|Agnes|২৮ নভেম্বর|global_user_limit|users_today|provider_daily_limit|provider_minute_limit|Guest session|account ID|paid alternative|free model|model retirement)/i.test(bodyText),
          "Creative Studio exposed provider, model, global quota or internal fallback details",
        );
        await record("Creative Studio public copy privacy", { pass: true, detail: "No provider names, model retirement, global quotas or internal fallback details" });
      }

      if (route === "/ai-hub") {
        const providerLinks = page.locator('a[aria-label$="খুলুন (নতুন ট্যাবে)"]');
        assert.ok(bodyText.includes("বাহ্যিক সেবা") || bodyText.includes("নিজস্ব OpenRouter API") || bodyText.includes("নিজস্ব Gemini API"), "AI Hub must clearly distinguish own-key integrations from external services");
        await providerLinks.first().waitFor({ state: "visible", timeout: 10_000 });
        const expectedProviderCount = 140;
        const providerCards = page.locator('section[aria-label="এআই সেবার তালিকা"] article');
        const providerCardCount = await providerCards.count();
        const providerLinkCount = await providerLinks.count();
        if (providerCardCount !== expectedProviderCount || providerLinkCount !== expectedProviderCount) {
          const diagnostic = await providerCards.evaluateAll(cards => cards.map(card => ({
            name: card.querySelector("h3")?.textContent?.trim() || "unknown",
            hasOfficialLink: Boolean(card.querySelector('a[aria-label$="খুলুন (নতুন ট্যাবে)"]')),
          })));
          console.log("AI_HUB_PRODUCTION_DIAGNOSTIC=" + JSON.stringify({
            providerCardCount,
            providerLinkCount,
            cardsWithoutOfficialLink: diagnostic.filter(item => !item.hasOfficialLink),
            visibleProviderNames: diagnostic.map(item => item.name),
          }));
        }
        assert.equal(providerCardCount, expectedProviderCount, "AI Hub must render all 140 provider cards");
        assert.equal(providerLinkCount, expectedProviderCount, "Every AI Hub directory entry must have an official website link");
        const unsafeLinks = await providerLinks.evaluateAll(links => links.filter(link => {
          const anchor = link;
          return !anchor.href.startsWith("https://") || anchor.target !== "_blank" || !anchor.rel.includes("noopener") || !anchor.rel.includes("noreferrer");
        }).map(link => link.getAttribute("aria-label")));
        assert.deepEqual(unsafeLinks, [], "Provider links must use HTTPS and safe new-tab attributes");
        await record("AI Hub official provider links", { pass: true, detail: `${expectedProviderCount} HTTPS official-site links; safe new-tab attributes` });
        const providerSearch = page.getByRole("textbox", { name: "এআই সেবা খুঁজুন" });
        if (browserMode === "preview" || browserMode === "production") {
          const discoveryTerms = ["ChatGPT", "Claude", "Kimi", "DeepSeek", "Meta AI", "Qwen", "Agnes AI", "Genspark", "Manus", "Canva", "Adobe Firefly", "Microsoft Designer", "NotebookLM", "Gamma", "Fish Audio", "Google Cloud Text-to-Speech", "Suno", "Udio", "MusicGen", "Google Vids", "Wan 2.2", "Bolt.new", "Lovable", "Replit", "v0", "Netlify", "Cloudflare Pages", "Mureka", "Felo", "Doubao"];
          for (const term of discoveryTerms) {
            await providerSearch.fill(term);
            await providerLinks.first().waitFor({ state: "visible", timeout: 10_000 });
            assert.ok(await providerLinks.count() >= 1, `AI Hub search must find newly added provider: ${term}`);
          }
          await record("AI Hub priority provider discovery", { pass: true, detail: `${discoveryTerms.length} provider searches return matching cards` });
        }
        await providerSearch.fill("Cerebras");
        await page.getByRole("heading", { name: /Cerebras/ }).waitFor({ state: "visible", timeout: 10_000 });
        assert.equal(await providerLinks.count(), 1, "Provider search must narrow results to matching providers");
        if (browserMode === "preview") {
          await providerSearch.fill("dsai-no-such-provider-should-exist");
          await page.getByRole("heading", { name: "কোনো সেবা পাওয়া যায়নি" }).waitFor({ state: "visible", timeout: 10_000 });
          await page.getByRole("button", { name: "আবার খুঁজুন" }).click();
          assert.equal(await providerLinks.count(), expectedProviderCount, "Clear filters must restore the full provider directory");
        } else {
          await providerSearch.fill("");
        }
        await page.getByRole("combobox", { name: "ক্যাটাগরি নির্বাচন" }).selectOption("vector-knowledge");
        await page.getByRole("heading", { name: /PostgreSQL pgvector/ }).waitFor({ state: "visible", timeout: 10_000 });
        assert.equal(await providerLinks.count(), 10, "Category filter must show the selected category only");
        await record("AI Hub search and category filter", { pass: true, detail: browserMode === "preview" ? "search → no results → reset → vector category" : "search → vector category" });
      }

      if (route === "/auth/login") {
        await page.locator("#auth-email").waitFor({ state: "visible", timeout: 10_000 });
        await page.locator("#auth-password").waitFor({ state: "visible", timeout: 10_000 });
        const submit = page.locator('form button[type="submit"]');
        await submit.waitFor({ state: "visible", timeout: 10_000 });
        if (browserMode === "production") {
          await page.locator('[aria-label="Human verification"]').waitFor({ state: "visible", timeout: 10_000 });
        }
      }
      if (route === "/auth/signup") {
        await page.getByRole("heading", { name: "নতুন অ্যাকাউন্ট তৈরি" }).waitFor({ state: "visible", timeout: 10_000 });
        await page.locator("#auth-email").waitFor({ state: "visible", timeout: 10_000 });
        await page.locator("#auth-password").waitFor({ state: "visible", timeout: 10_000 });
        await page.locator('input[type="checkbox"]').first().waitFor({ state: "visible", timeout: 10_000 });
        await page.getByRole("button", { name: "অ্যাকাউন্ট তৈরি করুন" }).waitFor({ state: "visible", timeout: 10_000 });
        assert.ok(bodyText.includes("ব্যবহারের শর্তাবলি"), "Signup consent must link the Terms page");
        await record("signup form and consent are visible", { pass: true, detail: viewport.name });
      }

      if (viewport.name !== "desktop") {
        const overflow = await page.evaluate(() => {
          const offenders = Array.from(document.querySelectorAll("body *")).map(element => {
            const rect = element.getBoundingClientRect();
            return { tag: element.tagName, className: typeof element.className === "string" ? element.className.slice(0, 100) : "", text: (element.textContent || "").trim().slice(0, 100), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
          }).filter(item => item.width > 0 && item.right > window.innerWidth + 2).slice(0, 12);
          return { hasOverflow: document.documentElement.scrollWidth > window.innerWidth + 2, scrollWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth, offenders };
        });
        assert.equal(overflow.hasOverflow, false, `${route} has horizontal overflow on ${viewport.name}: ${JSON.stringify(overflow)}`);
      }

      if (route === "/lead-composer") {
        for (const label of ["দেশ বা ভাষা খুঁজুন", "লক্ষ্য ভাষা", "গ্রাহক বা লক্ষ্যগোষ্ঠী", "ব্যবসার ধরন", "ব্যবসার বর্তমান অবস্থা", "যোগাযোগের উদ্দেশ্য", "বার্তার ধরন", "বার্তা তৈরির ধরন"]) {
          assert.ok(bodyText.includes(label), `Lead Composer is missing a user-facing option: ${label}`);
        }
        await page.keyboard.press("Tab");
        const focusedTag = await page.evaluate(() => document.activeElement?.tagName ?? "");
        assert.notEqual(focusedTag, "BODY", "Lead Composer must support keyboard focus");
        await record("Lead Composer option coverage and keyboard entry", { pass: true, detail: "Eight core choices are visible; keyboard focus enters the form" });
      }

      if (["/lead-composer", "/workspace?panel=files", "/confirm/invalid", "/about", "/contact"].includes(route)) {
        const axeResults = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        const violations = axeResults.violations.map(item => ({
          id: item.id,
          impact: item.impact,
          description: item.description,
          nodes: item.nodes.slice(0, 5).map(node => ({ target: node.target, summary: node.failureSummary })),
        }));
        assert.deepEqual(violations, [], `axe WCAG 2.1 A/AA violations on ${route}: ${JSON.stringify(violations)}`);
        await record(`axe WCAG 2.1 A/AA ${route}`, { pass: true, detail: `${axeResults.passes.length} rules passed; 0 violations` });
      }

      await record(`${viewport.name} ${route}`, { pass: true, detail: `HTTP ${response.status()}` });
    }

    if (viewport.name === "desktop") {
      const robotsResponse = await context.request.get(new URL("/robots.txt", baseUrl).toString());
      assert.equal(robotsResponse.status(), 200, "robots.txt must be publicly accessible");
      assert.match(await robotsResponse.text(), /Sitemap: https:\/\/dsai-hub\.vercel\.app\/sitemap\.xml/);
      const sitemapResponse = await context.request.get(new URL("/sitemap.xml", baseUrl).toString());
      assert.equal(sitemapResponse.status(), 200, "sitemap.xml must be publicly accessible");
      assert.match(await sitemapResponse.text(), /https:\/\/dsai-hub\.vercel\.app\/terms/);
      await record("robots and sitemap", { pass: true, detail: "HTTP 200; canonical production sitemap and Terms URL present" });

      const discoveryPage = await context.newPage();
      discoveryPage.on("pageerror", error => pageErrors.push(`discovery: ${error.message}`));
      await discoveryPage.goto(new URL("/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
      await discoveryPage.locator("body").waitFor({ state: "visible", timeout: 10_000 });
      const siteSearch = discoveryPage.locator("#dsai-home-search input");
      await siteSearch.waitFor({ state: "visible", timeout: 15_000 });
      const helpTrigger = discoveryPage.getByRole("button", { name: "সহায়তা খুলুন" });
      await helpTrigger.click();
      const helpDialog = discoveryPage.locator("#dsai-knowledge-help");
      await helpDialog.waitFor({ state: "visible", timeout: 10_000 });
      const helpText = await helpDialog.innerText();
      assert.ok(!/(API integration|provider|backend|Supabase|Cloudflare|Vercel|OpenRouter|ClamAV|CRM|webhook|staging|Workdesk|UAA|Student Pro|global_user_limit|server-saved)/i.test(helpText), "Help widget exposed internal service details");
      await helpDialog.locator("input").fill("ফাইল আপলোড");
      await helpDialog.getByRole("button").filter({ hasText: "ফাইল আপলোড করলে কী হবে?" }).click();
      const fileHelpText = await helpDialog.innerText();
      assert.match(fileHelpText, /নিরাপত্তা যাচাই/);
      assert.ok(!/(scanner|ClamAV|Supabase|Cloudflare|provider|backend)/i.test(fileHelpText), "File help exposed internal scanning details");
      await helpDialog.getByRole("button", { name: "সহায়তা বন্ধ করুন" }).click();
      await record("help widget public copy privacy", { pass: true, detail: "Help and file guidance contain no backend or scanner details" });

      const diagnosticNodes = await discoveryPage.locator("body").evaluate(body =>
        Array.from(body.querySelectorAll("*"))
          .filter(element => element.children.length === 0 && (element.textContent ?? "").includes("HOME_SEARCH_DIAGNOSTIC"))
          .slice(0, 3)
          .map(element => ({ tag: element.tagName, id: element.id, className: typeof element.className === "string" ? element.className : "", text: element.textContent, html: element.outerHTML.slice(0, 500) }))
      );
      console.log("HOME_SEARCH_DIAGNOSTIC_NODES", JSON.stringify(diagnosticNodes));
      console.log("HOME_SEARCH_DIAGNOSTIC", (await discoveryPage.locator("body").innerText()).slice(0, 500));
      await siteSearch.fill("আগে দেখে নিন");
      const tryFirstResult = discoveryPage.getByRole("option").filter({ hasText: "আগে দেখে নিন" }).first();
      await tryFirstResult.waitFor({ state: "visible", timeout: 10_000 });
      await tryFirstResult.click();
      await discoveryPage.waitForURL("**/try-first", { timeout: 10_000 });
      await record("homepage search opens the free sample", { pass: true, detail: "search → suggestion → /try-first" });

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
      const primaryNav = page.locator(".mobile-primary-nav");
      for (const label of ["হোম", "শিখুন", "গোপনীয়তা", "যোগাযোগ"]) {
        await primaryNav.getByRole("link", { name: label }).waitFor({ state: "visible", timeout: 10_000 });
      }
      const mobileMenu = page.getByRole("button", { name: "মেনু খুলুন" });
      await mobileMenu.waitFor({ state: "visible", timeout: 10_000 });
      await mobileMenu.click();
      const menuPanel = page.locator("#dsai-mobile-navigation");
      await menuPanel.waitFor({ state: "visible", timeout: 10_000 });
      assert.equal(await page.evaluate(() => document.body.style.overflow), "hidden", "Opening the mobile menu must lock background scrolling");
      const closeButton = menuPanel.getByRole("button", { name: /মেনু বন্ধ করুন/ });
      await closeButton.waitFor({ state: "visible", timeout: 10_000 });
      await closeButton.focus();
      await page.keyboard.press("Shift+Tab");
      assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), "কাজের জায়গায় যান", "Shift+Tab from the first menu control must wrap to the last menu control");
      await page.keyboard.press("Tab");
      assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), "মেনু বন্ধ করুন", "Tab from the last menu control must wrap to the first menu control");
      await page.keyboard.press("Escape");
      await menuPanel.waitFor({ state: "hidden", timeout: 10_000 });
      assert.equal(await page.evaluate(() => document.body.style.overflow), "", "Closing the mobile menu must restore body scrolling");
      assert.equal(await mobileMenu.evaluate(element => element === document.activeElement), true, "Escape must return focus to the menu trigger");
      await mobileMenu.click();
      await menuPanel.waitFor({ state: "visible", timeout: 10_000 });
      await page.locator("main").click({ position: { x: 10, y: 10 } });
      await menuPanel.waitFor({ state: "hidden", timeout: 10_000 });
      await mobileMenu.click();
      const workspaceLink = menuPanel.getByRole("link", { name: "কাজের জায়গা" });
      await workspaceLink.waitFor({ state: "visible", timeout: 10_000 });
      await workspaceLink.click();
      await page.waitForURL("**/workspace", { timeout: 10_000 });
      await record("mobile navigation persistent links, focus trap, Escape, scroll lock and outside dismissal", { pass: true, detail: "Home/Learn/Privacy/Contact stay visible; menu keyboard and pointer behavior verified" });
    }

  }
  await context.close();

  assert.deepEqual(pageErrors, [], `Uncaught browser errors: ${pageErrors.join(" | ")}`);
  await record("browser JavaScript runtime", { pass: true, detail: "no uncaught page errors" });
} catch (error) {
  console.error("DSAI_BROWSER_ACCEPTANCE=FAIL");
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
} finally {
  if (browser?.isConnected()) await browser.close();
}

console.log(`DSAI_BROWSER_ACCEPTANCE=${process.exitCode === 1 ? "FAIL" : "PASS"} checks=${results.length}`);
console.log(`MODE=${browserMode} URL=${baseUrl.origin}`);
console.log("SCOPE=real Chromium navigation, responsive smoke, direct discovery, liveness/readiness, unauthenticated API denial (production mode only)");
console.log("LIMITATION=no test credentials supplied; authenticated sign-in, real file bytes, cross-user isolation and delete lifecycle remain separate UAT gates");
