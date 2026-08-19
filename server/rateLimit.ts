import type { NextFunction, Request, Response } from "express";

type Bucket = { startedAt: number; count: number };

export function createRateLimit(options: { windowMs: number; max: number; keyPrefix: string }) {
  const buckets = new Map<string, Bucket>();
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const forwarded = req.header("x-forwarded-for")?.split(",")[0]?.trim();
    const identity = forwarded || req.ip || "unknown";
    const key = `${options.keyPrefix}:${identity}`;
    const current = buckets.get(key);
    const bucket = !current || now - current.startedAt >= options.windowMs ? { startedAt: now, count: 0 } : current;
    bucket.count += 1;
    buckets.set(key, bucket);
    if (buckets.size > 5000) {
      buckets.forEach((value, bucketKey) => { if (now - value.startedAt >= options.windowMs) buckets.delete(bucketKey); });
    }
    if (bucket.count > options.max) {
      const retryAfter = Math.max(1, Math.ceil((bucket.startedAt + options.windowMs - now) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      res.status(429).json({ error: "rate-limit", message: "Too many requests; please retry later." });
      return;
    }
    next();
  };
}
