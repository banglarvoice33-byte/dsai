import { createHash, randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import { getDb } from "./db";

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const MAX_SNAPSHOT_CHARS = 30_000;
const MIN_VIEW_SECONDS = 3;

export type ContractSnapshot = { version: 1; title: string; body: string };

export function createContractSnapshot(title: string, body: string): ContractSnapshot {
  const normalizedTitle = title.normalize("NFC").trim();
  const normalizedBody = body.replace(/\r\n?/g, "\n").normalize("NFC");
  if (!normalizedTitle || normalizedTitle.length > 240) throw new Error("invalid_document_title");
  if (!normalizedBody.trim() || normalizedBody.length > MAX_SNAPSHOT_CHARS) throw new Error("invalid_document_body");
  return { version: 1, title: normalizedTitle, body: normalizedBody };
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function hashAcknowledgmentToken(token: string): string {
  if (!TOKEN_PATTERN.test(token)) throw new Error("invalid_acknowledgment_token");
  return sha256Hex(token);
}

export function contractAcknowledgmentEnabled(): boolean {
  return process.env.CONTRACT_ACKNOWLEDGMENT_ENABLED === "true";
}

function unavailableStatus() {
  return { status: "disabled" as const, message: "নথি গ্রহণ নিশ্চিতকরণ এখনো চালু হয়নি।" };
}

export async function createContractAcknowledgment(input: {
  userId: number;
  title: string;
  body: string;
  recipientName: string;
  recipientEmail: string;
}) {
  if (!contractAcknowledgmentEnabled()) throw new Error("acknowledgment_disabled");
  const db = await getDb();
  if (!db) throw new Error("database_unavailable");

  const snapshot = createContractSnapshot(input.title, input.body);
  const snapshotJson = JSON.stringify(snapshot);
  const documentSha256 = sha256Hex(snapshotJson);
  const token = randomBytes(32).toString("base64url");
  const tokenHash = sha256Hex(token);
  const recipientName = input.recipientName.normalize("NFC").trim();
  const recipientEmail = input.recipientEmail.trim().toLowerCase();
  if (recipientName.length < 2 || recipientName.length > 160) throw new Error("invalid_recipient_name");
  if (recipientEmail.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) throw new Error("invalid_recipient_email");

  const result = await db.transaction(async tx => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('dsai.contract_ack'), ${input.userId})`);
    const usageRows = await tx.execute(sql`
      SELECT count(*)::int AS used
      FROM private.contract_acknowledgments
      WHERE owner_user_id = ${input.userId}
        AND created_at >= date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
    `);
    if (Number((usageRows[0] as { used?: number } | undefined)?.used ?? 0) >= 20) {
      throw new Error("daily_limit_reached");
    }
    const inserted = await tx.execute(sql`
      INSERT INTO private.contract_acknowledgments
        (owner_user_id, token_hash, document_snapshot, document_sha256, recipient_name, recipient_email, expires_at)
      VALUES
        (${input.userId}, ${tokenHash}, ${snapshotJson}::jsonb, ${documentSha256}, ${recipientName}, ${recipientEmail}, now() + interval '7 days')
      RETURNING id, expires_at
    `);
    const row = inserted[0] as { id: string; expires_at: Date | string } | undefined;
    if (!row) throw new Error("acknowledgment_create_failed");
    await tx.execute(sql`
      INSERT INTO private.contract_acknowledgment_events (acknowledgment_id, event_type, document_sha256)
      VALUES (${row.id}::uuid, 'created', ${documentSha256})
    `);
    return row;
  });

  return {
    id: result.id,
    token,
    documentSha256,
    expiresAt: new Date(result.expires_at).toISOString(),
  };
}

export async function listContractAcknowledgments(userId: number) {
  if (!contractAcknowledgmentEnabled()) return [];
  const db = await getDb();
  if (!db) throw new Error("database_unavailable");
  const rows = await db.execute(sql`
    SELECT id, document_snapshot->>'title' AS title, recipient_name, recipient_email,
           status, document_sha256, created_at, expires_at, first_viewed_at, acknowledged_at,
           acknowledgment_name
    FROM private.contract_acknowledgments
    WHERE owner_user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 50
  `);
  return rows;
}

/** Read the immutable snapshot without starting the recipient's view timer. */
export async function openContractAcknowledgment(token: string) {
  if (!contractAcknowledgmentEnabled()) return unavailableStatus();
  let tokenHash: string;
  try { tokenHash = hashAcknowledgmentToken(token); } catch { return { status: "invalid" as const }; }
  const db = await getDb();
  if (!db) throw new Error("database_unavailable");
  const rows = await db.execute(sql`
    SELECT document_snapshot, document_sha256, recipient_name, status,
           expires_at, expires_at <= now() AS is_expired,
           first_viewed_at, acknowledged_at, acknowledgment_name
    FROM private.contract_acknowledgments
    WHERE token_hash = ${tokenHash}
    LIMIT 1
  `);
  const row = rows[0] as Record<string, any> | undefined;
  if (!row) return { status: "invalid" as const };
  if (row.is_expired && row.status !== "acknowledged") return { status: "expired" as const };
  const status = row.status === "acknowledged" ? "acknowledged" : "pending";
  return {
    status,
    snapshot: row.document_snapshot as ContractSnapshot,
    documentSha256: row.document_sha256,
    recipientName: row.recipient_name,
    firstViewedAt: row.first_viewed_at ? new Date(row.first_viewed_at).toISOString() : null,
    expiresAt: new Date(row.expires_at).toISOString(),
    acknowledgedAt: row.acknowledged_at ? new Date(row.acknowledged_at).toISOString() : null,
    acknowledgmentName: row.acknowledgment_name,
  };
}

/**
 * Start the minimum-view timer only after the client has received and rendered the snapshot.
 * The database timestamp, not the browser clock, remains authoritative for confirmation.
 */
export async function markContractAcknowledgmentViewed(token: string) {
  if (!contractAcknowledgmentEnabled()) return unavailableStatus();
  let tokenHash: string;
  try { tokenHash = hashAcknowledgmentToken(token); } catch { return { status: "invalid" as const }; }
  const db = await getDb();
  if (!db) throw new Error("database_unavailable");

  return db.transaction(async tx => {
    const rows = await tx.execute(sql`
      SELECT id, status, expires_at, expires_at <= now() AS is_expired,
             first_viewed_at, document_sha256, acknowledged_at, acknowledgment_name
      FROM private.contract_acknowledgments
      WHERE token_hash = ${tokenHash}
      FOR UPDATE
    `);
    const row = rows[0] as Record<string, any> | undefined;
    if (!row) return { status: "invalid" as const };
    if (row.status === "acknowledged") {
      return { status: "acknowledged" as const, firstViewedAt: row.first_viewed_at ? new Date(row.first_viewed_at).toISOString() : null, acknowledgedAt: row.acknowledged_at ? new Date(row.acknowledged_at).toISOString() : null, acknowledgmentName: row.acknowledgment_name };
    }
    if (row.is_expired) return { status: "expired" as const };
    let firstViewedAt = row.first_viewed_at;
    if (!firstViewedAt) {
      const updated = await tx.execute(sql`
        UPDATE private.contract_acknowledgments
        SET first_viewed_at = now()
        WHERE id = ${row.id}::uuid AND first_viewed_at IS NULL
        RETURNING first_viewed_at
      `);
      firstViewedAt = (updated[0] as { first_viewed_at?: Date | string } | undefined)?.first_viewed_at;
      if (!firstViewedAt) throw new Error("acknowledgment_view_start_failed");
      await tx.execute(sql`
        INSERT INTO private.contract_acknowledgment_events (acknowledgment_id, event_type, document_sha256)
        VALUES (${row.id}::uuid, 'viewed', ${row.document_sha256})
      `);
    }
    return { status: "pending" as const, firstViewedAt: new Date(firstViewedAt).toISOString() };
  });
}

export async function confirmContractAcknowledgment(token: string, acknowledgmentName: string) {
  if (!contractAcknowledgmentEnabled()) return unavailableStatus();
  let tokenHash: string;
  try { tokenHash = hashAcknowledgmentToken(token); } catch { return { status: "invalid" as const }; }
  const name = acknowledgmentName.normalize("NFC").trim();
  if (name.length < 2 || name.length > 160) return { status: "invalid_name" as const };
  const db = await getDb();
  if (!db) throw new Error("database_unavailable");

  return db.transaction(async tx => {
    const updated = await tx.execute(sql`
      UPDATE private.contract_acknowledgments
      SET status = 'acknowledged', acknowledged_at = now(), acknowledgment_name = ${name}
      WHERE token_hash = ${tokenHash}
        AND status = 'pending'
        AND expires_at > now()
        AND first_viewed_at IS NOT NULL
        AND first_viewed_at <= now() - interval '3 seconds'
      RETURNING id, document_sha256, acknowledged_at, acknowledgment_name
    `);
    const row = updated[0] as { id: string; document_sha256: string; acknowledged_at: Date | string; acknowledgment_name: string } | undefined;
    if (row) {
      await tx.execute(sql`
        INSERT INTO private.contract_acknowledgment_events
          (acknowledgment_id, event_type, document_sha256, acknowledgment_name)
        VALUES (${row.id}::uuid, 'acknowledged', ${row.document_sha256}, ${name})
      `);
      return { status: "acknowledged" as const, documentSha256: row.document_sha256, acknowledgedAt: new Date(row.acknowledged_at).toISOString(), acknowledgmentName: row.acknowledgment_name };
    }

    const existingRows = await tx.execute(sql`
      SELECT id, status, expires_at, expires_at <= now() AS is_expired,
             first_viewed_at, acknowledged_at, document_sha256, acknowledgment_name,
             first_viewed_at + interval '3 seconds' AS confirm_at,
             (first_viewed_at IS NOT NULL AND first_viewed_at + interval '3 seconds' > now()) AS is_waiting
      FROM private.contract_acknowledgments
      WHERE token_hash = ${tokenHash}
      LIMIT 1
    `);
    const existing = existingRows[0] as Record<string, any> | undefined;
    if (!existing) return { status: "invalid" as const };
    if (existing.status === "acknowledged") return { status: "already_acknowledged" as const, documentSha256: existing.document_sha256, acknowledgedAt: new Date(existing.acknowledged_at).toISOString(), acknowledgmentName: existing.acknowledgment_name };
    if (existing.is_expired) return { status: "expired" as const };
    if (!existing.first_viewed_at) return { status: "not_opened" as const };
    if (existing.is_waiting) return { status: "wait" as const, confirmAt: new Date(existing.confirm_at).toISOString() };
    return { status: "unavailable" as const };
  });
}
