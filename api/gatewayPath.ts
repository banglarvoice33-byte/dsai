/**
 * Resolve Vercel catch-all routing metadata without corrupting ordinary URLs.
 * `__path` is internal metadata and must never be forwarded to Express.
 */
export type GatewayPathResult =
  | { ok: true; rewrittenUrl?: string }
  | { ok: false; error: "invalid-request-url" | "invalid-route-path" | "ambiguous-route-path" };

export function isAllowedGatewayPath(value: string): boolean {
  const allowedFamily = value === "/healthz" || value === "/readyz" || value.startsWith("/api/");
  return allowedFamily
    && !/[\u0000-\u0020\u007f?#\\]/.test(value)
    && !/%/.test(value)
    && !/(^|\/)\.{1,2}(?:\/|$)/.test(value);
}

export function resolveGatewayPath(rawUrl: string | undefined, parsedPath: unknown): GatewayPathResult {
  let requestUrl: URL;
  try { requestUrl = new URL(rawUrl || "/", "http://internal.invalid"); }
  catch { return { ok: false, error: "invalid-request-url" }; }
  const values = requestUrl.searchParams.getAll("__path");
  if (values.length > 1 || (parsedPath !== undefined && typeof parsedPath !== "string")) {
    return { ok: false, error: "ambiguous-route-path" };
  }
  const queryPath = values[0];
  if (typeof parsedPath === "string" && queryPath !== undefined && parsedPath !== queryPath) {
    return { ok: false, error: "ambiguous-route-path" };
  }
  const routePath = typeof parsedPath === "string" ? parsedPath : queryPath;
  if (routePath === undefined) return { ok: true };
  if (!isAllowedGatewayPath(routePath)) return { ok: false, error: "invalid-route-path" };
  requestUrl.searchParams.delete("__path");
  return { ok: true, rewrittenUrl: routePath + requestUrl.search };
}
