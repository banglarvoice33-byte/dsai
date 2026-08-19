import crypto from "node:crypto";
import type { Request, Response } from "express";
import { recordBillingWebhookReceipt } from "./db";
import { emitTelemetry } from "./telemetry";

export function verifyBillingSignature(rawBody: Buffer, signatureHeader: string | undefined, secret: string | undefined, nowSeconds = Math.floor(Date.now() / 1000), toleranceSeconds = 300) {
  if (!secret || !signatureHeader) return { ok: false as const, reason: "missing_configuration" as const };
  const parts = Object.fromEntries(signatureHeader.split(",").map(part => part.split("=", 2) as [string, string]));
  const timestamp = Number(parts.t);
  const provided = parts.v1 || "";
  if (!Number.isFinite(timestamp) || Math.abs(nowSeconds - timestamp) > toleranceSeconds || !/^[a-f0-9]{64}$/i.test(provided)) return { ok: false as const, reason: "invalid_signature" as const };
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody.toString("utf8")}`).digest("hex");
  const ok = crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"));
  return ok ? { ok: true as const, timestamp } : { ok: false as const, reason: "invalid_signature" as const };
}

export async function handleBillingWebhook(req: Request, res: Response) {
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body ?? {}));
  const verification = verifyBillingSignature(rawBody, req.header("stripe-signature") || req.header("x-billing-signature"), process.env.BILLING_WEBHOOK_SECRET);
  if (!verification.ok) {
    emitTelemetry("billing.webhook.blocked", { requestId: res.locals.requestId, provider: "stripe-compatible", reason: verification.reason });
    res.status(verification.reason === "missing_configuration" ? 503 : 400).json({ error: verification.reason });
    return;
  }
  let event: { id?: string; type?: string };
  try { event = JSON.parse(rawBody.toString("utf8")); } catch { res.status(400).json({ error: "invalid_json" }); return; }
  if (!event.id || !event.type) { res.status(400).json({ error: "event_identity_required" }); return; }
  const receipt = await recordBillingWebhookReceipt({ provider: "stripe-compatible", eventId: event.id, eventType: event.type, signatureVerified: true, requestId: res.locals.requestId });
  emitTelemetry("billing.webhook.received", { requestId: res.locals.requestId, provider: "stripe-compatible", eventType: event.type, duplicate: receipt.duplicate });
  res.status(receipt.duplicate ? 200 : 202).json({ accepted: true, duplicate: receipt.duplicate });
}
