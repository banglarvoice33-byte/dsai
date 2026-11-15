import { createHash } from "node:crypto";
import { and, eq, gt, lte } from "drizzle-orm";
import { fileAssets, type FileAsset } from "../drizzle/schema";
import { getDb } from "./db";
import { deletePrivateFile, fileStorageStatus } from "./fileUploadService";
import { releaseR2StorageUsage } from "./r2Quota";

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
  const isR2 = input.storageKey.startsWith("r2:");
  const providerKey = isR2 ? input.storageKey.slice(3) : input.storageKey.replace(/^supabase:/, "");
  const expectedPrefix = isR2 ? "DSAI/" + input.userId + "/quarantine/" : input.userId + "/quarantine/";
  if (!providerKey.startsWith(expectedPrefix)) throw new Error("File must be registered in the user's DSAI quarantine namespace");
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
  const isR2 = input.storageKey.startsWith("r2:");
  const providerKey = isR2 ? input.storageKey.slice(3) : input.storageKey.replace(/^supabase:/, "");
  const expectedPrefix = isR2 ? "DSAI/" + input.userId + "/" : String(input.userId) + "/";
  if (!providerKey.startsWith(expectedPrefix)) throw new Error("Invalid DSAI owner storage namespace");
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const retentionExpiresAt = new Date(Date.now() + FILE_RETENTION_DAYS * 86400000);
  const [asset] = await db.insert(fileAssets).values({ userId: input.userId, storageKey: input.storageKey, originalName: validated.originalName, mimeType: validated.mimeType, byteSize: validated.byteSize, sha256: validated.sha256, scanStatus: "clean", scanProvider: "clamav", scanMessage: "ClamAV scan passed", scannedAt: new Date(), retentionExpiresAt }).returning();
  return asset;
}

export async function getUserFileAsset(userId: number, id: number): Promise<FileAsset | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const rows = await db.select().from(fileAssets).where(and(eq(fileAssets.id, id), eq(fileAssets.userId, userId))).limit(1);
  return rows[0];
}

export async function markUserFileClean(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const [asset] = await db.update(fileAssets).set({
    scanStatus: "clean", scanProvider: "clamav", scanMessage: "ClamAV scan passed", scannedAt: new Date(),
  }).where(and(eq(fileAssets.id, id), eq(fileAssets.userId, userId), eq(fileAssets.scanStatus, "quarantined"))).returning();
  return asset;
}

export async function markUserFileInfected(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const [asset] = await db.update(fileAssets).set({
    scanStatus: "infected", scanProvider: "clamav", scanMessage: "ClamAV detected malware", scannedAt: new Date(),
  }).where(and(eq(fileAssets.id, id), eq(fileAssets.userId, userId), eq(fileAssets.scanStatus, "quarantined"))).returning();
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
  const expired = await db.select({ id: fileAssets.id, storageKey: fileAssets.storageKey, byteSize: fileAssets.byteSize }).from(fileAssets).where(lte(fileAssets.retentionExpiresAt, now)).limit(500);
  let deletedObjects = 0;
  for (const asset of expired) {
    await deletePrivateFile(asset.storageKey);
    await db.delete(fileAssets).where(eq(fileAssets.id, asset.id));
    if (asset.storageKey.startsWith("r2:")) await releaseR2StorageUsage(asset.byteSize);
    deletedObjects += 1;
  }
  return { deletedMetadata: deletedObjects, deletedObjects, storageDeleteSupported: true } as const;
}

export function sha256Hex(data: Uint8Array) {
  return createHash("sha256").update(data).digest("hex");
}

export function malwareScannerStatus() {
  const scannerConfigured = Boolean(process.env.MALWARE_SCANNER_URL && process.env.MALWARE_SCANNER_API_KEY);
  const storage = fileStorageStatus();
  return {
    configured: scannerConfigured && storage.configured,
    scannerConfigured,
    storageConfigured: storage.configured,
    storageProvider: storage.provider,
    r2Configured: storage.r2Configured,
    supabaseConfigured: storage.supabaseConfigured,
    mode: storage.mode,
    failClosed: true as const,
  };
}

export function fileUploadAvailability(scanner = malwareScannerStatus()) {
  // Storage and malware scanning are separate gates: accept uploads into a private
  // quarantine bucket even before a scanner is provisioned, but never expose downloads.
  const uploadsEnabled = scanner.storageConfigured;
  return {
    uploadsEnabled,
    scannerAvailable: scanner.scannerConfigured,
    storageConfigured: scanner.storageConfigured,
    unavailableReason: uploadsEnabled ? null : "Upload is disabled until private R2 or Supabase Storage credentials are configured.",
    scanNotice: scanner.scannerConfigured ? null : "ফাইল private quarantine-এ থাকবে; ClamAV scanner যুক্ত না হওয়া পর্যন্ত download বন্ধ থাকবে।",
  };
}


