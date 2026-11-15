import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const SUPABASE_BUCKET = "dsai-user-files";
const DEFAULT_UPLOAD_TTL_SECONDS = 900;

type StorageProvider = "r2" | "supabase";

/** Scanner adapter is provider-agnostic: the same HTTPS ClamAV gateway works on Cloud Run or a future VPS. */
export async function scanWithClamAV(data: Buffer): Promise<{ clean: true; provider: "clamav" }> {
  const url = process.env.MALWARE_SCANNER_URL;
  const apiKey = process.env.MALWARE_SCANNER_API_KEY;
  if (!url || !apiKey) throw new Error("Malware scanner URL/API key is not configured");
  const target = new URL(url);
  if (target.protocol !== "https:" && process.env.NODE_ENV === "production") {
    throw new Error("Production malware scanner must use HTTPS");
  }
  const response = await fetch(target, {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/octet-stream" },
    body: new Uint8Array(data),
    signal: AbortSignal.timeout(35_000),
  });
  if (response.status === 422) throw new Error("Malware detected");
  if (!response.ok) throw new Error("Malware scanner unavailable (" + response.status + ")");
  const result = await response.json() as { clean?: boolean; engine?: string };
  if (result.clean !== true || result.engine !== "clamav") {
    throw new Error("Scanner returned an invalid or non-clean result");
  }
  return { clean: true, provider: "clamav" };
}

function r2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME || "dsai-user-files";
  if (!accountId || ! accessKeyId || !secretAccessKey) return null;
  return {
    bucket,
    client: new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    }),
  };
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { base: url.replace(/\/$/, ""), key };
}

/** Select R2 when fully configured; otherwise preserve the existing private Supabase bucket. */
export function fileStorageStatus() {
  const r2 = r2Config();
  const supabase = supabaseConfig();
  const requested = (process.env.FILE_STORAGE_PROVIDER || "auto").toLowerCase();
  const provider: StorageProvider | null =
    requested === "r2" ? (r2 ? "r2" : null) :
    requested === "supabase" ? (supabase ? "supabase" : null) :
    r2 ? "r2" : supabase ? "supabase" : null;
  return {
    configured: Boolean(provider),
    provider,
    r2Configured: Boolean(r2),
    supabaseConfigured: Boolean(supabase),
    mode: requested,
  };
}

function parseStorageKey(storageKey: string): { provider: StorageProvider; key: string } {
  if (storageKey.startsWith("r2:")) return { provider: "r2", key: storageKey.slice(3) };
  // Historical rows have no provider prefix and remain in Supabase.
  return { provider: "supabase", key: storageKey.replace(/^supabase:/, "") };
}

function safeObjectName(originalName: string) {
  return originalName.normalize("NFKC").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "file";
}

/** Short-lived single-object upload authorization. The browser sends bytes directly to storage. */
export async function createSignedPrivateUpload(userId: number, originalName: string, mimeType = "application/octet-stream") {
  const name = safeObjectName(originalName);
  const objectPath = `${userId}/quarantine/${randomUUID()}-${name}`;
  const status = fileStorageStatus();

  if (status.provider === "r2") {
    const config = r2Config();
    if (!config) throw new Error("R2 storage credentials are incomplete");
    const uploadUrl = await getSignedUrl(
      config.client,
      new PutObjectCommand({ Bucket: config.bucket, Key: objectPath, ContentType: mimeType }),
      { expiresIn: DEFAULT_UPLOAD_TTL_SECONDS },
    );
    return { objectKey: `r2:${objectPath}`, uploadUrl, provider: "r2" as const, expiresInSeconds: DEFAULT_UPLOAD_TTL_SECONDS };
  }

  const config = supabaseConfig();
  if (!config) throw new Error("Private Supabase Storage is not configured");
  const path = objectPath.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`${config.base}/storage/v1/object/upload/sign/${SUPABASE_BUCKET}/${path}`, {
    method: "POST",
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ upsert: false }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Could not create a private upload token (" + response.status + ")");
  const result = await response.json() as { token?: string };
  if (!result.token) throw new Error("Supabase did not return a signed upload token");
  return {
    objectKey: objectPath,
    uploadUrl: `${config.base}/storage/v1/object/upload/sign/${SUPABASE_BUCKET}/${path}?token=${encodeURIComponent(result.token)}`,
    provider: "supabase" as const,
    expiresInSeconds: 7200,
  };
}

export async function readPrivateFile(storageKey: string) {
  const parsed = parseStorageKey(storageKey);
  if (parsed.provider === "r2") {
    const config = r2Config();
    if (!config) throw new Error("R2 storage is not configured");
    const result = await config.client.send(new GetObjectCommand({ Bucket: config.bucket, Key: parsed.key }));
    if (!result.Body) throw new Error("R2 object has no body");
    return Buffer.from(await result.Body.transformToByteArray());
  }
  const config = supabaseConfig();
  if (!config) throw new Error("Private Supabase Storage is not configured");
  const response = await fetch(`${config.base}/storage/v1/object/authenticated/${SUPABASE_BUCKET}/${parsed.key.split("/").map(encodeURIComponent).join("/")}`, {
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Private Storage download failed (${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}

export async function deletePrivateFile(storageKey: string) {
  const parsed = parseStorageKey(storageKey);
  if (parsed.provider === "r2") {
    const config = r2Config();
    if (!config) throw new Error("R2 storage is not configured");
    await config.client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: parsed.key }));
    return;
  }
  const config = supabaseConfig();
  if (!config) throw new Error("Private Supabase Storage is not configured");
  const response = await fetch(`${config.base}/storage/v1/object/${SUPABASE_BUCKET}`, {
    method: "DELETE",
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: [parsed.key] }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok && response.status !== 404) throw new Error(`Private Storage delete failed (${response.status})`);
}
