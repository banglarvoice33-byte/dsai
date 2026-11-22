import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Validate Vercel Cron's documented Authorization: Bearer <CRON_SECRET> header.
 * Fail closed when the secret is absent and avoid timing-sensitive string comparison.
 */
export function isAuthorizedCronRequest(
  authorization: string | undefined,
  secret: string | undefined,
): boolean {
  if (!secret || !authorization) return false;

  const expected = Buffer.from(`Bearer ${secret}`, "utf8");
  const supplied = Buffer.from(authorization, "utf8");
  if (supplied.length !== expected.length) return false;

  return timingSafeEqual(supplied, expected);
}

/**
 * Validate a timestamp-bound HMAC for Supabase pg_cron -> pg_net calls.
 * The signature covers timestamp, HTTP method and exact route path. The long-lived
 * key is never placed in pg_net request headers; only the derived HMAC is queued.
 */
export function isAuthorizedCronHmacRequest(
  timestampHeader: string | undefined,
  signatureHeader: string | undefined,
  secret: string | undefined,
  routePath: string,
  nowMs = Date.now(),
): boolean {
  if (!secret || !timestampHeader || !signatureHeader) return false;
  if (!/^\d{10}$/.test(timestampHeader) || !/^[a-f0-9]{64}$/i.test(signatureHeader)) return false;

  const timestampSeconds = Number(timestampHeader);
  const nowSeconds = Math.floor(nowMs / 1000);
  if (!Number.isSafeInteger(timestampSeconds) || Math.abs(nowSeconds - timestampSeconds) > 300) return false;

  const payload = `${timestampHeader}.GET.${routePath}`;
  const expected = createHmac("sha256", secret).update(payload, "utf8").digest();
  const supplied = Buffer.from(signatureHeader, "hex");
  if (supplied.length !== expected.length) return false;

  return timingSafeEqual(supplied, expected);
}
