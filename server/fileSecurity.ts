import { createHash } from "node:crypto";
import { and, eq, gt, lte } from "drizzle-orm";
import { fileAssets, type FileAsset } from "../drizzle/schema";
import { getDb } from "./db";
import { deletePrivateFile } from "./fileUploadService";

export const FILE_MAX_BYTES = 10 * 1024 * 1024;
export const FILE_RETENTION_DAYS = 7;
const SAFE_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/json",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function normalizeUploadName(name: string) {
  const normalized = name.normalize("NFKC").replace(/[\\/\0\r\n]/g, "_").trim();
  return normalized.slice(0, 255) || "unnamed-file";
}

export function validateUploadMetadata(input: { originalName: string; mimeType: string; byteSize: number; sha256: string }) {
  const originalName = normalizeUploadName(input.originalName);
  if (!SAFE_MIME_TYPES.has(input.mimeType)) throw new Error("Unsupported file type");
  if (!Number.isInteger(input.byteSize) || input.byteSize < 1 || input.byteSize > FILE_MAX_BYTES) throw new Error("File size exceeds the safe upload limit");
  if (!/^[a-f0-9]{64}$/i.test(input.sha256)) throw new Error("Invalid SHA-256 checksum");
  return { ...input, originalName, sha256: input.sha256.toLowerCase() };
}

export function quarantineStorageKey(userId: number, originalName: string, nonce: string) {
  const safeName = normalizeUploadName(originalName).replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${userId}/quarantine/${nonce}-${safeName}`.slice(0, 512);
}

export async function registerQuarantinedFileAsset(input: {
  userId: number;
  originalName: string;
  mimeType: string;
  byteSize: number;
  sha256: string;
  storageKey: string;
  retentionDays?: number;
}) {
  const validated = validateUploadMetadata(input);
  const expectedPrefix = `${input.userId}/quarantine/`;
  if (!input.storageKey.startsWith(expectedPrefix)) throw new Error("File must be registered in the user's quarantine namespace");
  const retentionDays = Math.min(Math.max(Math.trunc(input.retentionDays ?? FILE_RETENTION_DAYS), 1), 30);
  const retentionExpiresAt = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(fileAssets).values({
    userId: input.userId,
    storageKey: input.storageKey,
    originalName: validated.originalName,
    mimeType: validated.mimeType,
    byteSize: validated.byteSize,
    sha256: validated.sha256,
    scanStatus: "quarantined",
    retentionExpiresAt,
  });
  const rows = await db.select().from(fileAssets).where(eq(fileAssets.storageKey, input.storageKey)).limit(1);
  return rows[0];
}

export async function registerCleanFileAsset(input: { userId: number; originalName: string; mimeType: string; byteSize: number; sha256: string; storageKey: string }) {
  const validated = validateUploadMetadata(input);
  if (!input.storageKey.startsWith(String(input.userId) + "/")) throw new Error("Invalid owner storage namespace");
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const retentionExpiresAt = new Date(Date.now() + FILE_RETENTION_DAYS * 86400000);
  const [asset] = await db.insert(fileAssets).values({ userId: input.userId, storageKey: input.storageKey, originalName: validated.originalName, mimeType: validated.mimeType, byteSize: validated.byteSize, sha256: validated.sha256, scanStatus: "clean", scanProvider: "clamav", scanMessage: "ClamAV scan passed", scannedAt: new Date(), retentionExpiresAt }).returning();
  return asset;
}

export async function listUserFileAssets(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select({
    id: fileAssets.id,
    originalName: fileAssets.originalName,
    mimeType: fileAssets.mimeType,
    byteSize: fileAssets.byteSize,
    scanStatus: fileAssets.scanStatus,
    retentionExpiresAt: fileAssets.retentionExpiresAt,
    scannedAt: fileAssets.scannedAt,
    createdAt: fileAssets.createdAt,
  }).from(fileAssets).where(eq(fileAssets.userId, userId)).orderBy(fileAssets.createdAt);
}

export async function getCleanFileAsset(userId: number, id: number): Promise<FileAsset | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const rows = await db.select().from(fileAssets).where(and(eq(fileAssets.id, id), eq(fileAssets.userId, userId), eq(fileAssets.scanStatus, "clean"), gt(fileAssets.retentionExpiresAt, new Date()))).limit(1);
  return rows[0];
}

export async function markFileAssetScanUnavailable(id: number, message = "No malware scanner is configured; the file remains quarantined and unavailable.") {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(fileAssets).set({ scanStatus: "error", scanProvider: "unconfigured", scanMessage: message, scannedAt: new Date() }).where(eq(fileAssets.id, id));
  return { accepted: false, scanStatus: "error" as const, message };
}

export async function cleanupExpiredFileAssets(now = new Date()) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const expired = await db.select({ id: fileAssets.id, storageKey: fileAssets.storageKey }).from(fileAssets).where(lte(fileAssets.retentionExpiresAt, now)).limit(500);
  let deletedObjects = 0;
  for (const asset of expired) {
    await deletePrivateFile(asset.storageKey);
    await db.delete(fileAssets).where(eq(fileAssets.id, asset.id));
    deletedObjects += 1;
  }
  return { deletedMetadata: deletedObjects, deletedObjects, storageDeleteSupported: true } as const;
}

export function sha256Hex(data: Uint8Array) {
  return createHash("sha256").update(data).digest("hex");
}

export function malwareScannerStatus() {
  const scannerConfigured = Boolean(process.env.MALWARE_SCANNER_URL && process.env.MALWARE_SCANNER_API_KEY);
  const storageConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  return {
    configured: scannerConfigured && storageConfigured,
    scannerConfigured,
    storageConfigured,
    mode: "clamav-https-supabase-private" as const,
    failClosed: true as const,
  };
}

export function fileUploadAvailability(scanner = malwareScannerStatus()) {
  const uploadsEnabled = scanner.configured;
  return {
    uploadsEnabled,
    unavailableReason: uploadsEnabled ? null : "Upload is disabled until ClamAV HTTPS scanner and private Supabase Storage credentials are configured.",
  };
}

