import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("persistent lead CRM security contract", () => {
  it("stores leads and activity history with explicit user ownership", () => {
    const schema = read("drizzle/schema.ts");
    const migration = read("supabase/migrations/20261115050000_dsai_persistent_lead_workdesk.sql");
    expect(schema).toContain('pgTable(\n  "lead_records"');
    expect(schema).toContain('pgTable(\n  "lead_activities"');
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
    expect(migration).toContain("REVOKE ALL ON TABLE public.lead_records FROM anon, authenticated");
    expect(migration).toContain("REVOKE ALL ON TABLE public.lead_activities FROM anon, authenticated");
    expect(migration).toContain('REFERENCES public.users(id) ON DELETE CASCADE');
  });

  it("scopes all CRM reads and updates to the authenticated owner", () => {
    const db = read("server/db.ts");
    const router = read("server/routers.ts");
    expect(db).toContain("eq(leadRecords.userId, userId)");
    expect(db).toContain("eq(leadRecords.userId, input.userId)");
    expect(db).toContain("eq(leadActivities.userId, userId)");
    expect(router).toContain("list: protectedProcedure");
    expect(router).toContain("save: protectedProcedure");
    expect(router).toContain("update: protectedProcedure");
    expect(router).toContain("activities: protectedProcedure");
  });

  it("keeps outreach disabled and distinguishes draft consent from contact consent", () => {
    const page = read("client/src/pages/LeadComposer.tsx");
    const migration = read("supabase/migrations/20261115050000_dsai_persistent_lead_workdesk.sql");
    expect(page).toContain("Contact consent: {lead.consentStatus}");
    expect(page).toContain("কাউকে contact করা হয় না");
    expect(migration).toContain("DEFAULT 'unknown'");
    expect(page).not.toContain("sendEmail(");
    expect(page).not.toContain("sendSms(");
  });
});
