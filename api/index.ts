import type { Request, Response } from "express";
import app from "../server/_core/vercelApp.bundle.mjs";
import { resolveGatewayPath } from "./gatewayPath";

function sendJson(res: Response, status: number, error: string): void {
  if (res.writableEnded || res.destroyed) return;
  if (res.headersSent) { res.end(); return; }
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify({ error }));
}

export default function handler(req: Request, res: Response) {
  // Express owns the request shape; Vercel's parsed query can contain arrays
  // or nested values, so treat internal routing metadata as untrusted input.
  const parsedQuery = req.query as Record<string, unknown> | undefined;
  const route = resolveGatewayPath(req.url, parsedQuery?.__path);
  if (!route.ok) {
    sendJson(res, 400, route.error);
    return;
  }

  // Preserve the original URL exactly for ordinary requests; rewrite only when
  // Vercel supplied an explicitly validated internal route path.
  if (route.rewrittenUrl !== undefined) {
    req.url = route.rewrittenUrl;
    if (parsedQuery) {
      const { __path: _internalPath, ...publicQuery } = parsedQuery;
      req.query = publicQuery as Request["query"];
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
