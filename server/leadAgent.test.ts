import { describe, expect, it } from "vitest";
import { buildLeadActionPlan, leadIntakeSchema } from "./leadAgent";

const baseLead = {
  name: "Alex Morgan",
  email: "alex@example.com",
  timezone: "America/New_York",
  requestedService: "Property consultation",
  source: "website",
  consentToContact: true,
  preferredChannel: "email" as const,
};

describe("lead response planning", () => {
  it("keeps outbound actions disabled while allowing a consented dry-run plan", () => {
    const plan = buildLeadActionPlan(leadIntakeSchema.parse(baseLead));

    expect(plan.status).toBe("ready");
    expect(plan.proposedNextAction).toBe("send_email_draft");
    expect(plan.calendarLookupAllowed).toBe(true);
    expect(plan.outboundSendAllowed).toBe(false);
  });

  it("blocks contact and calendar lookup when consent is missing", () => {
    const plan = buildLeadActionPlan(
      leadIntakeSchema.parse({ ...baseLead, consentToContact: false }),
    );

    expect(plan.status).toBe("needs_consent");
    expect(plan.calendarLookupAllowed).toBe(false);
    expect(plan.outboundSendAllowed).toBe(false);
  });

  it("requires a phone number for SMS or phone channels", () => {
    const plan = buildLeadActionPlan(
      leadIntakeSchema.parse({ ...baseLead, preferredChannel: "sms" }),
    );

    expect(plan.status).toBe("needs_phone");
    expect(plan.proposedNextAction).toBe("request_phone");
  });
});
