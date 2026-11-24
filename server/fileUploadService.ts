import { createHash, randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DSAI_R2_LIMITS, releaseR2StorageUsage, reserveR2Usage } from "./r2Quota";

const SUPABASE_BUCKET = "dsai-user-files"; // Existing private fallback; do not rename legacy objects.
const DSAI_R2_BUCKET = "dsai-user-file";
const DSAI_R2_PREFIX = "DSAI";
const DEFAULT_UPLOAD_TTL_SECONDS = 300;

type StorageProvider = "r2" | "supabase";

/** Read a bounded JSON response so a compromised/misconfigured scanner cannot exhaust Vercel memory. */
async function readYaraJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") throw new Error("YARA scanner response content type is invalid");
  const declaredLength = Number(response.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > 64 * 1024) {
    throw new Error("YARA scanner response exceeded the metadata limit");
  }
  if (!response.body) throw new Error("YARA scanner response body is missing");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > 64 * 1024) {
      await reader.cancel();
      throw new Error("YARA scanner response exceeded the metadata limit");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new Error("YARA scanner returned invalid JSON");
  }
}

/** Call the isolated YARA service. A no-match verdict is not proof of a virus-free file. */
export type YaraRuleAttribution = {
  rule: string;
  author?: string;
  sourceUrl: string;
  license: string;
  licenseUrl?: string;
  reference?: string;
};

export class YaraSignatureMatchError extends Error {
  constructor(
    readonly sha256: string,
    readonly rulesVersion: string,
    readonly attributions: YaraRuleAttribution[],
  ) {
    super("Malware detected");
    this.name = "YaraSignatureMatchError";
  }
}

/** Accept only bounded, HTTPS GitHub source links and short attribution fields from the scanner. */
function parseYaraAttributions(value: unknown): YaraRuleAttribution[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 50).flatMap((entry): YaraRuleAttribution[] => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    const rule = typeof item.rule === "string" ? item.rule.slice(0, 160) : "";
    const sourceUrl = typeof item.sourceUrl === "string" ? item.sourceUrl.slice(0, 600) : "";
    const license = typeof item.license === "string" ? item.license.slice(0, 80) : "";
    if (!rule || !license) return [];
    try {
      const parsed = new URL(sourceUrl);
      if (parsed.protocol !== "https:" || parsed.hostname !== "github.com" || !/^\\/(Neo23x0\\/signature-base|banglarvoice33-byte\\/dsai)\\//.test(parsed.pathname)) return [];
    } catch {
      return [];
    }
    const attribution: YaraRuleAttribution = { rule, sourceUrl, license };
    if (typeof item.author === "string") attribution.author = item.author.slice(0, 200);
    if (typeof item.reference === "string") attribution.reference = item.reference.slice(0, 500);
    if (typeof item.licenseUrl === "string") {
      try {
        const parsedLicense = new URL(item.licenseUrl);
        if (parsedLicense.protocol === "https:" && parsedLicense.hostname === "github.com" && parsedLicense.pathname.startsWith("/Neo23x0/signature-base/")) {
          attribution.licenseUrl = item.licenseUrl.slice(0, 600);
        }
      } catch {
        // Ignore malformed optional license URLs; the rule source remains available.
      }
    }
    return [attribution];
  });
}

/** Call the isolated YARA service. A no-match verdict is not proof of a virus-free file. */
export async function scanWithYara(data: Buffer): Promise<{ clean: true; provider: "yara"; sha256: string; rulesVersion: string }> {
  const url = process.env.MALWARE_SCANNER_URL;
  const apiKey = process.env.MALWARE_SCANNER_API_KEY;
  if (!url || !apiKey) throw new Error("Malware scanner URL/API key is not configured");
  const target = new URL(url);
  if ((target.protocol !== "https:" && process.env.NODE_ENV === "production") ||
      target.username || target.password || target.hash || target.search || target.pathname !== "/scan") {
    throw new Error("Production malware scanner URL is invalid or not HTTPS");
  }
  const expectedSha256 = createHash("sha256").update(data).digest("hex");
  const response = await fetch(target, {
    method: "POST",
    redirect: "error",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/octet-stream" },
    body: new Uint8Array(data),
    signal: AbortSignal.timeout(55_000),
  });
  if (response.status === 422) {
    const result = await readYaraJson(response) as {
      engine?: string; verdict?: string; sha256?: string; rulesVersion?: string; rules?: unknown;
    };
    if (result.engine !== "yara" || result.verdict !== "signature_match" ||
        result.sha256 !== expectedSha256 || typeof result.rulesVersion !== "string" || !result.rulesVersion) {
      throw new Error("YARA scanner returned an invalid signature-match response");
    }
    const attributions = parseYaraAttributions(result.rules);
    if (!attributions.length) throw new Error("YARA scanner match omitted required rule attribution");
    throw new YaraSignatureMatchError(expectedSha256, result.rulesVersion, attributions);
  }
  if (!response.ok) throw new Error("Malware scanner unavailable (" + response.status + ")");
  const result = await readYaraJson(response) as { clean?: boolean; engine?: string; verdict?: string; sha256?: string; rulesVersion?: string };
  if (result.clean !== true || result.engine !== "yara" || result.verdict !== "no_match" ||
      result.sha256 !== expectedSha256 || typeof result.rulesVersion !== "string" || !result.rulesVersion) {
    throw new Error("YARA scanner returned an invalid or non-clean result");
  }
  return { clean: true, provider: "yara", sha256: expectedSha256, rulesVersion: result.rulesVersion };
}

