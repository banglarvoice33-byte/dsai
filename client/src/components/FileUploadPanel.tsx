import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { FileUp, Download, Loader2, ShieldCheck, RefreshCw, Trash2 } from "lucide-react";
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
  const files = trpc.files.list.useQuery(undefined, { retry: false });
  const policy = trpc.files.policy.useQuery(undefined, { retry: false });
  const retryScan = async (fileId: number) => {
    try {
      const response = await fetch("/api/files/" + fileId + "/finalize", { method: "POST", credentials: "include", headers: await authenticatedHeaders() });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || result.error || "ফাইলের নিরাপত্তা যাচাই করা যায়নি। পরে আবার চেষ্টা করুন।");
      if (result.status === "clean") toast.success("নিরাপত্তা যাচাই সম্পন্ন; ফাইল download করা যাবে।");
      else if (result.status === "validated") toast.warning("ফাইলের প্রাথমিক যাচাই হয়েছে; নিরাপত্তা যাচাই এখনো সম্পন্ন হয়নি।");
      else toast.info("ফাইলের নিরাপত্তা যাচাই চলছে; যাচাই শেষ না হওয়া পর্যন্ত download বন্ধ থাকবে।");
      await files.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ফাইলের নিরাপত্তা যাচাই করা যায়নি। পরে আবার চেষ্টা করুন।");
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
      if (!response.ok || result.deleted !== true) throw new Error(result.message || result.error || "File deletion failed");
      toast.success("ফাইলটি মুছে ফেলা হয়েছে।");
      await files.refetch();
    } catch (error) {
      toast.error("ফাইল মুছে ফেলা যায়নি। পরে আবার চেষ্টা করুন।");
    } finally {
      setDeletingFileId(null);
    }
  };
  const upload = async (file?: File) => {
    if (!file) return;
    if (file.size < 1 || file.size > MAX_BYTES) { toast.error("ফাইল ১০ MiB-এর মধ্যে হতে হবে।"); return; }
    setBusy(true);
    setProgress("ফাইল যাচাই করে যোগ করা হচ্ছে…");
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
      setProgress("ফাইল যোগ করার প্রস্তুতি চলছে…");
      const initResponse = await fetch("/api/files/upload/init", {
        method: "POST", credentials: "include",
        headers: await authenticatedHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ originalName: file.name, mimeType, byteSize: file.size, sha256 }),
      });
      const init = await initResponse.json().catch(() => ({}));
      if (!initResponse.ok) throw new Error(init.message || init.error || "ফাইল যোগ করা শুরু করা যায়নি। পরে আবার চেষ্টা করুন।");
      setProgress("ফাইল যোগ করা হচ্ছে…");
      const uploadHeaders: Record<string, string> = { "Content-Type": mimeType };
      // R2 presigned PUTs are create-once; the condition prevents URL replay/overwrite.
      if (init.storageProvider === "r2") uploadHeaders["If-None-Match"] = "*";
      const storageResponse = await fetch(init.uploadUrl, {
        method: "PUT", headers: uploadHeaders, body: bytes,
      });
      if (!storageResponse.ok) throw new Error("ফাইল যোগ করা যায়নি (" + storageResponse.status + ")");
      setProgress(policy.data?.scannerAvailable ? "ফাইলের নিরাপত্তা যাচাই চলছে…" : "ফাইলের নিরাপত্তা যাচাইয়ের অবস্থা নিশ্চিত হচ্ছে…");
      const finalizeResponse = await fetch("/api/files/" + init.fileId + "/finalize", {
        method: "POST", credentials: "include", headers: await authenticatedHeaders(),
      });
      const finalized = await finalizeResponse.json().catch(() => ({}));
      if (!finalizeResponse.ok) throw new Error(finalized.message || finalized.error || "ফাইলের নিরাপত্তা যাচাই করা যায়নি। পরে আবার চেষ্টা করুন।");
      if (finalized.status === "validated" || finalized.scanStatus === "validated") toast.warning("ফাইল যোগ হয়েছে। নিরাপত্তা যাচাই সম্পন্ন না হওয়া পর্যন্ত এটি খোলা বা download করা যাবে না।");
      else if (finalized.status === "quarantined") toast.info("ফাইলের নিরাপত্তা যাচাই অপেক্ষমাণ; download বন্ধ।");
      else toast.success("নিরাপত্তা যাচাই সম্পন্ন; ফাইলটি সংরক্ষিত হয়েছে।");
      await files.refetch();
    } catch (error) {
      await files.refetch().catch(() => undefined);
      toast.error("ফাইল যোগ করা যায়নি। পরে আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
      setProgress("");
    }
  };
  return <section className="workspace-panel">
    <div className="workspace-panel-heading">
      <div><span className="learn-label">DSAI / আপনার নথি</span><h2>আপনার Documents</h2>
        <p>আপনার account-এর ব্যক্তিগত নথি। নিরাপত্তা যাচাই শেষ না হওয়া পর্যন্ত কিছু নথি খোলা বা download করা যাবে না।</p></div>
      <ShieldCheck size={22} />
    </div>
    <div className="rounded-xl border border-dashed p-5 space-y-3">
      <label htmlFor="dsai-file-upload" className="flex flex-col items-center gap-2 cursor-pointer text-center">
        <FileUp size={28} />
        <strong>Document নির্বাচন করুন</strong>
        <span className="text-sm text-muted-foreground">PDF, DOCX, XLSX, CSV, TXT, JSON, JPG, PNG, WebP, ZIP · সর্বোচ্চ ১০ MiB</span>
      </label>
      {!policy.isLoading && policy.data && !policy.data.uploadsEnabled && <p role="status" className="text-sm text-amber-700">{"নথি যোগ করা বর্তমানে সাময়িকভাবে বন্ধ। পরে আবার চেষ্টা করুন।"}</p>}
      {policy.data?.scanNotice && <p role="status" className="text-sm text-amber-700">{policy.data.scanNotice}</p>}
      {policy.isError && <p role="status" className="text-sm text-destructive">নথি যোগ করার অবস্থা যাচাই করা যায়নি।</p>}
      <input id="dsai-file-upload" type="file" accept={ACCEPT} disabled={busy || policy.isLoading || !policy.data?.uploadsEnabled} className="block w-full text-sm" onChange={e => { void upload(e.currentTarget.files?.[0]); e.currentTarget.value = ""; }} />
      {busy && <div role="status" className="flex items-center gap-2 text-sm"><Loader2 className="animate-spin h-4 w-4" />{progress}</div>}
    </div>
    <div className="flex items-center justify-between mt-5">
      <h3 className="font-semibold">Saved files</h3>
      <Button variant="outline" size="sm" onClick={() => void files.refetch()} disabled={files.isFetching}><RefreshCw size={14} className="mr-2" />Refresh</Button>
    </div>
    {files.isLoading ? <p className="py-5 text-sm text-muted-foreground">লোড হচ্ছে…</p> : files.isError ? <p className="py-5 text-sm text-destructive">ফাইলের তালিকা পাওয়া যায়নি।</p> : files.data?.length ? <div className="divide-y">{files.data.map(file => <article key={file.id} className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0"><p className="truncate font-medium">{file.originalName}</p><p className="text-xs text-muted-foreground">{(file.byteSize / 1024).toFixed(1)} KB · {file.scanStatus === "clean" ? "নিরাপত্তা যাচাই সম্পন্ন" : file.scanStatus === "validated" || file.scanStatus === "quarantined" ? "নিরাপত্তা যাচাই অপেক্ষমাণ" : "নিরাপত্তা যাচাই চলছে"}</p><p className="text-xs text-muted-foreground">স্বয়ংক্রিয়ভাবে মুছে যাবে: {file.retentionExpiresAt.toLocaleDateString("bn-BD")}</p></div>
      {file.scanStatus === "clean" && <Button size="sm" variant="outline" onClick={async () => {
        try {
          const response = await fetch("/api/files/" + file.id + "/download", { credentials: "include", headers: await authenticatedHeaders() });
          const result = await response.json().catch(() => ({}));
          if (!response.ok || typeof result.downloadUrl !== "string") throw new Error(result.error || "Download link could not be created");
          window.location.assign(result.downloadUrl);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Download failed");
        }
      }}><Download size={14} className="mr-1" />Download</Button>}
      {(file.scanStatus === "quarantined" || file.scanStatus === "validated") && policy.data?.scannerAvailable && <Button size="sm" variant="outline" onClick={() => void retryScan(file.id)}>আবার যাচাই করুন</Button>}
      <Button size="sm" variant="ghost" disabled={deletingFileId === file.id} onClick={() => void deleteFile(file.id, file.originalName)} aria-label={`Delete ${file.originalName}`}><Trash2 size={14} className="mr-1" />{deletingFileId === file.id ? "মুছছে…" : "মুছুন"}</Button>
    </article>)}</div> : <p className="py-5 text-sm text-muted-foreground">এখনো কোনো document upload করা হয়নি।</p>}
  </section>;
}
