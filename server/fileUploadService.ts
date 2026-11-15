import net from "node:net";
import { randomUUID } from "node:crypto";

const BUCKET = "dsai-user-files";
const MAX_BYTES = 10 * 1024 * 1024;

function storageConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Private Supabase Storage is not configured");
  return { base: url.replace(/\/$/, ""), key };
}

/** Authenticated HTTPS adapter keeps clamd private to the scanner network. */
export async function scanWithClamAV(data: Buffer): Promise<{ clean: true; provider: "clamav" }> {
  const url = process.env.MALWARE_SCANNER_URL;
  const apiKey = process.env.MALWARE_SCANNER_API_KEY;
  if (!url || !apiKey) throw new Error("Malware scanner URL/API key is not configured");
  const target = new URL(url);
  if (target.protocol !== "https:" && process.env.NODE_ENV === "production") throw new Error("Production malware scanner must use HTTPS");
  const response = await fetch(target, {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/octet-stream" },
    body: new Uint8Array(data),
    signal: AbortSignal.timeout(35_000),
  });
  if (response.status === 422) throw new Error("Malware detected");
  if (!response.ok) throw new Error("Malware scanner unavailable (" + response.status + ")");
  const result = await response.json() as { clean?: boolean; engine?: string };
  if (result.clean !== true || result.engine !== "clamav") throw new Error("Scanner returned an invalid or non-clean result");
  return { clean: true, provider: "clamav" };
}

export async function storePrivateFile(userId: number, originalName: string, mimeType: string, data: Buffer) {
  if (data.length < 1 || data.length > MAX_BYTES) throw new Error("File size exceeds the 10 MiB limit");
  const { base, key } = storageConfig();
  const safeName = originalName.normalize("NFKC").replace(/[^\\p{L}\\p{N}._-]/gu, "_").slice(0, 120) || "file";
  const objectKey = `${userId}/${randomUUID()}-${safeName}`;
  const response = await fetch(`${base}/storage/v1/object/${BUCKET}/${objectKey.split("/").map(encodeURIComponent).join("/")}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": mimeType, "x-upsert": "false" },
    body: new Uint8Array(data),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Private Storage upload failed (${response.status})`);
  return objectKey;
}

export async function readPrivateFile(objectKey: string) {
  const { base, key } = storageConfig();
  const response = await fetch(`${base}/storage/v1/object/authenticated/${BUCKET}/${objectKey.split("/").map(encodeURIComponent).join("/")}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Private Storage download failed (${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}

export async function deletePrivateFile(objectKey: string) {
  const { base, key } = storageConfig();
  const response = await fetch(`${base}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: [objectKey] }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok && response.status !== 404) throw new Error(`Private Storage delete failed (${response.status})`);
}
