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

/** ClamAV clamd INSTREAM protocol. No scanner response means no upload. */
export async function scanWithClamAV(data: Buffer): Promise<{ clean: true; provider: "clamav" }> {
  const host = process.env.CLAMAV_HOST;
  const port = Number(process.env.CLAMAV_PORT || 3310);
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("ClamAV scanner endpoint is not configured");
  }
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    let response = Buffer.alloc(0);
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      if (error) reject(error);
      else {
        const text = response.toString("utf8");
        if (/\\bOK\\s*$/.test(text)) resolve({ clean: true, provider: "clamav" });
        else reject(new Error(/FOUND/.test(text) ? "Malware detected" : "Scanner returned an invalid response"));
      }
    };
    socket.setTimeout(30_000, () => finish(new Error("ClamAV scan timed out")));
    socket.on("error", error => finish(new Error(`ClamAV unavailable: ${error.message}`)));
    socket.on("data", chunk => {
      response = Buffer.concat([response, chunk]);
      if (response.length > 4096) finish(new Error("ClamAV response exceeded limit"));
      else if (response.includes(Buffer.from("\\0"))) finish();
    });
    socket.on("connect", () => {
      socket.write(Buffer.from("zINSTREAM\\0"));
      const chunkSize = 64 * 1024;
      for (let offset = 0; offset < data.length; offset += chunkSize) {
        const chunk = data.subarray(offset, Math.min(offset + chunkSize, data.length));
        const size = Buffer.alloc(4);
        size.writeUInt32BE(chunk.length);
        socket.write(size);
        socket.write(chunk);
      }
      socket.write(Buffer.alloc(4));
    });
  });
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
