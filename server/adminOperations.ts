import { sql } from "drizzle-orm";
import { getDb } from "./db";
import { fileUploadAvailability, malwareScannerStatus } from "./fileSecurity";

/** Convert PostgreSQL bigint/count values to safe, non-negative JSON numbers. */
export function normalizeOperationsCount(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : 0;
}

/**
 * Read-only operator snapshot. It deliberately returns aggregate counts only:
 * no user PII, document content, recipient addresses, tokens, or provider secrets.
 */
export async function getAdminOperationsSnapshot() {
  const db = await getDb();
  if (!db) throw new Error("operations_database_unavailable");

  const result = await db.execute(sql`
    SELECT
      (SELECT count(*)::int FROM public.users) AS accounts_total,
      (SELECT count(*)::int FROM public.users WHERE role = 'admin') AS accounts_admins,

      (SELECT count(*)::int FROM public.file_assets) AS files_total,
      (SELECT count(*)::int FROM public.file_assets WHERE "scanStatus" = 'quarantined') AS files_quarantined,
      (SELECT count(*)::int FROM public.file_assets WHERE "scanStatus" = 'clean') AS files_clean,
      (SELECT count(*)::int FROM public.file_assets WHERE "scanStatus" = 'infected') AS files_infected,
      (SELECT count(*)::int FROM public.file_assets WHERE "scanStatus" IN ('error', 'expired')) AS files_unavailable,

      (SELECT count(*)::int FROM private.document_tasks) AS documents_total,
      (SELECT count(*)::int FROM private.document_tasks WHERE status = 'queued') AS documents_queued,
      (SELECT count(*)::int FROM private.document_tasks WHERE status = 'running') AS documents_running,
      (SELECT count(*)::int FROM private.document_tasks WHERE status = 'retry_wait') AS documents_retry_wait,
      (SELECT count(*)::int FROM private.document_tasks WHERE status = 'completed') AS documents_completed,
      (SELECT count(*)::int FROM private.document_tasks WHERE status = 'failed') AS documents_failed,

      (SELECT count(*)::int FROM private.document_knowledge_documents) AS knowledge_documents,
      (SELECT count(*)::int FROM private.document_knowledge_documents WHERE status = 'ready') AS knowledge_ready,
      (SELECT count(*)::int FROM private.document_knowledge_documents WHERE status IN ('queued', 'extracting', 'chunking', 'embedding')) AS knowledge_processing,
      (SELECT count(*)::int FROM private.document_knowledge_documents WHERE status = 'failed') AS knowledge_failed,
      (SELECT count(*)::int FROM private.document_knowledge_chunks) AS knowledge_chunks,

      (SELECT count(*)::int FROM private.workdesk_text_tasks) AS ai_tasks_total,
      (SELECT count(*)::int FROM private.workdesk_text_tasks WHERE status = 'queued') AS ai_tasks_queued,
      (SELECT count(*)::int FROM private.workdesk_text_tasks WHERE status = 'running') AS ai_tasks_running,
      (SELECT count(*)::int FROM private.workdesk_text_tasks WHERE status = 'completed') AS ai_tasks_completed,
      (SELECT count(*)::int FROM private.workdesk_text_tasks WHERE status = 'failed') AS ai_tasks_failed,

      (SELECT count(*)::int FROM public.lead_records WHERE "archivedAt" IS NULL) AS crm_total,
      (SELECT count(*)::int FROM public.lead_records WHERE status = 'new' AND "archivedAt" IS NULL) AS crm_new,
      (SELECT count(*)::int FROM public.lead_records WHERE status = 'qualified' AND "archivedAt" IS NULL) AS crm_qualified,
      (SELECT count(*)::int FROM public.lead_records WHERE status = 'contacted' AND "archivedAt" IS NULL) AS crm_contacted,
      (SELECT count(*)::int FROM public.lead_records WHERE status = 'interested' AND "archivedAt" IS NULL) AS crm_interested,
      (SELECT count(*)::int FROM public.lead_records WHERE status = 'converted' AND "archivedAt" IS NULL) AS crm_converted,
      (SELECT count(*)::int FROM public.lead_records WHERE status = 'lost' AND "archivedAt" IS NULL) AS crm_lost,
      (SELECT count(*)::int FROM public.lead_activities) AS crm_activities,

      (SELECT count(*)::int FROM public.lead_records
        WHERE "nextFollowUpAt" IS NOT NULL AND "nextFollowUpAt" < now()
          AND status NOT IN ('converted', 'lost') AND "archivedAt" IS NULL) AS crm_overdue_followups,
      (SELECT count(*)::int FROM public.lead_records
        WHERE "nextFollowUpAt" IS NOT NULL AND "nextFollowUpAt" >= now()
          AND status NOT IN ('converted', 'lost') AND "archivedAt" IS NULL) AS crm_scheduled_followups,

      (SELECT count(*)::int FROM private.contract_acknowledgments) AS acknowledgments_total,
      (SELECT count(*)::int FROM private.contract_acknowledgments WHERE status = 'acknowledged') AS acknowledgments_confirmed,
      (SELECT count(*)::int FROM private.contract_acknowledgments WHERE status = 'pending' AND expires_at > now()) AS acknowledgments_pending,
      (SELECT count(*)::int FROM private.contract_acknowledgments WHERE status = 'pending' AND expires_at <= now()) AS acknowledgments_expired,
      (SELECT count(*)::int FROM private.contract_acknowledgment_events) AS acknowledgment_events,

      (SELECT count(*)::int FROM public.agent_traces) AS agents_total,
      (SELECT count(*)::int FROM public.agent_traces WHERE status = 'queued') AS agents_queued,
      (SELECT count(*)::int FROM public.agent_traces WHERE status = 'running') AS agents_running,
      (SELECT count(*)::int FROM public.agent_traces WHERE status = 'paused_for_approval') AS agents_approval,
      (SELECT count(*)::int FROM public.agent_traces WHERE status = 'completed') AS agents_completed,
      (SELECT count(*)::int FROM public.agent_traces WHERE status = 'failed') AS agents_failed,

      (SELECT count(*)::int FROM public.benchmark_runs) AS benchmarks_total,
      (SELECT count(*)::int FROM public.benchmark_runs WHERE status = 'passed') AS benchmarks_passed,
      (SELECT count(*)::int FROM public.benchmark_runs WHERE status = 'failed') AS benchmarks_failed,
      (SELECT max("createdAt") FROM public.benchmark_runs) AS benchmark_latest_at,
      (SELECT count(*)::int FROM public.release_gate_checks) AS gates_total,
      (SELECT count(*)::int FROM public.release_gate_checks WHERE status = 'pass') AS gates_passed,
      (SELECT count(*)::int FROM public.release_gate_checks WHERE status = 'fail') AS gates_failed,
      (SELECT count(*)::int FROM public.release_gate_checks WHERE status = 'pending') AS gates_pending
  `);

  const row = result[0] as Record<string, unknown> | undefined;
  if (!row) throw new Error("operations_snapshot_empty");
  const n = (key: string) => normalizeOperationsCount(row[key]);
  const scanner = malwareScannerStatus();
  const upload = fileUploadAvailability(scanner);

  return {
    source: "postgresql" as const,
    observedAt: new Date().toISOString(),
    accounts: { total: n("accounts_total"), admins: n("accounts_admins") },
    fileSecurity: {
      total: n("files_total"),
      quarantined: n("files_quarantined"),
      clean: n("files_clean"),
      infected: n("files_infected"),
      unavailable: n("files_unavailable"),
      storageConfigured: scanner.storageConfigured,
      storageProvider: scanner.storageProvider,
      scannerCredentialsConfigured: scanner.scannerConfigured,
      uploadMode: upload.uploadMode,
      failClosed: scanner.failClosed,
    },
    documentPipeline: {
      total: n("documents_total"),
      queued: n("documents_queued"),
      running: n("documents_running"),
      retryWait: n("documents_retry_wait"),
      completed: n("documents_completed"),
      failed: n("documents_failed"),
    },
    knowledgeHub: {
      documents: n("knowledge_documents"),
      ready: n("knowledge_ready"),
      processing: n("knowledge_processing"),
      failed: n("knowledge_failed"),
      chunks: n("knowledge_chunks"),
    },
    aiWorkdesk: {
      total: n("ai_tasks_total"),
      queued: n("ai_tasks_queued"),
      running: n("ai_tasks_running"),
      completed: n("ai_tasks_completed"),
      failed: n("ai_tasks_failed"),
    },
    crmPipeline: {
      total: n("crm_total"),
      new: n("crm_new"),
      qualified: n("crm_qualified"),
      contacted: n("crm_contacted"),
      interested: n("crm_interested"),
      converted: n("crm_converted"),
      lost: n("crm_lost"),
      activities: n("crm_activities"),
    },
    crmFollowups: {
      overdue: n("crm_overdue_followups"),
      scheduled: n("crm_scheduled_followups"),
    },
    acknowledgments: {
      total: n("acknowledgments_total"),
      pending: n("acknowledgments_pending"),
      confirmed: n("acknowledgments_confirmed"),
      expired: n("acknowledgments_expired"),
      events: n("acknowledgment_events"),
    },
    agentOperations: {
      total: n("agents_total"),
      queued: n("agents_queued"),
      running: n("agents_running"),
      approval: n("agents_approval"),
      completed: n("agents_completed"),
      failed: n("agents_failed"),
    },
    qualityRelease: {
      benchmarks: n("benchmarks_total"),
      benchmarkPassed: n("benchmarks_passed"),
      benchmarkFailed: n("benchmarks_failed"),
      benchmarkLatestAt: row.benchmark_latest_at ? new Date(row.benchmark_latest_at as string | Date).toISOString() : null,
      gates: n("gates_total"),
      gatePassed: n("gates_passed"),
      gateFailed: n("gates_failed"),
      gatePending: n("gates_pending"),
    },
  };
}
