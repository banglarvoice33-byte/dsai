import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";

const TOKEN_MAX_LENGTH = 4096;

export function captchaConfig() {
  return { required: ENV.captchaRequired, configured: Boolean(ENV.captchaSecretKey && ENV.captchaSiteKey), siteKey: ENV.captchaSiteKey || null };
}

export async function verifyCaptchaToken(token: string | undefined, remoteIp?: string | null) {
  if (!ENV.captchaRequired) return { ok: true as const, bypassed: true as const };
  if (!ENV.captchaSecretKey || !ENV.captchaSiteKey) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "CAPTCHA is required but not configured on this deployment." });
  if (!token || token.length > TOKEN_MAX_LENGTH) throw new TRPCError({ code: "BAD_REQUEST", message: "CAPTCHA verification is required." });
  const body = new URLSearchParams({ secret: ENV.captchaSecretKey, response: token });
  if (remoteIp) body.set("remoteip", remoteIp.slice(0, 128));
  try {
    const response = await fetch(ENV.captchaVerifyUrl, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body, signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`captcha provider ${response.status}`);
    const result = await response.json() as { success?: boolean; hostname?: string; [key: string]: unknown };
    if (!result.success) throw new TRPCError({ code: "FORBIDDEN", message: "CAPTCHA verification failed." });
    const hostname = typeof result.hostname === "string" ? result.hostname : null;
    if (ENV.captchaAllowedHostname && hostname !== ENV.captchaAllowedHostname) throw new TRPCError({ code: "FORBIDDEN", message: "CAPTCHA hostname verification failed." });
    return { ok: true as const, bypassed: false as const, hostname };
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    console.warn("[CAPTCHA] verification unavailable; login is blocked");
    throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "CAPTCHA service is temporarily unavailable. Please try again." });
  }
}
