import type { IncomingMessage, ServerResponse } from "node:http";
import app from "../server/_core/vercelApp.bundle.mjs";
import { resolveGatewayPath } from "./gatewayPath";

type GatewayRequest = IncomingMessage & { query?: Record<string, unknown> };

function sendJson(res: ServerResponse, status: number, error: string): void {
  if (res.writableEnded || res.destroyed) return;
  if (res.headersSent) { res.end(); return; }
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify({ error }));
}

export default function handler(req: GatewayRequest, res: ServerResponse) {
  const route = resolveGatewayPath(req.url, req.query?.__path);
  if (!route.ok) {
    sendJson(res, 400, route.error);
    return;
  }

  // Preserve the original URL exactly for ordinary requests; rewrite only when
  // Vercel supplied an explicitly validated internal route path.
  if (route.rewrittenUrl !== undefined) {
    req.url = route.rewrittenUrl;
    if (req.query) {
      const { __path: _internalPath, ...publicQuery } = req.query;
      req.query = publicQuery;
    }
  }

  return app(req, res, (error: unknown) => {
    if (error) {
      sendJson(res, 500, "internal-server-error");
      return;
    }
    sendJson(res, 404, "api-route-not-found");
  });
}
