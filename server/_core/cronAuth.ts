import { timingSafeEqual } from "node:crypto";

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
