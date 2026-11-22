import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const service = readFileSync(new URL("./workDeskTextTasks.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20261120170000_dsai_workdesk_text_task_queue.sql", import.meta.url), "utf8");
const worker = readFileSync(new URL("./_core/vercelApp.ts", import.meta.url), "utf8");

describe("Work Desk text-only durable queue", () => {
  it("persists tasks before any provider call and keeps idempotent requests owner-scoped", () => {
    const createStart = service.indexOf("export async function createWorkDeskTextTask");
    const createEnd = service.indexOf("export async function listWorkDeskTextTasks");
    const createBody = service.slice(createStart, createEnd);
    expect(createBody).toContain("ON CONFLICT (user_id, idempotency_key) DO NOTHING");
    expect(createBody).toContain("status");
    expect(createBody).toContain("'queued'");
    expect(createBody).not.toContain("runAIProviderWithFallback");
    expect(createBody).toContain("row.prompt !== prompt || row.language !== input.language");
  });

  it("uses atomic queue claims, lease fencing, bounded retries and crash recovery", () => {
    expect(service).toContain("FOR UPDATE SKIP LOCKED");
    expect(service).toContain("lease_token = ${leaseToken}::uuid");
    expect(service).toContain("AND lease_token = ${leaseToken}::uuid");
    expect(service).toContain("status = 'retry_wait'");
    expect(service).toContain("WORKER_LEASE_EXPIRED");
    expect(service).toContain("MAX_BATCH_SIZE");
  });

  it("enforces owner-scoped read, cancel and retry operations", () => {
    expect(service).toContain("WHERE user_id = ${userId}");
    expect(service).toContain("AND id = ${taskId}::uuid");
    expect(service).toContain("AND status = 'failed'");
    expect(service).toContain("SET status = 'cancelled'");
  });

  it("keeps lifecycle events private and browser-inaccessible", () => {
    expect(migration).toContain("ALTER TABLE private.workdesk_text_task_events FORCE ROW LEVEL SECURITY");
    expect(migration).toContain("AS RESTRICTIVE");
    expect(migration).toContain("USING (false) WITH CHECK (false)");
    expect(migration).toContain("REVOKE ALL ON TABLE private.workdesk_text_task_events");
    expect(migration).toContain("GRANT SELECT, INSERT ON TABLE private.workdesk_text_task_events TO service_role");
  });

  it("keeps original AI output immutable and persists owner edits separately with audit evidence", () => {
    const saveStart = service.indexOf("export async function saveWorkDeskTextTaskResult");
    const saveBody = service.slice(saveStart);
    expect(saveBody).toContain("edited_result_text = ${clean}");
    expect(saveBody).toContain("edited_result_updated_at = now()");
    expect(saveBody).not.toContain("SET result_text = ${clean}");
    expect(saveBody).toContain("'edited'");
    expect(service).toContain("originalResult:");
    expect(service).toContain("editedResult:");
  });

  it("runs scanner-independent text tasks from the authenticated scheduled worker", () => {
    expect(worker).toContain("runWorkDeskTextTaskBatch(1)");
    expect(worker).toContain("runDocumentTaskBatch(1)");
    expect(worker).toContain("process.env.SUPABASE_CRON_SECRET");
  });
});
