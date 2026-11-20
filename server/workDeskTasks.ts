import { randomUUID } from "node:crypto";
import { and, eq, inArray, sql } from "drizzle-orm";
import { documentTasks, documentTaskEvents } from "../drizzle/schema";
import { getDb } from "./db";
import { getCleanFileAsset, malwareScannerStatus, sha256Hex } from "./fileSecurity";
import { readPrivateFile } from "./fileUploadService";

const MAX_EXTRACTED_CHARS = 250_000;
const LEASE_SECONDS = 90;
const MAX_ATTEMPTS = 3;

type Language = "bn" | "en" | "auto";
type TaskRow = typeof documentTasks.$inferSelect;

function publicTask(row: TaskRow, includeResult = false) {
  return {
    id: row.id,
    fileAssetId: row.fileAssetId,
    taskType: row.taskType,
    status: row.status,
    language: row.language,
    attemptCount: row.attemptCount,
    maxAttempts: row.maxAttempts,
    errorCode: row.errorCode,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    completedAt: row.completedAt,
    hasResult: row.status === "completed",
    result: includeResult && row.status === "completed" ? row.resultJson : null,
  };
}

export function decodeSupportedText(bytes: Buffer, mimeType: string): { text: string; format: string } {
  // Deliberately support only formats with deterministic, dependency-free extraction.
  // PDF, DOCX, XLSX, ZIP and image OCR remain unavailable until separately implemented/tested.
  if (!["text/plain", "text/csv", "application/json"].includes(mimeType)) {
    throw Object.assign(new Error("unsupported-extraction-format"), { code: "UNSUPPORTED_FORMAT", retryable: false });
  }
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw Object.assign(new Error("invalid-utf8"), { code: "INVALID_ENCODING", retryable: false });
  }
  if (text.includes("\0") || text.length > MAX_EXTRACTED_CHARS) {
    throw Object.assign(new Error("document-content-out-of-bounds"), { code: "CONTENT_LIMIT", retryable: false });
  }
  if (mimeType === "application/json") {
    try { JSON.parse(text); } catch {
      throw Object.assign(new Error("invalid-json-document"), { code: "INVALID_DOCUMENT", retryable: false });
    }
  }
  return { text, format: mimeType === "text/plain" ? "text" : mimeType === "text/csv" ? "csv" : "json" };
}

async function recordEvent(tx: any, taskId: string, userId: number, eventType: string, attemptCount: number, detail: Record<string, unknown> = {}) {
  await tx.insert(documentTaskEvents).values({
    taskId,
    userId,
    eventType,
    attemptCount,
    detailJson: detail,
  });
}

