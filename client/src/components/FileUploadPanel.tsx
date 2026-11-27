import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { FileUp, Download, Loader2, ShieldCheck, RefreshCw, Trash2, FileText, Copy, XCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/supabaseAuthClient";
import { runBrowserOcr } from "@/lib/browserOcr";

const ACTIVE_TASK_STATUSES = new Set(["queued", "running", "retry_wait"]);

const ACCEPT = ".pdf,.docx,.xlsx,.csv,.txt,.json,.jpg,.jpeg,.png,.webp,.zip";
const MAX_BYTES = 10 * 1024 * 1024;

type YaraRuleAttribution = {
  rule: string;
  author?: string;
  sourceUrl: string;
  license: string;
  licenseUrl?: string;
  reference?: string;
};

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
      const url = new URL(sourceUrl);
      if (url.protocol !== "https:" || url.hostname !== "github.com" || (!url.pathname.startsWith("/Neo23x0/signature-base/") && !url.pathname.startsWith("/banglarvoice33-byte/dsai/"))) return [];
    } catch {
      return [];
    }
    const attribution: YaraRuleAttribution = { rule, sourceUrl, license };
    if (typeof item.author === "string") attribution.author = item.author.slice(0, 200);
    if (typeof item.reference === "string") attribution.reference = item.reference.slice(0, 500);
    if (typeof item.licenseUrl === "string") {
      try {
        const url = new URL(item.licenseUrl);
        if (url.protocol === "https:" && url.hostname === "github.com" && url.pathname.startsWith("/Neo23x0/signature-base/")) attribution.licenseUrl = item.licenseUrl.slice(0, 600);
      } catch {
        // Ignore malformed optional license URLs.
      }
    }
    return [attribution];
  });
}

