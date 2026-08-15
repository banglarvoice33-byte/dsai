import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const publicRoot = resolve(projectRoot, "client/public");

describe("DSAI mobile readiness contracts", () => {
  it("ships installable manifest metadata and lightweight icons", () => {
    const manifest = JSON.parse(readFileSync(resolve(publicRoot, "manifest.json"), "utf8"));
    expect(manifest.name).toContain("DSAI");
    expect(manifest.lang).toBe("bn");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toContain("/?");
    expect(manifest.icons).toHaveLength(2);
    for (const icon of manifest.icons) expect(existsSync(resolve(publicRoot, icon.src.slice(1)))).toBe(true);
  });

  it("keeps the service worker conservative around private APIs and storage", () => {
    const serviceWorker = readFileSync(resolve(publicRoot, "sw.js"), "utf8");
    expect(serviceWorker).toContain("/api/");
    expect(serviceWorker).toContain("/manus-storage/");
    expect(serviceWorker).toContain("request.mode === \"navigate\"");
    expect(serviceWorker).toContain("caches.match(\"/\")");
    expect(serviceWorker).not.toContain("cache.addAll([\"/api");
  });

  it("keeps narrow Bengali headings and mixed-script labels wrap-safe", () => {
    const css = readFileSync(resolve(projectRoot, "client/src/index.css"), "utf8");
    expect(css).toContain("Regression guard: Bengali and mixed-script text needs room to wrap");
    expect(css).toContain("overflow-wrap: anywhere");
    expect(css).toContain(".workspace-welcome h1");
    expect(css).toContain(".home-search-results");
  });

  it("guards OAuth redirects against offline loops and repeated navigation", () => {
    const main = readFileSync(resolve(projectRoot, "client/src/main.tsx"), "utf8");
    expect(main).toContain("!navigator.onLine || authRedirectStarted");
    expect(main).toContain('error.data?.code === "UNAUTHORIZED"');
  });

  it("exposes install metadata in the HTML shell", () => {
    const html = readFileSync(resolve(projectRoot, "client/index.html"), "utf8");
    expect(html).toContain('rel="manifest" href="/manifest.json"');
    expect(html).toContain('name="apple-mobile-web-app-capable"');
    expect(html).toContain('navigator.serviceWorker.register("/sw.js")');
  });
});
