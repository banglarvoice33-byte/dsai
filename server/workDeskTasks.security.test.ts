import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const service = readFileSync(new URL("./workDeskTasks.ts", import.meta.url), "utf8");
const router = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20261120084933_dsai_workdesk_durable_document_tasks.sql", import.meta.url), "utf8");
const ownerIndexMigration = readFileSync(new URL("../supabase/migrations/20261120084958_dsai_workdesk_task_event_owner_index.sql", import.meta.url), "utf8");
const serviceRoleMigration = readFileSync(new URL("../supabase/migrations/20261120085029_dsai_workdesk_service_role_grants.sql", import.meta.url), "utf8");
const schedulerMigration = readFileSync(new URL("../supabase/migrations/20261120111308_dsai_supabase_workdesk_cron.sql", import.meta.url), "utf8");
const vercelApp = readFileSync(new URL("./_core/vercelApp.ts", import.meta.url), "utf8");
const vercelConfig = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8")) as { crons: Array<{ path: string; schedule: string }> };
const panel = readFileSync(new URL("../client/src/components/FileUploadPanel.tsx", import.meta.url), "utf8");

describe("Work Desk production security boundaries", () => {
  it("requires a clean, unexpired file owned by the requesting user before task creation", () => {
    expect(service).toContain("getCleanFileAsset(input.userId, input.fileAssetId)");
    expect(service).toContain("asset.sha256");
    expect(service).toContain("scanner.scannerConfigured");
    expect(service).toContain("scanner.storageConfigured");
  });

  it("rechecks file ownership, clean status, retention and integrity for every worker attempt", () => {
    expect(service).toContain("getCleanFileAsset(row.userId, row.fileAssetId)");
    expect(service).toContain("bytes.length !== asset.byteSize");
    expect(service).toContain("sha256Hex(bytes) !== asset.sha256");
  });

  it("claims queue work atomically and protects against stale workers", () => {
    expect(service).toContain("FOR UPDATE SKIP LOCKED");
    expect(service).toContain("lease_token = ${leaseToken}::uuid");
    expect(service).toContain("eq(documentTasks.leaseToken, leaseToken)");
    expect(service).toContain("retry_wait");
    expect(service).toContain("WORKER_LEASE_EXPIRED");
  });

  it("scopes user-visible reads, cancellation and retries to the authenticated owner", () => {
    expect(service).toContain("eq(documentTasks.userId, userId)");
    expect(router).toContain("tasks: protectedProcedure");
    expect(router).toContain("task: protectedProcedure");
    expect(router).toContain("cancelTask: protectedProcedure");
    expect(router).toContain("retryTask: protectedProcedure");
    expect(router).toContain("processPending: protectedProcedure");
  });

  it("keeps task and audit records inaccessible to anon/authenticated database roles", () => {
    expect(migration).toContain("ALTER TABLE private.document_tasks FORCE ROW LEVEL SECURITY");
    expect(migration).toContain("ALTER TABLE private.document_task_events FORCE ROW LEVEL SECURITY");
    expect(migration).toContain("AS RESTRICTIVE FOR ALL TO anon, authenticated");
    expect(migration).toContain("USING (false) WITH CHECK (false)");
    expect(migration).toContain("REVOKE ALL ON private.document_tasks FROM anon, authenticated");
    expect(migration).toContain("REVOKE ALL ON private.document_task_events FROM anon, authenticated");
    expect(migration).toContain("BEFORE UPDATE ON private.document_task_events");
    expect(migration).toContain("document task events are append-only");
  });

  it("indexes audit-event ownership and grants only the server role runtime access", () => {
    expect(ownerIndexMigration).toContain("ON private.document_task_events (user_id, created_at)");
    expect(serviceRoleMigration).toContain("TO service_role");
    expect(serviceRoleMigration).toContain("ON SEQUENCE private.document_task_events_id_seq");
  });

  it("exposes only a cron-secret protected worker on the Vercel production entrypoint", () => {
    expect(vercelApp).toContain('app.get("/api/scheduled/processDocumentTasks"');
    expect(vercelApp).toContain("isAuthorizedCronRequest(req.get(\"authorization\"), process.env.CRON_SECRET)");
    expect(vercelConfig.crons).toContainEqual({ path: "/api/scheduled/processDocumentTasks", schedule: "30 4 * * *" });
  });

  it("does not advertise unsupported image OCR and exposes real task actions in Work Desk", () => {
    expect(panel).toContain('supportedExtraction = new Set(["text/plain", "text/csv", "application/json", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"])');
    expect(panel).toContain("ছবি আপনার ব্রাউজারেই পড়া হয়। পাঠানোর আগে পাওয়া লেখা যাচাই করুন।");
    expect(panel).not.toContain("ছবি থেকে লেখা এখনো চালু নয়");
    expect(panel).toContain("onOcrText?.(ocrText)");
    expect(panel).toContain('cancelTask.mutate({ taskId: task.id })');
    expect(panel).toContain('retryTask.mutate({ taskId: task.id })');
    expect(panel).toContain("selectedTask.data?.result");
  });
});