function downloadExtractedText(text: string, taskId: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `dsai-extracted-${taskId.slice(0, 8)}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function authenticatedHeaders(extra: Record<string, string> = {}) {
  const token = await getAccessToken();
  return { ...extra, Authorization: `Bearer ${token}` };
}

export default function FileUploadPanel({ onOcrText }: { onOcrText?: (text: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrText, setOcrText] = useState("");
  const [ocrConfidence, setOcrConfidence] = useState(0);
  const [progress, setProgress] = useState("");
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [scanAttributions, setScanAttributions] = useState<YaraRuleAttribution[]>([]);
  const files = trpc.files.list.useQuery(undefined, { retry: false });
  const policy = trpc.files.policy.useQuery(undefined, { retry: false });
  const tasks = trpc.workDesk.tasks.useQuery({ limit: 30 }, {
    retry: false,
    // Poll only while work is active; pause in background tabs and stop when idle.
    refetchInterval: query => query.state.data?.some(task => ACTIVE_TASK_STATUSES.has(task.status)) ? 15_000 : false,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  });
  const selectedTask = trpc.workDesk.task.useQuery({ taskId: selectedTaskId || "" }, { enabled: Boolean(selectedTaskId), retry: false });
  const createTask = trpc.workDesk.createTask.useMutation({
    onSuccess: async () => { toast.success("নথির কাজ শুরু হয়েছে।"); await Promise.all([tasks.refetch(), files.refetch()]); },
    onError: () => toast.error("নথির কাজ শুরু করা যায়নি। নথির অবস্থা পরীক্ষা করে আবার চেষ্টা করুন."),
  });
  const cancelTask = trpc.workDesk.cancelTask.useMutation({
    onSuccess: async () => { toast.info("নথির কাজ বাতিল করা হয়েছে।"); await tasks.refetch(); },
    onError: () => toast.error("কাজটি বাতিল করা যায়নি। আবার চেষ্টা করুন."),
  });
  const retryTask = trpc.workDesk.retryTask.useMutation({
    onSuccess: async () => { toast.success("নথির কাজ আবার শুরু হয়েছে।"); await tasks.refetch(); },
    onError: () => toast.error("কাজটি আবার শুরু করা যায়নি। পরে আবার চেষ্টা করুন."),
  });
  const supportedExtraction = new Set(["text/plain", "text/csv", "application/json", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]);
  const taskStatusLabel: Record<string, string> = {
    queued: "অপেক্ষমাণ", running: "প্রক্রিয়াধীন", retry_wait: "পুনরায় চেষ্টার অপেক্ষায়",
    completed: "সম্পন্ন", failed: "ব্যর্থ", cancelled: "বাতিল",
  };
  const startExtraction = (fileId: number) => createTask.mutate({
    fileAssetId: fileId, idempotencyKey: crypto.randomUUID(), language: "bn",
  });

  const retryScan = async (fileId: number) => {
    setScanAttributions([]);
    try {
      const response = await fetch("/api/files/" + fileId + "/finalize", { method: "POST", credentials: "include", headers: await authenticatedHeaders() });
      const result = await response.json().catch(() => ({}));
      // A signature match is a terminal block; retain the upstream rule attribution for the user.
      if (result.error === "malware-detected") {
        setScanAttributions(parseYaraAttributions(result.attributions));
        toast.error("পরিচিত YARA signature মিলেছে। নথিটি ব্যবহারযোগ্য নয়।");
      } else if (result.status === "clean" || result.status === "ready") {
        toast.success("YARA signature scan-এ পরিচিত কোনো signature মেলেনি। এটি শতভাগ নিরাপদ হওয়ার নিশ্চয়তা নয়।");
      } else if (result.status === "pending" || result.status === "quarantined") {
        toast.info(typeof result.message === "string" ? result.message : "নথিটি ব্যক্তিগত quarantine-এ আছে। নিরাপত্তা যাচাই শেষ না হওয়া পর্যন্ত এটি ব্যবহার করা যাবে না।");
      } else {
        const refreshed = await files.refetch();
        const stillQuarantined = refreshed.data?.some(file => file.id === fileId && file.status === "pending");
        if (!response.ok && stillQuarantined) {
          toast.info("নথিটি ব্যক্তিগত quarantine-এ আছে। স্ক্যানার সচল হলে আবার যাচাই করুন।");
        } else {
          throw new Error("নথিটি এখন যাচাই করা যাচ্ছে না। পরে আবার চেষ্টা করুন।");
        }
      }
      await files.refetch();
    } catch {
      toast.error("নথিটি যাচাই করা যায়নি। পরে আবার চেষ্টা করুন।");
    }
  };
  const deleteFile = async (fileId: number, originalName: string) => {
    if (!window.confirm(`“${originalName}” স্থায়ীভাবে মুছে ফেলবেন? এই কাজটি ফেরানো যাবে না।`)) return;
    setDeletingFileId(fileId);
    try {
      const response = await fetch("/api/files/" + fileId, {
        method: "DELETE",
        credentials: "include",
        headers: await authenticatedHeaders(),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.deleted !== true) throw new Error("নথি মুছে ফেলা যায়নি। পরে আবার চেষ্টা করুন।");
      toast.success("নথিটি মুছে ফেলা হয়েছে।");
      await files.refetch();
    } catch (error) {
      toast.error("নথি মুছে ফেলা যায়নি। পরে আবার চেষ্টা করুন।");
    } finally {
      setDeletingFileId(null);
    }
  };
  const upload = async (file?: File) => {
    if (!file) return;
    setScanAttributions([]);
    if (file.size < 1 || file.size > MAX_BYTES) { toast.error("ফাইলের আকার ১০ মেগাবাইটের বেশি হতে পারবে না।"); return; }
    setBusy(true);
    setProgress("নথি যাচাই করে যোগ করা হচ্ছে…");
    try {
      const bytes = await file.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const sha256 = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
      const extension = file.name.toLowerCase().split(".").pop() || "";
      const mimeByExtension: Record<string, string> = {
        pdf: "application/pdf", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", csv: "text/csv",
        txt: "text/plain", json: "application/json", jpg: "image/jpeg", jpeg: "image/jpeg",
        png: "image/png", webp: "image/webp", zip: "application/zip",
      };
      // Prefer the allowlisted extension mapping; browser MIME values can be empty or inconsistent (notably ZIP on Android). The server still verifies extension, declared MIME, checksum and file signature.
      const mimeType = mimeByExtension[extension] || file.type || "";
      if (!mimeType) throw new Error("এই ফাইলের ধরন সমর্থিত নয়।");
      setProgress("নথি যোগ করার প্রস্তুতি চলছে…");
      const initResponse = await fetch("/api/files/upload/init", {
        method: "POST", credentials: "include",
        headers: await authenticatedHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ originalName: file.name, mimeType, byteSize: file.size, sha256 }),
      });
      const init = await initResponse.json().catch(() => ({}));
      if (!initResponse.ok) throw new Error(init.message || init.error || "নথি যোগ করা শুরু করা যায়নি। পরে আবার চেষ্টা করুন।");
      setProgress("নথি যোগ করা হচ্ছে…");
      const requiredHeaders = init.requiredHeaders && typeof init.requiredHeaders === "object" ? init.requiredHeaders as Record<string, string> : {};
      const uploadHeaders: Record<string, string> = { "Content-Type": mimeType, ...requiredHeaders };
      const storageResponse = await fetch(init.uploadUrl, {
        method: "PUT", headers: uploadHeaders, body: bytes,
      });
      if (!storageResponse.ok) throw new Error("নথি যোগ করা যায়নি। পরে আবার চেষ্টা করুন।");
      setProgress(policy.data?.scannerAvailable ? "নথিটি যাচাই করা হচ্ছে…" : "নথির অবস্থা যাচাই করা হচ্ছে…");
      const finalizeResponse = await fetch("/api/files/" + init.fileId + "/finalize", {
        method: "POST", credentials: "include", headers: await authenticatedHeaders(),
      });
      const finalized = await finalizeResponse.json().catch(() => ({}));
      // Keep the client aligned with the server contract: a successful scan returns "clean",
      // while a scanner outage may return HTTP 503 with status "quarantined".
      if (finalized.status === "clean" || finalized.status === "ready") {
        toast.success("YARA signature scan-এ পরিচিত কোনো ক্ষতিকর signature মেলেনি। এটি শতভাগ নিরাপদ হওয়ার নিশ্চয়তা নয়।");
      } else if (finalized.status === "pending" || finalized.status === "quarantined") {
        toast.info(typeof finalized.message === "string" ? finalized.message : "নথি ব্যক্তিগত quarantine-এ রাখা হয়েছে। নিরাপত্তা যাচাই শেষ না হওয়া পর্যন্ত এটি ব্যবহার করা যাবে না।");
      } else if (finalized.error === "malware-detected") {
        setScanAttributions(parseYaraAttributions(finalized.attributions));
        toast.error("পরিচিত YARA signature মিলেছে। নথিটি ব্যবহারযোগ্য নয়।");
      } else if (!finalizeResponse.ok) {
        const refreshed = await files.refetch();
        const stillQuarantined = refreshed.data?.some(item => item.id === init.fileId && item.status === "pending");
        if (stillQuarantined) {
          toast.info("নথি ব্যক্তিগত quarantine-এ সংরক্ষিত আছে। স্ক্যানার সচল হলে আবার যাচাই করুন।");
        } else {
          throw new Error("নথিটি এখন যাচাই করা যাচ্ছে না। পরে আবার চেষ্টা করুন।");
        }
      } else {
        throw new Error("নথিটি এখন যাচাই করা যাচ্ছে না। পরে আবার চেষ্টা করুন।");
      }
      await files.refetch();
    } catch (error) {
      await files.refetch().catch(() => undefined);
      toast.error("নথি যোগ করা যায়নি। পরে আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
      setProgress("");
    }
  };
    const handleOcr = async (file: File) => {
    setOcrBusy(true);
    setOcrProgress(0);
    setOcrText("");
    try {
      const result = await runBrowserOcr(file, "ben+eng", setOcrProgress);
      setOcrText(result.text);
      setOcrConfidence(result.confidence);
      if (!result.text) toast.info("ছবিতে পড়ার মতো লেখা পাওয়া যায়নি।");
    } catch {
      toast.error("OCR হয়নি — আরো পরিষ্কার ছবি দিয়ে আবার চেষ্টা করুন।");
    } finally {
      setOcrBusy(false);
    }
  };

  return <section className="workspace-panel">
    <div className="workspace-panel-heading">
      <div><h2 className="text-xl font-semibold sm:text-2xl">আপনার নথি</h2><p className="mt-1 text-sm text-muted-foreground">ফাইল যোগ করুন, লেখা পড়ুন বা OCR চালান।</p></div>
      <ShieldCheck size={22} />
    </div>
    <div className="rounded-xl border border-dashed p-5 space-y-3">
      <label htmlFor="dsai-file-upload" className="flex flex-col items-center gap-2 cursor-pointer text-center">
        <FileUp size={28} />
        <strong>নথি নির্বাচন করুন</strong>
        <span className="text-base leading-6 text-muted-foreground">PDF, DOCX, XLSX, CSV, TXT, JSON, ছবি বা ZIP · ১০ MiB পর্যন্ত</span>
      </label>
      {!policy.isLoading && policy.data && !policy.data.uploadsEnabled && <p role="status" className="text-sm text-amber-700">নথি যোগ করা যাচ্ছে না: {policy.data.unavailableReason || "ব্যক্তিগত সংরক্ষণ ব্যবস্থা প্রস্তুত নয়।"} এটি আপনার ফাইলের ত্রুটি নয়।</p>}
      {policy.data?.scanNotice && <details className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"><summary className="cursor-pointer font-medium">নথির নিরাপত্তা ও স্ক্যানের অবস্থা</summary><p className="mt-2 leading-6">{policy.data.scanNotice}</p></details>}
      {scanAttributions.length > 0 && <section role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-950">
        <p className="font-semibold">YARA signature attribution</p>
        <p className="mt-1">নথিটি পরিচিত signature-এর সঙ্গে মিলেছে এবং ব্যবহার থেকে আটকানো হয়েছে। ব্যবহৃত detection rule-এর উৎস ও লাইসেন্স:</p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          {scanAttributions.slice(0, 5).map((item, index) => <li key={item.rule + "-" + index}>
            <a className="font-medium underline" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{item.rule}</a>
            {item.author ? " — " + item.author : ""}
            <span> · {item.license}</span>
            {item.licenseUrl && <> · <a className="underline" href={item.licenseUrl} target="_blank" rel="noopener noreferrer">license</a></>}
            {item.reference && <p className="mt-1 break-words text-xs">{item.reference}</p>}
          </li>)}
        </ul>
        {scanAttributions.length > 5 && <p className="mt-2 text-xs">আরও {scanAttributions.length - 5}টি matching rule রয়েছে।</p>}
      </section>}
      {policy.isError && <p role="status" className="text-sm text-destructive">নথি যোগ করার অবস্থা যাচাই করা যায়নি।</p>}
      <input id="dsai-file-upload" type="file" accept={ACCEPT} disabled={busy || policy.isLoading || !policy.data?.uploadsEnabled} className="block w-full text-sm" onChange={e => { void upload(e.currentTarget.files?.[0]); e.currentTarget.value = ""; }} />
      {busy && <div role="status" className="flex items-center gap-2 text-sm"><Loader2 className="animate-spin h-4 w-4" />{progress}</div>}
    </div>
          <div className="rounded-xl border p-5 space-y-3 mt-4">
        <h3 className="text-lg font-semibold">ছবি থেকে লেখা</h3>
        <p className="text-base leading-7 text-muted-foreground">ছবি আপনার ব্রাউজারেই পড়া হয়। পাঠানোর আগে পাওয়া লেখা যাচাই করুন।</p>
        <label htmlFor="dsai-ocr-upload" className="sr-only">OCR-এর জন্য ছবি নির্বাচন করুন</label>
        <input id="dsai-ocr-upload" type="file" accept=".jpg,.jpeg,.png,.webp" aria-label="OCR-এর জন্য ছবি নির্বাচন করুন" disabled={ocrBusy} className="block w-full text-sm" onChange={e => { const f = e.currentTarget.files?.[0]; if (f) void handleOcr(f); e.currentTarget.value = ""; }} />
        {ocrBusy && <div role="status" className="flex items-center gap-2 text-sm"><Loader2 className="animate-spin h-4 w-4" />OCR চলছে… {ocrProgress}%</div>}
        {ocrText && <div className="space-y-2"><p className="text-xs text-muted-foreground">Tesseract.js · বাংলা + ইংরেজি · confidence {ocrConfidence}% · খসড়া</p><pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted p-3 text-sm leading-7">{ocrText}</pre><div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => { onOcrText?.(ocrText); toast.success("OCR লেখা WorkDesk-এর নির্দেশনায় যোগ হয়েছে। জমা দেওয়ার আগে যাচাই করুন।"); }} disabled={!onOcrText || !ocrText.trim()}>এই লেখা দিয়ে কাজ করুন</Button><Button variant="outline" size="sm" onClick={() => { void navigator.clipboard.writeText(ocrText).then(() => toast.success("OCR লেখা কপি হয়েছে।")).catch(() => toast.error("লেখা কপি করা যায়নি।")); }}><Copy className="mr-1 h-3.5 w-3.5" /> কপি</Button></div></div>}
      </div>
      <div className="flex items-center justify-between mt-5">
      <h3 className="text-lg font-semibold">সংরক্ষিত নথি</h3>
      <Button variant="outline" size="sm" onClick={() => void files.refetch()} disabled={files.isFetching}><RefreshCw size={14} className="mr-2" />হালনাগাদ</Button>
    </div>
    {files.isLoading ? <p className="py-5 text-sm text-muted-foreground">লোড হচ্ছে…</p> : files.isError ? <p className="py-5 text-sm text-destructive">ফাইলের তালিকা পাওয়া যায়নি।</p> : files.data?.length ? <div className="divide-y">{files.data.map(file => <article key={file.id} className="flex min-w-0 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="break-words text-base font-medium">{file.originalName}</p>
        <p className="break-words text-sm text-muted-foreground">{(file.byteSize / 1024).toFixed(1)} কিলোবাইট · {file.status === "ready" ? "YARA signature scan সম্পন্ন" : file.status === "pending" ? "যাচাইয়ের অপেক্ষায়" : "নথিটি ব্যবহারযোগ্য নয়"}</p>
        <p className="text-xs text-muted-foreground">মুছে যাবে: {file.retentionExpiresAt.toLocaleDateString("bn-BD")}</p>
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end">
        {file.status === "ready" && supportedExtraction.has(file.mimeType) && <Button size="sm" variant="outline" disabled={createTask.isPending} onClick={() => startExtraction(file.id)}><FileText size={14} className="mr-1" />লেখা বের করুন</Button>}
        {file.status === "ready" && <Button size="sm" variant="outline" onClick={async () => {
          try {
            const response = await fetch("/api/files/" + file.id + "/download", { credentials: "include", headers: await authenticatedHeaders() });
            const result = await response.json().catch(() => ({}));
            if (!response.ok || typeof result.downloadUrl !== "string") throw new Error("ডাউনলোড লিংক তৈরি করা যায়নি। পরে আবার চেষ্টা করুন।");
            window.location.assign(result.downloadUrl);
          } catch (error) {
            toast.error("নথি ডাউনলোড করা যায়নি। পরে আবার চেষ্টা করুন।");
          }
        }}><Download size={14} className="mr-1" />ডাউনলোড</Button>}
        {file.status === "pending" && policy.data?.scannerAvailable && <Button size="sm" variant="outline" onClick={() => void retryScan(file.id)}>আবার যাচাই করুন</Button>}
        <Button size="sm" variant="ghost" disabled={deletingFileId === file.id} onClick={() => void deleteFile(file.id, file.originalName)} aria-label={`মুছুন ${file.originalName}`}><Trash2 size={14} className="mr-1" />{deletingFileId === file.id ? "মুছছে…" : "মুছুন"}</Button>
      </div>
    </article>)}</div> : <p className="py-5 text-sm text-muted-foreground">এখনো কোনো নথি যোগ করা হয়নি।</p>}
    <div className="mt-6 border-t pt-5">
      <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-lg font-semibold">নথি থেকে লেখা</h3><Button variant="outline" size="sm" onClick={() => void tasks.refetch()} disabled={tasks.isFetching}><RefreshCw size={14} className="mr-2" />হালনাগাদ</Button></div>
      
      {tasks.isLoading ? <p className="py-3 text-sm text-muted-foreground">কাজের তালিকা লোড হচ্ছে…</p> : tasks.isError ? <p role="status" className="py-3 text-sm text-destructive">কাজের তালিকা পাওয়া যায়নি।</p> : tasks.data?.length ? <div className="space-y-3">{tasks.data.map(task => {
        const active = ["queued", "running", "retry_wait"].includes(task.status);
        return <article key={task.id} className="rounded-xl border p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0"><p className="break-all text-base font-medium">{files.data?.find(file => file.id === task.fileAssetId)?.originalName || "নথি"}</p><p className="text-sm text-muted-foreground">{taskStatusLabel[task.status] || "অবস্থা যাচাই করা যাচ্ছে না"} · চেষ্টা {task.attemptCount}/{task.maxAttempts}</p></div>
            <div className="flex gap-2">
              {active && <Button size="sm" variant="outline" disabled={cancelTask.isPending} onClick={() => cancelTask.mutate({ taskId: task.id })}><XCircle size={14} className="mr-1" />বাতিল</Button>}
              {task.status === "failed" && <Button size="sm" variant="outline" disabled={retryTask.isPending} onClick={() => retryTask.mutate({ taskId: task.id })}><RotateCcw size={14} className="mr-1" />আবার চেষ্টা</Button>}
            </div>
          </div>
          {task.status === "completed" && <Button size="sm" variant="outline" className="mt-3" onClick={() => setSelectedTaskId(task.id)}>ফলাফল দেখুন</Button>}
          {task.status === "failed" && <p role="status" className="mt-2 text-xs text-destructive">কাজটি সম্পন্ন হয়নি। নথির অবস্থা পরীক্ষা করে আবার চেষ্টা করুন।</p>}
          {task.status === "cancelled" && <p className="mt-2 text-xs text-muted-foreground">এই কাজটি বাতিল করা হয়েছে।</p>}
        </article>;
      })}</div> : <p className="py-4 text-base text-muted-foreground">প্রস্তুত নথির পাশে “লেখা বের করুন” চাপুন।</p>}
      {selectedTaskId && <div className="mt-4 rounded-xl border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2"><h4 className="font-semibold">নথির ফলাফল</h4><Button size="sm" variant="ghost" onClick={() => setSelectedTaskId(null)}>বন্ধ করুন</Button></div>
        {selectedTask.isLoading ? <p role="status" className="text-sm text-muted-foreground">ফলাফল লোড হচ্ছে…</p> : selectedTask.isError ? <p role="status" className="text-sm text-destructive">ফলাফল পাওয়া যায়নি।</p> : (() => {
          const result = selectedTask.data?.result as { title?: string; text?: string; format?: string; characterCount?: number; messages?: { title?: string; status?: string } } | null | undefined;
          return result?.text !== undefined ? <div className="space-y-2">
            <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold">{result.messages?.title || "নথির লেখা প্রস্তুত"}</p><div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => { void navigator.clipboard.writeText(result.text || "").then(() => toast.success("লেখা কপি হয়েছে।")).catch(() => toast.error("কপি করা যায়নি।")); }}><Copy size={14} className="mr-1" />কপি</Button><Button size="sm" variant="ghost" onClick={() => { downloadExtractedText(result.text || "", selectedTaskId); toast.success("সংগৃহীত লেখা TXT ফাইলে ডাউনলোড হয়েছে।"); }}><Download size={14} className="mr-1" />ডাউনলোড</Button></div></div>
            <p className="text-xs text-muted-foreground">{result.characterCount ?? result.text.length} অক্ষর · {result.format || "text"}</p>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted p-3 text-sm leading-6">{result.text}</pre>
          </div> : <p className="text-sm text-muted-foreground">এই কাজের ফলাফল পাওয়া যাচ্ছে না।</p>;
        })()}
      </div>}
    </div>
  </section>;
}
