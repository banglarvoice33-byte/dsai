import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const service = readFileSync(new URL("./workDeskTasks.ts", import.meta.url), "utf8");
const router = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20261120084933_dsai_workdesk_durable_document_tasks.sql", import.meta.url), "utf8");
const ownerIndexMigration = readFileSync(new URL("../supabase/migrations/20261120084958_dsai_workdesk_task_event_owner_index.sql", import.meta.url), "utf8");
const serviceRoleMigration = readFileSync(new URL("../supabase/migrations/20261120085029_dsai_workdesk_service_role_grants.sql", import.meta.url), "utf8");
const vercelApp = readFileSync(new URL("./_core/vercelApp.ts", import.meta.url), "utf8");
const cronAuth = readFileSync(new URL("./_core/cronAuth.ts", import.meta.url), "utf8");
const workerScheduleMigration = readFileSync(new URL("../supabase/migrations/20261120112528_dsai_workdesk_worker_schedule.sql", import.meta.url), "utf8");
const malwareBazaarScheduleMigration = readFileSync(new URL("../supabase/migrations/20261120154757_dsai_malwarebazaar_daily_sync_cron.sql", import.meta.url), "utf8");
const vercelConfig = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8")) as { crons: Array<{ path: string; schedule: string }> };
const panel = readFileSync(new URL("../client/src/components/FileUploadPanel.tsx", import.meta.url), "utf8");
const textPanel = readFileSync(new URL("../client/src/components/WorkDeskTextPanel.tsx", import.meta.url), "utf8");

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

  it("authenticates the Supabase worker with a timestamp-bound HMAC", () => {
    expect(vercelApp).toContain('app.get("/api/scheduled/processDocumentTasks"');
    expect(vercelApp).toContain("isAuthorizedCronHmacRequest");
    expect(vercelApp).toContain("process.env.SUPABASE_CRON_SECRET");
    expect(cronAuth).toContain("createHmac");
    expect(cronAuth).toContain("timingSafeEqual");
    expect(cronAuth).toContain("Math.abs(nowSeconds - timestampSeconds) > 300");
  });

  it("schedules the minute worker from Supabase Vault without queuing the long-lived secret", () => {
    expect(workerScheduleMigration).toContain("'dsai-workdesk-document-worker'");
    expect(workerScheduleMigration).toContain("'* * * * *'");
    expect(workerScheduleMigration).toContain("vault.decrypted_secrets");
    expect(workerScheduleMigration).toContain("workdesk_worker_auth");
    expect(workerScheduleMigration).toContain("extensions.hmac");
    expect(workerScheduleMigration).toContain("net.http_get");
    expect(workerScheduleMigration).not.toContain("SUPABASE_CRON_SECRET");
    expect(workerScheduleMigration).not.toContain("Authorization");
    expect(workerScheduleMigration).not.toContain("Bearer ");
  });

  it("runs MalwareBazaar metadata sync once daily through Supabase Cron, not the minute worker or Vercel Cron", () => {
    expect(malwareBazaarScheduleMigration).toContain("'dsai-malwarebazaar-daily-sync'");
    expect(malwareBazaarScheduleMigration).toContain("'15 3 * * *'");
    expect(malwareBazaarScheduleMigration).toContain("vault.decrypted_secrets");
    expect(malwareBazaarScheduleMigration).toContain("extensions.hmac");
    expect(malwareBazaarScheduleMigration).toContain("/api/scheduled/syncMalwareBazaar");
    expect(malwareBazaarScheduleMigration).not.toContain("Authorization");
    expect(malwareBazaarScheduleMigration).not.toContain("Bearer ");
    expect(vercelConfig.crons).toContainEqual({ path: "/api/scheduled/cleanupFileAssets", schedule: "0 3 * * *" });
    expect(vercelConfig.crons.some(job => job.path === "/api/scheduled/syncMalwareBazaar")).toBe(false);
    expect(vercelConfig.crons.some(job => job.path === "/api/scheduled/processDocumentTasks")).toBe(false);
  });

  it("keeps Bengali Work Desk errors user-friendly and confirms clipboard success only after copy", () => {
    expect(textPanel).toContain('task.status === "failed"');
    expect(textPanel).not.toContain("{task.errorCode}");
    expect(textPanel).toContain("await navigator.clipboard.writeText(text)");
    expect(textPanel).toContain("ফলাফল কপি করা যায়নি");
  });

  it("uses adaptive 15-second status polling only while tasks are active", () => {
    const textPanel = readFileSync(new URL("../client/src/components/WorkDeskTextPanel.tsx", import.meta.url), "utf8");
    expect(textPanel).toContain("refetchInterval: query => query.state.data?.some(task => ACTIVE_TASK_STATUSES.has(task.status)) ? 15_000 : false");
    expect(textPanel).toContain("refetchIntervalInBackground: false");
    expect(panel).toContain("refetchInterval: query => query.state.data?.some(task => ACTIVE_TASK_STATUSES.has(task.status)) ? 15_000 : false");
    expect(panel).toContain("refetchIntervalInBackground: false");
  });

  it("does not advertise unsupported OCR and exposes real task actions in Work Desk", () => {
    expect(panel).toContain('supportedExtraction = new Set(["text/plain", "text/csv", "application/json"])');
    expect(panel).toContain("PDF, DOCX, XLSX ও ছবির OCR এখনো চালু নয়");
    expect(panel).toContain('cancelTask.mutate({ taskId: task.id })');
    expect(panel).toContain('retryTask.mutate({ taskId: task.id })');
    expect(panel).toContain("selectedTask.data?.result");
    expect(panel).toContain("refetchInterval: query => query.state.data?.some(task => ACTIVE_TASK_STATUSES.has(task.status)) ? 15_000 : false");
    expect(panel).not.toContain("processPending.useMutation");
    expect(panel).not.toContain("window.setInterval");
  });
});