function r2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME || DSAI_R2_BUCKET;
  const prefix = process.env.R2_OBJECT_PREFIX || DSAI_R2_PREFIX;
  // Keep this credential path dedicated to the DSAI bucket and namespace.
  if (bucket !== DSAI_R2_BUCKET || prefix !== DSAI_R2_PREFIX) return null;
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  return {
    bucket,
    prefix,
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
export async function createSignedPrivateUpload(userId: number, originalName: string, mimeType = "application/octet-stream", byteSize = 0) {
  const name = safeObjectName(originalName);
  const status = fileStorageStatus();
  const r2UploadConfig = status.provider === "r2" ? r2Config() : null;
  const objectPath = status.provider === "r2"
    ? `${DSAI_R2_PREFIX}/${userId}/quarantine/${randomUUID()}-${name}`
    : `${userId}/quarantine/${randomUUID()}-${name}`;

  if (status.provider === "r2") {
    if (!r2UploadConfig) throw new Error("R2 storage credentials or DSAI bucket/prefix configuration are incomplete");
    if (!Number.isSafeInteger(byteSize) || byteSize < 1) throw new Error("Invalid R2 upload size");
    // Reserve before issuing a reusable, short-lived presigned URL. If the quota DB is down,
    // R2 writes are blocked rather than silently bypassing the DSAI-only free-tier budget.
    await reserveR2Usage("class_a", 1, DSAI_R2_LIMITS.classA);
    await reserveR2Usage("stored_bytes", byteSize, DSAI_R2_LIMITS.storedBytes);
    try {
      const uploadUrl = await getSignedUrl(
        r2UploadConfig.client,
        new PutObjectCommand({ Bucket: r2UploadConfig.bucket, Key: objectPath, ContentType: mimeType, IfNoneMatch: "*" }),
        { expiresIn: DEFAULT_UPLOAD_TTL_SECONDS },
      );
      return { objectKey: `r2:${objectPath}`, uploadUrl, provider: "r2" as const, expiresInSeconds: DEFAULT_UPLOAD_TTL_SECONDS };
    } catch (error) {
      // The class-A attempt remains counted; only the unused live-byte reservation is rolled back.
      await releaseR2StorageUsage(byteSize);
      throw error;
    }
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
    await reserveR2Usage("class_b", 1, DSAI_R2_LIMITS.classB);
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


/** Issue a short-lived, single-object download capability only after owner/status checks in the API route. */
export async function createSignedPrivateDownload(storageKey: string, downloadName: string) {
  const parsed = parseStorageKey(storageKey);
  const safeName = downloadName.normalize("NFKC").replace(/[\\r\\n"]/g, "_").slice(0, 180) || "download";
  const disposition = `attachment; filename*=UTF-8''${encodeURIComponent(safeName)}`;
  const expiresInSeconds = 120;

  if (parsed.provider === "r2") {
    const config = r2Config();
    if (!config) throw new Error("R2 storage is not configured");
    await reserveR2Usage("class_b", 1, DSAI_R2_LIMITS.classB);
    const downloadUrl = await getSignedUrl(
      config.client,
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: parsed.key,
        ResponseContentDisposition: disposition,
        ResponseCacheControl: "private, no-store",
        ResponseContentType: "application/octet-stream",
      }),
      { expiresIn: expiresInSeconds },
    );
    return { downloadUrl, expiresInSeconds };
  }

  const config = supabaseConfig();
  if (!config) throw new Error("Private Supabase Storage is not configured");
  const path = parsed.key.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`${config.base}/storage/v1/object/sign/${SUPABASE_BUCKET}/${path}`, {
    method: "POST",
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: expiresInSeconds }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Could not create a private download URL (${response.status})`);
  const result = await response.json() as { signedURL?: string };
  if (!result.signedURL || !result.signedURL.startsWith("/object/sign/")) {
    throw new Error("Supabase returned an invalid signed download URL");
  }
  const downloadUrl = new URL(`${config.base}/storage/v1${result.signedURL}`);
  downloadUrl.searchParams.set("download", safeName);
  return { downloadUrl: downloadUrl.toString(), expiresInSeconds };
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
