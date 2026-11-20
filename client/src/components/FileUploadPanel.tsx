import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { FileUp, Download, Loader2, ShieldCheck, RefreshCw, Trash2, FileText, Copy, XCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/supabaseAuthClient";

const ACCEPT = ".pdf,.docx,.xlsx,.csv,.txt,.json,.jpg,.jpeg,.png,.webp,.zip";
const MAX_BYTES = 10 * 1024 * 1024;

async function authenticatedHeaders(extra: Record<string, string> = {}) {
  const token = await getAccessToken();
  return { ...extra, Authorization: `Bearer ${token}` };
}

export default function FileUploadPanel() {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const files = trpc.files.list.useQuery(undefined, { retry: false });
  const policy = trpc.files.policy.useQuery(undefined, { retry: false });
  const tasks = trpc.workDesk.tasks.useQuery({ limit: 30 }, { retry: false, refetchInterval: 5000 });
  const selectedTask = trpc.workDesk.task.useQuery({ taskId: selectedTaskId || "" }, { enabled: Boolean(selectedTaskId), retry: false });
  const createTask = trpc.workDesk.createTask.useMutation({
    onSuccess: async () => { toast.success("নথির কাজ শুরু হয়েছে।"); await Promise.all([tasks.refetch(), files.refetch()]); },
    onError: error => toast.error(error.message || "নথির কাজ শুরু করা যায়নি।"),
  });
  const cancelTask = trpc.workDesk.cancelTask.useMutation({
    onSuccess: async () => { toast.info("নথির কাজ বাতিল করা হয়েছে।"); await tasks.refetch(); },
    onError: error => toast.error(error.message || "কাজ বাতিল করা যায়নি।"),
  });
  const retryTask = trpc.workDesk.retryTask.useMutation({
    onSuccess: async () => { toast.success("নথির কাজ আবার শুরু হয়েছে।"); await tasks.refetch(); },
    onError: error => toast.error(error.message || "কাজ আবার শুরু করা যায়নি।"),
  });
  const supportedExtraction = new Set(["text/plain", "text/csv", "application/json"]);
  const taskStatusLabel: Record<string, string> = {
    queued: "অপেক্ষমাণ", running: "প্রক্রিয়াধীন", retry_wait: "পুনরায় চেষ্টার অপেক্ষায়",
    completed: "সম্পন্ন", failed: "ব্যর্থ", cancelled: "বাতিল",
  };
  const startExtraction = (fileId: number) => createTask.mutate({
    fileAssetId: fileId, idempotencyKey: crypto.randomUUID(), language: "bn",
  });

  const retryScan = async (fileId: number) => {
    try {
      const response = await fetch("/api/files/" + fileId + "/finalize", { method: "POST", credentials: "include", headers: await authenticatedHeaders() });
      const result = await response.json().catch(() => ({}));
      if (!response.ok && result.status !== "pending") throw new Error("নথিটি এখন যাচাই করা যাচ্ছে না। পরে আবার চেষ্টা করুন।");
      if (result.status === "ready") toast.success("নথিটি প্রস্তুত। এখন ব্যবহার বা ডাউনলোড করতে পারবেন।");
      else if (result.status === "pending") toast.info("নথিটি যাচাইয়ের অপেক্ষায় আছে। প্রস্তুত হলে ব্যবহার করতে পারবেন।");
      else throw new Error("নথিটি এখন যাচাই করা যাচ্ছে না। পরে আবার চেষ্টা করুন।");
      await files.refetch();
    } catch (error) {
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
      if (!finalizeResponse.ok && finalized.status !== "pending") throw new Error("নথিটি এখন যাচাই করা যাচ্ছে না। পরে আবার চেষ্টা করুন।");
      if (finalized.status === "pending") toast.info("নথি গ্রহণ করা হয়েছে। যাচাই শেষ না হওয়া পর্যন্ত এটি ব্যবহার করা যাবে না।");
      else if (finalized.status === "ready") toast.success("নথিটি যাচাই করে সংরক্ষণ করা হয়েছে।");
      else throw new Error("নথিটি এখন যাচাই করা যাচ্ছে না। পরে আবার চেষ্টা করুন।");
      await files.refetch();
    } catch (error) {
      await files.refetch().catch(() => undefined);
      toast.error("নথি যোগ করা যায়নি। পরে আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
      setProgress("");
    }
  };
  return <section className="workspace-panel">
    <div className="workspace-panel-heading">
      <div><span className="learn-label">DSAI / আপনার নথি</span><h2>আপনার নথি</h2>
        <p>আপনার ব্যক্তিগত নথি। নিরাপত্তা যাচাই শেষ হলে নথি ব্যবহার ও ডাউনলোড করতে পারবেন।</p></div>
      <ShieldCheck size={22} />
    </div>
    <div className="rounded-xl border border-dashed p-5 space-y-3">
      <label htmlFor="dsai-file-upload" className="flex flex-col items-center gap-2 cursor-pointer text-center">
        <FileUp size={28} />
        <strong>নথি নির্বাচন করুন</strong>
        <span className="text-sm text-muted-foreground">PDF, DOCX, XLSX, CSV, TXT, JSON, JPG, PNG, WebP, ZIP · সর্বোচ্চ ১০ MiB</span>
      </label>
      {!policy.isLoading && policy.data && !policy.data.uploadsEnabled && <p role="status" className="text-sm text-amber-700">নথি যোগ করা সাময়িকভাবে বন্ধ: {policy.data.unavailableReason || "নিরাপত্তা যাচাই ব্যবস্থা প্রস্তুত নয়।"} আপনার ফাইলের কোনো সমস্যা নয়; DSAI-এর নিরাপদ আপলোড ব্যবস্থা প্রস্তুত হলে আবার চেষ্টা করুন।</p>}
      {policy.data?.scanNotice && <p role="status" className="text-sm text-amber-700">{policy.data.scanNotice}</p>}
      {policy.isError && <p role="status" className="text-sm text-destructive">নথি যোগ করার অবস্থা যাচাই করা যায়নি।</p>}
      <input id="dsai-file-upload" type="file" accept={ACCEPT} disabled={busy || policy.isLoading || !policy.data?.uploadsEnabled} className="block w-full text-sm" onChange={e => { void upload(e.currentTarget.files?.[0]); e.currentTarget.value = ""; }} />
      {busy && <div role="status" className="flex items-center gap-2 text-sm"><Loader2 className="animate-spin h-4 w-4" />{progress}</div>}
    </div>
    <div className="flex items-center justify-between mt-5">
      <h3 className="font-semibold">সংরক্ষিত নথি</h3>
      <Button variant="outline" size="sm" onClick={() => void files.refetch()} disabled={files.isFetching}><RefreshCw size={14} className="mr-2" />হালনাগাদ</Button>
    </div>
    {files.isLoading ? <p className="py-5 text-sm text-muted-foreground">লোড হচ্ছে…</p> : files.isError ? <p className="py-5 text-sm text-destructive">ফাইলের তালিকা পাওয়া যায়নি।</p> : files.data?.length ? <div className="divide-y">{files.data.map(file => <article key={file.id} className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0"><p className="truncate font-medium">{file.originalName}</p><p className="text-xs text-muted-foreground">{(file.byteSize / 1024).toFixed(1)} কিলোবাইট · {file.status === "ready" ? "যাচাই সম্পন্ন" : file.status === "pending" ? "যাচাইয়ের অপেক্ষায়" : "নথিটি ব্যবহারযোগ্য নয়"}</p><p className="text-xs text-muted-foreground">স্বয়ংক্রিয়ভাবে মুছে যাবে: {file.retentionExpiresAt.toLocaleDateString("bn-BD")}</p></div>
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
    </article>)}</div> : <p className="py-5 text-sm text-muted-foreground">এখনো কোনো নথি যোগ করা হয়নি।</p>}
    <div className="mt-6 border-t pt-5">
      <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-semibold">নথি থেকে লেখা সংগ্রহ</h3><Button variant="outline" size="sm" onClick={() => void tasks.refetch()} disabled={tasks.isFetching}><RefreshCw size={14} className="mr-2" />হালনাগাদ</Button></div>
      <p className="mb-3 text-xs text-muted-foreground">বর্তমানে UTF-8 TXT, CSV ও JSON নথি সমর্থিত। PDF, DOCX, XLSX ও ছবির OCR এখনো চালু নয়। নিরাপত্তা স্ক্যান সম্পন্ন ও নথি মেয়াদোত্তীর্ণ না হলেই কাজ শুরু হবে।</p>
      {tasks.isLoading ? <p className="py-3 text-sm text-muted-foreground">কাজের তালিকা লোড হচ্ছে…</p> : tasks.isError ? <p role="status" className="py-3 text-sm text-destructive">কাজের তালিকা পাওয়া যায়নি।</p> : tasks.data?.length ? <div className="space-y-3">{tasks.data.map(task => {
        const active = ["queued", "running", "retry_wait"].includes(task.status);
        return <article key={task.id} className="rounded-xl border p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0"><p className="break-all text-sm font-medium">{files.data?.find(file => file.id === task.fileAssetId)?.originalName || "নথি"}</p><p className="text-xs text-muted-foreground">{taskStatusLabel[task.status] || task.status} · চেষ্টা {task.attemptCount}/{task.maxAttempts}</p></div>
            <div className="flex gap-2">
              {active && <Button size="sm" variant="outline" disabled={cancelTask.isPending} onClick={() => cancelTask.mutate({ taskId: task.id })}><XCircle size={14} className="mr-1" />বাতিল</Button>}
              {task.status === "failed" && <Button size="sm" variant="outline" disabled={retryTask.isPending} onClick={() => retryTask.mutate({ taskId: task.id })}><RotateCcw size={14} className="mr-1" />আবার চেষ্টা</Button>}
            </div>
          </div>
          {task.status === "completed" && <Button size="sm" variant="outline" className="mt-3" onClick={() => setSelectedTaskId(task.id)}>ফলাফল দেখুন</Button>}
          {task.status === "failed" && <p role="status" className="mt-2 text-xs text-destructive">কাজটি সম্পন্ন হয়নি। নিরাপত্তা বা নথির সমস্যা ঠিক করে আবার চেষ্টা করুন। ({task.errorCode || "UNKNOWN"})</p>}
          {task.status === "cancelled" && <p className="mt-2 text-xs text-muted-foreground">এই কাজটি বাতিল করা হয়েছে।</p>}
        </article>;
      })}</div> : <p className="py-3 text-sm text-muted-foreground">এখনো কোনো নথি প্রক্রিয়া করা হয়নি। প্রস্তুত নথির পাশে “লেখা বের করুন” নির্বাচন করুন।</p>}
      {selectedTaskId && <div className="mt-4 rounded-xl border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2"><h4 className="font-semibold">নথির ফলাফল</h4><Button size="sm" variant="ghost" onClick={() => setSelectedTaskId(null)}>বন্ধ করুন</Button></div>
        {selectedTask.isLoading ? <p role="status" className="text-sm text-muted-foreground">ফলাফল লোড হচ্ছে…</p> : selectedTask.isError ? <p role="status" className="text-sm text-destructive">ফলাফল পাওয়া যায়নি।</p> : (() => {
          const result = selectedTask.data?.result as { title?: string; text?: string; format?: string; characterCount?: number; messages?: { title?: string; status?: string } } | null | undefined;
          return result?.text !== undefined ? <div className="space-y-2">
            <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold">{result.messages?.title || "নথির লেখা প্রস্তুত"}</p><Button size="sm" variant="ghost" onClick={() => { void navigator.clipboard.writeText(result.text || "").then(() => toast.success("লেখা কপি হয়েছে।")).catch(() => toast.error("কপি করা যায়নি।")); }}><Copy size={14} className="mr-1" />কপি</Button></div>
            <p className="text-xs text-muted-foreground">{result.characterCount ?? result.text.length} অক্ষর · {result.format || "text"}</p>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted p-3 text-sm leading-6">{result.text}</pre>
          </div> : <p className="text-sm text-muted-foreground">এই কাজের ফলাফল পাওয়া যাচ্ছে না।</p>;
        })()}
      </div>}
    </div>
  </section>;
}
