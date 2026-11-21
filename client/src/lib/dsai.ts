// client/src/lib/dsai.ts — frontend client for the DSAI super-api Edge Function.
// Replaces the old ocr.ts. Works in any browser app that has a supabase-js client.

export interface ApiOk { ok: true; action: string; request_id: string; plan: "free" | "pro" }
export interface ApiErr { ok: false; error: string; message: string; request_id?: string; retry_after?: number }
export type ApiResult<T> = (ApiOk & T) | ApiErr;

const BASE = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;

/** Core call: attaches the signed-in user's access token and retries once on short 429s. */
export async function callApi<T = Record<string, unknown>>(
  supabase: any,
  action: string,
  payload: Record<string, unknown> = {},
  baseUrl: string | undefined = BASE,
): Promise<ApiResult<T>> {
  if (!baseUrl) return { ok: false, error: "no_base_url", message: "VITE_SUPABASE_URL সেট করা নেই।" };
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: "unauthorized", message: "আগে লগইন করুন।" };

  const send = async (): Promise<ApiResult<T>> => {
    try {
      const res = await fetch(`${baseUrl}/functions/v1/smart-handler`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const j = await res.json().catch(() => null);
      if (j && typeof j === "object" && "ok" in j) return j as ApiResult<T>;
      return { ok: false, error: `http_${res.status}`, message: "অপ্রত্যাশিত উত্তর। আবার চেষ্টা করুন।" };
    } catch {
      return { ok: false, error: "network", message: "ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।" };
    }
  };

  let r = await send();
  if (!r.ok && r.error === "upstream_busy" && (r.retry_after ?? 99) <= 10) {
    await new Promise((s) => setTimeout(s, (r as ApiErr).retry_after! * 1000 + 300));
    r = await send();
  }
  return r;
}

// ---------- helpers ----------
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result).split(",")[1] ?? "");
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(blob);
  });
}

/** Resize + re-encode to JPEG (<= maxSide px, <= ~3.5MB) — saves mobile data and stays under the 4MB limit. */
export async function imageToBase64(file: File, maxSide = 1800): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  for (const q of [0.85, 0.7, 0.55]) {
    const b64 = canvas.toDataURL("image/jpeg", q).split(",")[1] ?? "";
    if ((b64.length * 3) / 4 < 3.5 * 1024 * 1024) return b64;
  }
  throw new Error("ছবি অনেক বড় — ছোট ছবি দিন।");
}

// ---------- typed service wrappers ----------
export const ocr = async (sb: any, files: File[]) =>
  callApi<{ text: string; char_count: number; pages: number; truncated: boolean }>(
    sb, "ocr", { images: await Promise.all(files.map(async (f) => ({ base64: await imageToBase64(f) }))) });

export const scanDocument = async (sb: any, kind: "receipt" | "bill" | "notice" | "ledger", files: File[], save = false) =>
  callApi<{ kind: string; data: Record<string, unknown>; warnings: string[]; saved_id: string | null; csv?: string }>(
    sb, "doc_scan", { kind, save, images: await Promise.all(files.map(async (f) => ({ base64: await imageToBase64(f) }))) });

export const explain = (sb: any, text: string, mode: "simplify" | "summarize" | "translate" | "proofread" = "simplify", extra: { target_lang?: string; length?: "short" | "medium" } = {}) =>
  callApi<{ mode: string; text: string; truncated: boolean }>(sb, "explain", { text, mode, ...extra });

export const draft = (sb: any, kind: string, details: string, extra: { tone?: "formal" | "polite" | "firm"; lang?: "bn" | "en"; recipient?: string; sender?: string } = {}) =>
  callApi<{ kind: string; text: string; truncated: boolean }>(sb, "draft", { kind, details, ...extra });

export const chat = (sb: any, messages: Array<{ role: "user" | "assistant"; content: string }>) =>
  callApi<{ reply: string; truncated: boolean }>(sb, "chat", { messages });

export const transcribe = async (sb: any, audio: Blob, opts: { language?: string; clean?: boolean } = {}) =>
  callApi<{ text: string; cleaned?: string; duration_sec: number; language: string }>(
    sb, "transcribe", { audio_base64: await blobToBase64(audio), mime: audio.type || "audio/webm", language: opts.language ?? "bn", then: opts.clean ? "clean" : undefined });

export const me = (sb: any) =>
  callApi<{ limits: Record<string, number>; used_today: { tokens: number; audio_seconds: number }; remaining: { tokens: number; audio_seconds: number }; shared_capacity_used_pct: number | null }>(sb, "me");

export const history = (sb: any, opts: { kind?: string; limit?: number; before?: string; include_data?: boolean } = {}) =>
  callApi<{ items: Array<Record<string, unknown>>; next_before: string | null }>(sb, "history", opts);

export const removeItem = (sb: any, id: string) => callApi<{ deleted: number }>(sb, "delete", { id });
export const removeAll = (sb: any) => callApi<{ deleted: number }>(sb, "delete", { all: true, confirm: "DELETE_ALL" });

export const expenseReport = (sb: any, days = 30) =>
  callApi<{ total: number; count: number; by_category: Array<{ category: string; total: number; count: number }>; by_month: Array<{ month: string; total: number }>; top_merchants: Array<{ merchant: string; total: number }> }>(sb, "expense_report", { days });