export async function createDocumentTask(input: {
  userId: number;
  fileAssetId: number;
  idempotencyKey: string;
  language: Language;
}) {
  const scanner = malwareScannerStatus();
  if (!scanner.scannerConfigured || !scanner.storageConfigured) {
    throw Object.assign(new Error("document-processing-security-gate-closed"), { code: "SCANNER_UNAVAILABLE" });
  }
  const asset = await getCleanFileAsset(input.userId, input.fileAssetId);
  if (!asset) throw Object.assign(new Error("clean-file-not-found"), { code: "FILE_NOT_READY" });
  if (!["text/plain", "text/csv", "application/json"].includes(asset.mimeType)) {
    throw Object.assign(new Error("unsupported-extraction-format"), { code: "UNSUPPORTED_FORMAT" });
  }
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");

  const [existing] = await db.select().from(documentTasks).where(and(
    eq(documentTasks.userId, input.userId),
    eq(documentTasks.idempotencyKey, input.idempotencyKey),
  )).limit(1);
  if (existing) {
    if (existing.fileAssetId !== input.fileAssetId || existing.contentSha256 !== asset.sha256) {
      throw Object.assign(new Error("idempotency-key-conflict"), { code: "IDEMPOTENCY_CONFLICT" });
    }
    return (await getDocumentTask(input.userId, existing.id)) ?? publicTask(existing);
  }

  const taskId = randomUUID();
  const [created] = await db.transaction(async tx => {
    const rows = await tx.insert(documentTasks).values({
      id: taskId,
      userId: input.userId,
      fileAssetId: input.fileAssetId,
      taskType: "extract_text",
      status: "queued",
      language: input.language,
      idempotencyKey: input.idempotencyKey,
      contentSha256: asset.sha256,
      maxAttempts: MAX_ATTEMPTS,
    }).onConflictDoNothing().returning();
    if (!rows.length) {
      const [prior] = await tx.select().from(documentTasks).where(and(
        eq(documentTasks.userId, input.userId),
        eq(documentTasks.idempotencyKey, input.idempotencyKey),
      )).limit(1);
      if (!prior || prior.fileAssetId !== input.fileAssetId || prior.contentSha256 !== asset.sha256) {
        throw Object.assign(new Error("idempotency-key-conflict"), { code: "IDEMPOTENCY_CONFLICT" });
      }
      return [prior];
    }
    await recordEvent(tx, taskId, input.userId, "created", 0, { language: input.language });
    return rows;
  });
  // Persist first, then opportunistically drain one durable queue item inside the request.
  // If execution is interrupted, the committed row remains recoverable by the scheduled worker.
  await runDocumentTaskBatch(1, input.userId).catch(error => {
    console.warn("[WorkDesk] Opportunistic worker deferred:", error instanceof Error ? error.name : "unknown");
  });
  const latest = await getDocumentTask(input.userId, created.id);
  return latest ?? publicTask(created);
}

export async function listDocumentTasks(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const rows = await db.select().from(documentTasks)
    .where(eq(documentTasks.userId, userId))
    .orderBy(sql`${documentTasks.createdAt} desc`)
    .limit(limit);
  return rows.map(row => publicTask(row));
}

export async function getDocumentTask(userId: number, taskId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const [row] = await db.select().from(documentTasks).where(and(
    eq(documentTasks.id, taskId),
    eq(documentTasks.userId, userId),
  )).limit(1);
  return row ? publicTask(row, true) : null;
}

export async function cancelDocumentTask(userId: number, taskId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async tx => {
    const [row] = await tx.select().from(documentTasks).where(and(
      eq(documentTasks.id, taskId),
      eq(documentTasks.userId, userId),
    )).limit(1);
    if (!row) return null;
    if (["completed", "failed", "cancelled"].includes(row.status)) return publicTask(row);
    const now = new Date();
    const nextStatus = "cancelled";
    const [updated] = await tx.update(documentTasks).set({
      status: nextStatus,
      cancelRequestedAt: now,
      completedAt: now,
      leaseToken: null,
      leaseExpiresAt: null,
      updatedAt: now,
    }).where(and(
      eq(documentTasks.id, taskId),
      eq(documentTasks.userId, userId),
      inArray(documentTasks.status, ["queued", "running", "retry_wait"]),
    )).returning();
    if (!updated) return publicTask(row);
    await recordEvent(tx, taskId, userId, "cancel_requested", row.attemptCount);
    await recordEvent(tx, taskId, userId, "cancelled", row.attemptCount);
    return publicTask(updated);
  });
}


