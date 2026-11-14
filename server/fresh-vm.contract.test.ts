import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("fresh Ubuntu VM deployment contract", () => {
  it("ships the requested container and runtime metadata", () => {
    const dockerfile = read("Dockerfile");
    expect(dockerfile).toContain("FROM node:24.22.2-alpine3.24 AS build");
    expect(dockerfile).toContain("FROM node:24.22.2-alpine3.24 AS runtime");
    expect(dockerfile).toContain("pnpm run build:standalone");
    expect(dockerfile).toContain('CMD ["node", "dist/index.js"]');
    expect(dockerfile).toContain("USER node");
    expect(dockerfile).toContain("HEALTHCHECK");
    expect(dockerfile).toContain("ENV NODE_ENV=production");
    expect(read("docker-compose.yml")).toContain("postgres:17.5");
    expect(read("docker-compose.yml")).toContain('127.0.0.1:3000:3000');
    expect(read("docker-compose.yml")).toContain("DATABASE_SSL: disable");
    expect(read(".dockerignore")).toContain(".env.*");
    expect(read(".nvmrc").trim()).toBe("24.22.2");
  });

  it("keeps dependency declarations exact and documents verification", () => {
    const pkg = JSON.parse(read("package.json"));
    const versions = { ...pkg.dependencies, ...pkg.devDependencies } as Record<string, string>;
    expect(Object.values(versions).every(version => !/^[~^*<>=]|\\s\\|\\s/.test(version))).toBe(true);
    expect(pkg.scripts.verify).toBe("bash scripts/verify.sh");
    expect(read("README.md")).toContain("docker compose up --build");
    expect(read("README.md")).toContain("VERIFY_DOCKER_BUILD=1 bash scripts/verify.sh");
  });

  it("preserves all health contracts and a build/test verifier", () => {
    const server = read("server/_core/index.ts");
    const verifier = read("scripts/verify.sh");
    expect(server).toContain('app.get("/health"');
    expect(server).toContain('app.get("/healthz"');
    expect(server).toContain('app.get("/readyz"');
    expect(verifier).toContain("pnpm test");
    expect(verifier).toContain("pnpm run build");
    expect(verifier).toContain("DOCKER_BUILD=SKIPPED");
  });
});
