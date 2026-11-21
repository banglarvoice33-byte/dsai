import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("persistent lead CRM security contract", () => {
  it("stores leads and activity history with explicit user ownership", () => {
    const schema = read("drizzle/schema.ts");
    const migration = read("supabase/migrations/20261115042429_dsai_persistent_lead_workdesk.sql");
    expect(schema).toContain('pgTable(\n  "lead_records"');
    expect(schema).toContain('pgTable(\n  "lead_activities"');
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
    expect(migration).toContain("REVOKE ALL ON TABLE public.lead_records FROM anon, authenticated");
    expect(migration).toContain("REVOKE ALL ON TABLE public.lead_activities FROM anon, authenticated");
    expect(migration).toContain('REFERENCES public.users(id) ON DELETE CASCADE');
  });

  it("scopes all CRM reads, writes, and updates to the authenticated owner", () => {
    const db = read("server/db.ts");
    const router = read("server/routers.ts");
    expect(db).toContain("eq(leadRecords.userId, userId)");
    expect(db).toContain("eq(leadRecords.userId, input.userId)");
    expect(db).toContain("eq(leadActivities.userId, userId)");
    expect(db).toContain("private.dsai_create_lead");
    expect(db).toContain("${input.userId}");
    expect(router).toContain("list: protectedProcedure");
    expect(router).toContain("save: protectedProcedure");
    expect(router).toContain("update: protectedProcedure");
    expect(router).toContain("activities: protectedProcedure");
    expect(router).toContain("userId: ctx.user.id");
  });

  it("enforces the 20-lead UTC daily cap atomically and audits every accepted lead", () => {
    const migration = read("supabase/migrations/20261120121430_dsai_lead_crm_reconcile_existing_leads.sql");
    const db = read("server/db.ts");
    const router = read("server/routers.ts");
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("v_used >= 20");
    expect(migration).toContain("'daily_limit_reached'");
    expect(migration).toContain("'quality_gate_contact_required'");
    expect(migration).toContain("INSERT INTO public.usage_logs");
    expect(db).toContain("private.dsai_create_lead");
    expect(router).toContain("আজকের সর্বোচ্চ ২০টি Lead");
    expect(router).toContain("একটি বৈধ ইমেইল অথবা ফোন নম্বর প্রয়োজন");
  });

  it("counts legacy leads created today before allowing new lead records", () => {
    const migration = read("supabase/migrations/20261120124056_dsai_lead_legacy_quota_reconciliation.sql");
    expect(migration).toContain('lr."createdAt"');
    expect(migration).toContain("v_used := greatest");
    expect(migration).toContain("v_day_start AT TIME ZONE 'UTC'");
  });

  it("enforces a separate 20-attempt daily cap for AI composition", () => {
    const migration = read("supabase/migrations/20261120122351_dsai_lead_ai_daily_quota.sql");
    const router = read("server/routers.ts");
    const composer = read("server/multilingualLead.ts");
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("v_used >= 20");
    expect(migration).toContain("'daily_limit_reached'");
    expect(migration).toContain("'lead_ai'");
    expect(router).toContain("compose: protectedProcedure");
    expect(router).toContain("ctx.user.id, requestId");
    expect(composer).toContain("reserveLeadAIUsage");
    expect(composer).toContain("finalizeLeadAIUsage");
  });

  it("keeps browser roles out of lead data and usage audit", () => {
    const migration = read("supabase/migrations/20261120121158_dsai_lead_crm_cloud.sql");
    const reconciliation = read("supabase/migrations/20261120121430_dsai_lead_crm_reconcile_existing_leads.sql");
    expect(migration).toContain("ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY");
    expect(migration).toContain("REVOKE ALL PRIVILEGES ON TABLE public.leads, public.usage_logs FROM PUBLIC, anon, authenticated");
    expect(reconciliation).toContain("lead_records_no_direct_client_access");
    expect(reconciliation).toContain("REVOKE ALL PRIVILEGES ON TABLE public.lead_records FROM PUBLIC, anon, authenticated");
  });

  it("does not fabricate a lead draft when the AI provider fails or returns invalid output", () => {
    const composer = read("server/multilingualLead.ts");
    const tests = read("server/multilingualLead.test.ts");
    const page = read("client/src/pages/LeadComposer.tsx");
    expect(composer).toContain('source: "unavailable"');
    expect(composer).not.toContain("fallbackDraft");
    expect(composer).not.toContain("invokeLLM");
    expect(tests).toContain("does not invent a fallback");
    expect(page).toContain('compose.data?.source === "ai"');
    expect(page).toContain("কোনো নমুনা খসড়া তৈরি করা হয়নি");
  });

  it("requires real contact data before saving a CRM lead", () => {
    const page = read("client/src/pages/LeadComposer.tsx");
    const router = read("server/routers.ts");
    expect(page).toContain("contactName.trim()");
    expect(page).toContain("contactEmail.trim() && !contactPhone.trim()");
    expect(router).toContain("contactName: z.string().trim().min(2).max(160)");
    expect(router).toContain("Boolean(input.email || input.phone)");
  });

  it("starts the lead composer in Bengali and presents the business choices in Bengali", () => {
    const page = read("client/src/pages/LeadComposer.tsx");
    expect(page).toContain('useState("bd")');
    expect(page).toContain('useState("বাংলাদেশ")');
    expect(page).toContain('useState("বাংলা")');
    expect(page).toContain("বাংলায় নির্দেশনা দিয়ে খসড়া তৈরি করুন");
    expect(page).toContain("industryLabelsBn[item]");
    expect(page).toContain("stageLabelsBn[item]");
    expect(page).toContain("goalLabelsBn[item]");
    expect(page).toContain("যোগাযোগের সম্মতি");
  });

  it("starts the lead composer in Bengali and presents the business choices in Bengali", () => {
    const page = read("client/src/pages/LeadComposer.tsx");
    expect(page).toContain('useState("bd")');
    expect(page).toContain('useState("বাংলাদেশ")');
    expect(page).toContain('useState("বাংলা")');
    expect(page).toContain("বাংলায় নির্দেশনা দিয়ে খসড়া তৈরি করুন");
    expect(page).toContain("industryLabelsBn[item]");
    expect(page).toContain("stageLabelsBn[item]");
    expect(page).toContain("goalLabelsBn[item]");
    expect(page).toContain("যোগাযোগের সম্মতি");
  });

  it("keeps outreach disabled and distinguishes draft consent from contact consent", () => {
    const page = read("client/src/pages/LeadComposer.tsx");
    const migration = read("supabase/migrations/20261115042429_dsai_persistent_lead_workdesk.sql");
    expect(page).toContain("যোগাযোগের সম্মতি: {lead.consentStatus ===");
    expect(page).toContain("কাউকে যোগাযোগ করা হয় না");
    expect(migration).toContain("DEFAULT 'unknown'");
    expect(page).not.toContain("sendEmail(");
    expect(page).not.toContain("sendSms(");
  });

  it("keeps the cloud env template safe to commit", () => {
    const env = read(".env.example");
    const ignore = read(".gitignore");
    expect(env).toContain("LEAD_DAILY_CAP=20");
    expect(env).toContain("LEAD_AI_DAILY_CAP=20");
    expect(env).toContain("LEAD_QUALITY_GATE_ENABLED=true");
    expect(env).not.toContain("OLLAMA");
    expect(env).not.toContain("CLAMAV_HOST");
    expect(ignore).toContain("!.env.example");
  });
});
