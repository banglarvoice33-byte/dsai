import app from "../server/_core/vercelApp.bundle.mjs";

export default function handler(req: any, res: any) {
  const originalPath = req.query?.__path;
  if (
    typeof originalPath === "string" &&
    (originalPath === "/healthz" ||
      originalPath === "/readyz" ||
      originalPath.startsWith("/api/"))
  ) {
    const requestUrl = new URL(req.url || "/", `http://${req.headers?.host || "localhost"}`);
    requestUrl.searchParams.delete("__path");
    req.url = `${originalPath}${requestUrl.search}`;
  }
  return app(req, res, (error: unknown) => {
    if (error && !res.headersSent) {
      res.status(500).json({ error: "internal-server-error" });
    }
  });
}