export async function retryDocumentTask(userId: number, taskId: string) {
  const current = await getDocumentTask(userId, taskId);
  if (!current) return null;
  if (current.status !== "failed") return current;
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const [task] = await db.select().from(documentTasks).where(and(
    eq(documentTasks.id, taskId),
    eq(documentTasks.userId, userId),
    eq(documentTasks.status, "failed"),
  )).limit(1);
  if (!task) return getDocumentTask(userId, taskId);
  const asset = await getCleanFileAsset(userId, task.fileAssetId);
  if (!asset || asset.sha256 !== task.contentSha256) {
    throw Object.assign(new Error("clean-file-not-found"), { code: "FILE_NOT_READY" });
  }
  const result = await db.transaction(async tx => {
    const [updated] = await tx.update(documentTasks).set({
      status: "queued",
      attemptCount: 0,
      nextRetryAt: null,
      cancelRequestedAt: null,
      leaseToken: null,
      leaseExpiresAt: null,
      errorCode: null,
      errorMessage: null,
      completedAt: null,
      updatedAt: new Date(),
    }).where(and(
      eq(documentTasks.id, taskId),
      eq(documentTasks.userId, userId),
      eq(documentTasks.status, "failed"),
    )).returning();
    if (updated) await recordEvent(tx, taskId, userId, "retry_scheduled", 0, { manual: true });
    return updated ? publicTask(updated) : null;
  });
  if (!result) return getDocumentTask(userId, taskId);
  await runDocumentTaskBatch(1, userId).catch(error => {
    console.warn("[WorkDesk] Retry worker deferred:", error instanceof Error ? error.name : "unknown");
  });
  return (await getDocumentTask(userId, taskId)) ?? result;
}

async function claimNextTask(ownerUserId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const leaseToken = randomUUID();
  const result = await db.execute(sql`
    WITH candidate AS (
      SELECT id FROM private.document_tasks
      WHERE cancel_requested_at IS NULL
        AND (${ownerUserId ?? null}::integer IS NULL OR user_id = ${ownerUserId ?? null})
        AND attempt_count < max_attempts
        AND (
          status = 'queued'
          OR (status = 'retry_wait' AND next_retry_at <= now())
          OR (status = 'running' AND lease_expires_at < now())
        )
      ORDER BY created_at
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    ),
    claimed AS (
      UPDATE private.document_tasks AS task
      SET status = 'running',
          attempt_count = task.attempt_count + 1,
          lease_token = ${leaseToken}::uuid,
          lease_expires_at = now() + make_interval(secs => ${LEASE_SECONDS}),
          started_at = COALESCE(task.started_at, now()),
          updated_at = now()
      FROM candidate
      WHERE task.id = candidate.id
      RETURNING task.id, task.user_id, task.attempt_count
    ),
    audit AS (
      INSERT INTO private.document_task_events (task_id, user_id, event_type, attempt_count, detail_json)
      SELECT id, user_id, 'claimed', attempt_count, '{}'::jsonb FROM claimed
    )
    SELECT id FROM claimed
  `);
  const claimedId = (result as unknown as Array<{ id: string }>)[0]?.id;
  if (!claimedId) return null;
  const [row] = await db.select().from(documentTasks).where(eq(documentTasks.id, claimedId)).limit(1);
  return row ? { row, leaseToken } : null;
}

export async function processOwnDocumentTasks(userId: number) {
  return runDocumentTaskBatch(1, userId);
}

