import { z } from "zod";

export const leadIntakeSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(32).optional(),
  timezone: z.string().trim().min(1).max(80),
  requestedService: z.string().trim().min(1).max(160),
  source: z.string().trim().min(1).max(120),
  consentToContact: z.boolean(),
  preferredChannel: z.enum(["email", "sms", "phone"]).default("email"),
});

export type LeadIntake = z.infer<typeof leadIntakeSchema>;

export type LeadActionPlan = {
  status: "ready" | "needs_consent" | "needs_phone";
  acknowledgement: string;
  proposedNextAction: "send_email_draft" | "send_sms_draft" | "request_phone" | "human_review";
  calendarLookupAllowed: boolean;
  outboundSendAllowed: false;
  reason: string;
};

/**
 * Builds a deterministic, no-send plan for a lead event. External messaging and
 * calendar providers are intentionally not called here. The plan is safe to
 * preview, persist, and hand to a future queue worker after consent/configuration.
 */
export function buildLeadActionPlan(input: LeadIntake): LeadActionPlan {
  if (!input.consentToContact) {
    return {
      status: "needs_consent",
      acknowledgement: "We received your request. Please confirm that you want to be contacted.",
      proposedNextAction: "human_review",
      calendarLookupAllowed: false,
      outboundSendAllowed: false,
      reason: "No contact consent was recorded.",
    };
  }

  if (input.preferredChannel !== "email" && !input.phone) {
    return {
      status: "needs_phone",
      acknowledgement: "We received your request. Please provide a phone number for the selected contact method.",
      proposedNextAction: "request_phone",
      calendarLookupAllowed: false,
      outboundSendAllowed: false,
      reason: "The requested phone-based channel requires a phone number.",
    };
  }

  const proposedNextAction = input.preferredChannel === "email" ? "send_email_draft" : "send_sms_draft";

  return {
    status: "ready",
    acknowledgement: "We received your request. A reviewed response and available meeting times will be prepared next.",
    proposedNextAction,
    calendarLookupAllowed: true,
    outboundSendAllowed: false,
    reason: "Consent and minimum contact data are present; provider actions remain disabled in dry-run mode.",
  };
}
