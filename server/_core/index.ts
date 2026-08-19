import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import crypto from "node:crypto";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { getDb } from "../db";
import { cleanupExpiredFileAssets, malwareScannerStatus } from "../fileSecurity";
import { sdk } from "./sdk";
import { serveStatic, setupVite } from "./vite";
import { applySecurityHeaders } from "../securityPolicy";
import { createRateLimit } from "../rateLimit";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    applySecurityHeaders(res, process.env.NODE_ENV === "production");
    next();
  });
  app.use((req, res, next) => {
    const incoming = req.header("x-request-id");
    const requestId = incoming && /^[a-zA-Z0-9._-]{8,128}$/.test(incoming) ? incoming : crypto.randomUUID();
    const startedAt = performance.now();
    res.setHeader("X-Request-ID", requestId);
    res.locals.requestId = requestId;
    res.on("finish", () => {
      const durationMs = Math.round(performance.now() - startedAt);
      if (req.path !== "/healthz" && req.path !== "/readyz") {
        console.info(JSON.stringify({ event: "http.request.completed", requestId, method: req.method, path: req.path, status: res.statusCode, durationMs }));
      }
    });
    next();
  });
  app.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok", service: "dsai", uptimeSeconds: Math.round(process.uptime()) });
  });
  app.get("/readyz", async (_req, res) => {
    const checks = { databaseConfigured: Boolean(process.env.DATABASE_URL), databaseHandle: false };
    if (checks.databaseConfigured) {
      checks.databaseHandle = Boolean(await getDb());
    }
    const ready = Object.values(checks).every(Boolean);
    res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "not_ready", service: "dsai", checks });
  });
  // Configure body parser with larger size limit for file uploads
  // Upload processing is not live in this release; keep request bodies bounded until a validated storage pipeline exists.
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.post("/api/files/upload", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user) {
        res.status(401).json({ error: "authentication-required" });
        return;
      }
      const scanner = malwareScannerStatus();
      if (!scanner.configured) {
        res.status(503).json({ error: "upload-scanner-required", message: "Upload is disabled until malware scanning is configured and verified." });
        return;
      }
      res.status(501).json({ error: "upload-adapter-not-enabled", message: "The scanner adapter is configured but upload integration still requires staging verification." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "upload request rejected";
      res.status(401).json({ error: "authentication-required", detail: message });
    }
  });
  app.post("/api/scheduled/cleanupFileAssets", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user?.isCron || !user.taskUid) {
        res.status(403).json({ error: "cron-only" });
        return;
      }
      const result = await cleanupExpiredFileAssets();
      res.status(200).json({ ok: true, taskUid: user.taskUid, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "retention cleanup failed";
      if (/session cookie|unauthorized|forbidden|cron/i.test(message)) {
        res.status(403).json({ error: "cron-only" });
        return;
      }
      res.status(500).json({ error: message, requestId: res.locals.requestId, timestamp: new Date().toISOString() });
    }
  });
  // Baseline abuse defense. A shared edge limiter remains required for multi-instance production traffic.
  app.use("/api/trpc", createRateLimit({ windowMs: 60_000, max: 120, keyPrefix: "trpc" }));
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