export async function runDocumentTaskBatch(batchSize = 2, ownerUserId?: number) {
  const scanner = malwareScannerStatus();
  if (!scanner.scannerConfigured || !scanner.storageConfigured) {
    return { accepted: false as const, reason: "scanner-unavailable", processed: 0 };
  }
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  // A worker that died on its final lease must not leave the task permanently running.
  await db.execute(sql`
    WITH expired AS (
      UPDATE private.document_tasks
      SET status = 'failed',
          error_code = 'WORKER_LEASE_EXPIRED',
          error_message = 'Worker lease expired after the maximum number of attempts',
          lease_token = NULL,
          lease_expires_at = NULL,
          completed_at = now(),
          updated_at = now()
      WHERE status = 'running'
        AND (${ownerUserId ?? null}::integer IS NULL OR user_id = ${ownerUserId ?? null})
        AND lease_expires_at < now()
        AND attempt_count >= max_attempts
      RETURNING id, user_id, attempt_count
    )
    INSERT INTO private.document_task_events (task_id, user_id, event_type, attempt_count, detail_json)
    SELECT id, user_id, 'failed', attempt_count, '{"errorCode":"WORKER_LEASE_EXPIRED"}'::jsonb FROM expired
  `);
  let processed = 0;
  for (let index = 0; index < Math.min(Math.max(batchSize, 1), 5); index += 1) {
    const claimed = await claimNextTask(ownerUserId);
    if (!claimed) break;
    const { row, leaseToken } = claimed;
    try {
      // Re-check owner, retention and clean scanner state at execution time.
      const asset = await getCleanFileAsset(row.userId, row.fileAssetId);
      if (!asset || asset.sha256 !== row.contentSha256) {
        throw Object.assign(new Error("file-security-state-changed"), { code: "FILE_NOT_CLEAN", retryable: false });
      }
      const bytes = await readPrivateFile(asset.storageKey);
      if (bytes.length !== asset.byteSize || sha256Hex(bytes) !== asset.sha256) {
        throw Object.assign(new Error("stored-file-integrity-check-failed"), { code: "INTEGRITY_FAILURE", retryable: false });
      }
      const extracted = decodeSupportedText(bytes, asset.mimeType);
      const normalizedText = extracted.text.normalize("NFC");
      const resultJson = {
        language: row.language,
        format: extracted.format,
        title: asset.originalName,
        text: normalizedText,
        characterCount: Array.from(normalizedText).length,
        sha256: asset.sha256,
        generatedAt: new Date().toISOString(),
        messages: row.language === "en"
          ? { title: "Text extraction complete", status: "Your document text is ready." }
          : { title: "নথির লেখা সংগ্রহ সম্পন্ন", status: "আপনার নথির লেখা প্রস্তুত।" },
      };
      const completed = await db.transaction(async tx => {
        const [updated] = await tx.update(documentTasks).set({
          status: "completed",
          resultJson,
          extractedText: normalizedText,
          errorCode: null,
          errorMessage: null,
          leaseToken: null,
          leaseExpiresAt: null,
          completedAt: new Date(),
          updatedAt: new Date(),
        }).where(and(
          eq(documentTasks.id, row.id),
          eq(documentTasks.leaseToken, leaseToken),
          eq(documentTasks.status, "running"),
        )).returning();
        if (updated) await recordEvent(tx, row.id, row.userId, "completed", row.attemptCount, { format: extracted.format, characterCount: Array.from(normalizedText).length });
        return Boolean(updated);
      });
      if (completed) processed += 1;
    } catch (error) {
      const code = (error as { code?: string }).code || "EXTRACTION_FAILED";
      const retryable = (error as { retryable?: boolean }).retryable !== false;
      const message = error instanceof Error ? error.message.slice(0, 500) : "document-task-failed";
      await db.transaction(async tx => {
        const [current] = await tx.select().from(documentTasks).where(and(
          eq(documentTasks.id, row.id),
          eq(documentTasks.leaseToken, leaseToken),
        )).limit(1);
        if (!current) return;
        const cancelled = current.status === "cancelled" || Boolean(current.cancelRequestedAt);
        const shouldRetry = !cancelled && retryable && current.attemptCount < current.maxAttempts;
        const now = new Date();
        const delaySeconds = Math.min(300, 15 * (2 ** Math.max(0, current.attemptCount - 1)));
        const [updated] = await tx.update(documentTasks).set({
          status: cancelled ? "cancelled" : shouldRetry ? "retry_wait" : "failed",
          nextRetryAt: shouldRetry ? new Date(now.getTime() + delaySeconds * 1000) : null,
          errorCode: code,
          errorMessage: message,
          leaseToken: null,
          leaseExpiresAt: null,
          completedAt: shouldRetry ? null : now,
          updatedAt: now,
        }).where(and(eq(documentTasks.id, row.id), eq(documentTasks.leaseToken, leaseToken))).returning();
        if (updated) await recordEvent(tx, row.id, row.userId,
          cancelled ? "cancelled" : shouldRetry ? "retry_scheduled" : "failed",
          row.attemptCount, { errorCode: code, retryable });
      });
    }
  }
  return { accepted: true as const, processed };
}
