import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyBillingSignature } from "./billingWebhook";

describe("billing webhook verification", () => {
  const body = Buffer.from(JSON.stringify({ id: "evt_1", type: "checkout.session.completed" }));
  const secret = "test_webhook_secret";
  const timestamp = 1_700_000_000;
  const signature = crypto.createHmac("sha256", secret).update(`${timestamp}.${body.toString("utf8")}`).digest("hex");

  it("accepts a valid timestamped signature", () => {
    expect(verifyBillingSignature(body, `t=${timestamp},v1=${signature}`, secret, timestamp).ok).toBe(true);
  });
  it("rejects replays outside the tolerance window", () => {
    expect(verifyBillingSignature(body, `t=${timestamp},v1=${signature}`, secret, timestamp + 301).ok).toBe(false);
  });
  it("fails closed when configuration is missing", () => {
    expect(verifyBillingSignature(body, undefined, undefined, timestamp).reason).toBe("missing_configuration");
  });
});
