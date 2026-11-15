import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { FileUp, Download, Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/supabaseAuthClient";

const ACCEPT = ".pdf,.docx,.xlsx,.csv,.txt,.json,.jpg,.jpeg,.png,.webp";
const MAX_BYTES = 10 * 1024 * 1024;

async function authenticatedHeaders(extra: Record<string, string> = {}) {
  const token = await getAccessToken();
  return { ...extra, Authorization: `Bearer ${token}` };
}

export default function FileUploadPanel() {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const files = trpc.files.list.useQuery(undefined, { retry: false });
  const policy = trpc.files.policy.useQuery(undefined, { retry: false });
  const retryScan = async (fileId: number) => {
    try {
      const response = await fetch("/api/files/" + fileId + "/finalize", { method: "POST", credentials: "include", headers: await authenticatedHeaders() });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || result.error || "Security scan failed");
      if (result.status === "clean") toast.success("ClamAV scan সফল; ফাইল download করা যাবে।");
      else toast.info("ফাইল এখনো private quarantine-এ আছে।");
      await files.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Scan retry failed");
    }
  };
  const upload = async (file?: File) => {
    if (!file) return;
    if (file.size < 1 || file.size > MAX_BYTES) { toast.error("ফাইল ১০ MiB-এর মধ্যে হতে হবে।"); return; }
    setBusy(true);
    setProgress("ফাইল যাচাই ও private storage-এ পাঠানো হচ্ছে…");
    try {
      const bytes = await file.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const sha256 = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
      const extension = file.name.toLowerCase().split(".").pop() || "";
      const mimeByExtension: Record<string, string> = {
        pdf: "application/pdf", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", csv: "text/csv",
        txt: "text/plain", json: "application/json", jpg: "image/jpeg", jpeg: "image/jpeg",
        png: "image/png", webp: "image/webp",
      };
      const mimeType = file.type || mimeByExtension[extension] || "";
      if (!mimeType) throw new Error("এই ফাইলের ধরন সমর্থিত নয়।");
      setProgress("Secure upload token তৈরি হচ্ছে…");
      const initResponse = await fetch("/api/files/upload/init", {
        method: "POST", credentials: "include",
        headers: await authenticatedHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ originalName: file.name, mimeType, byteSize: file.size, sha256 }),
      });
      const init = await initResponse.json().catch(() => ({}));
      if (!initResponse.ok) throw new Error(init.message || init.error || "Upload initialization failed");
      setProgress("Private file storage-এ upload হচ্ছে…");
      const uploadHeaders: Record<string, string> = { "Content-Type": mimeType };
      // R2 presigned PUTs are create-once; the condition prevents URL replay/overwrite.
      if (init.storageProvider === "r2") uploadHeaders["If-None-Match"] = "*";
      const storageResponse = await fetch(init.uploadUrl, {
        method: "PUT", headers: uploadHeaders, body: bytes,
      });
      if (!storageResponse.ok) throw new Error("Private Storage upload failed (" + storageResponse.status + ")");
      setProgress(policy.data?.scannerAvailable ? "ClamAV malware scan চলছে…" : "Private quarantine status নিশ্চিত হচ্ছে…");
      const finalizeResponse = await fetch("/api/files/" + init.fileId + "/finalize", {
        method: "POST", credentials: "include", headers: await authenticatedHeaders(),
      });
      const finalized = await finalizeResponse.json().catch(() => ({}));
      if (!finalizeResponse.ok) throw new Error(finalized.message || finalized.error || "Security scan failed");
      if (finalized.scanStatus === "pending" || finalized.status === "quarantined") toast.info("ফাইল private quarantine-এ upload হয়েছে। নিরাপত্তা স্ক্যান চালু না হওয়া পর্যন্ত download বন্ধ থাকবে।");
      else toast.success("Malware scan সফল; ফাইল নিরাপদে সংরক্ষিত হয়েছে।");
      await files.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
      setProgress("");
    }
  };
  return <section className="workspace-panel">
    <div className="workspace-panel-heading">
      <div><span className="learn-label">DSAI / PRIVATE FILES</span><h2>আপনার Documents</h2>
        <p>আপনার account-এর private storage। স্ক্যান সম্পন্ন না হওয়া পর্যন্ত ফাইল quarantine-এ থাকবে এবং download বন্ধ থাকবে।</p></div>
      <ShieldCheck size={22} />
    </div>
    <div className="rounded-xl border border-dashed p-5 space-y-3">
      <label htmlFor="dsai-file-upload" className="flex flex-col items-center gap-2 cursor-pointer text-center">
        <FileUp size={28} />
        <strong>Document নির্বাচন করুন</strong>
        <span className="text-sm text-muted-foreground">PDF, DOCX, XLSX, CSV, TXT, JSON, JPG, PNG, WebP · সর্বোচ্চ ১০ MiB</span>
      </label>
      {!policy.isLoading && policy.data && !policy.data.uploadsEnabled && <p role="status" className="text-sm text-amber-700">{policy.data.unavailableReason || "নিরাপদ upload বর্তমানে বন্ধ।"}</p>}
      {policy.data?.scanNotice && <p role="status" className="text-sm text-amber-700">{policy.data.scanNotice}</p>}
      {policy.isError && <p role="status" className="text-sm text-destructive">Upload security status যাচাই করা যায়নি।</p>}
      {policy.data?.scanner?.storageProvider && <p className="text-xs text-muted-foreground">Storage: {policy.data.scanner.storageProvider === "r2" ? "Cloudflare R2 (free-tier Standard)" : "Supabase Storage (private fallback)"}</p>}
      {policy.data?.scannerAvailable && <p className="text-xs text-muted-foreground">Malware scanning: ClamAV configured</p>}
      <input id="dsai-file-upload" type="file" accept={ACCEPT} disabled={busy || policy.isLoading || !policy.data?.uploadsEnabled} className="block w-full text-sm" onChange={e => { void upload(e.currentTarget.files?.[0]); e.currentTarget.value = ""; }} />
      {busy && <div role="status" className="flex items-center gap-2 text-sm"><Loader2 className="animate-spin h-4 w-4" />{progress}</div>}
    </div>
    <div className="flex items-center justify-between mt-5">
      <h3 className="font-semibold">Saved files</h3>
      <Button variant="outline" size="sm" onClick={() => void files.refetch()} disabled={files.isFetching}><RefreshCw size={14} className="mr-2" />Refresh</Button>
    </div>
    {files.isLoading ? <p className="py-5 text-sm text-muted-foreground">লোড হচ্ছে…</p> : files.isError ? <p className="py-5 text-sm text-destructive">ফাইলের তালিকা পাওয়া যায়নি।</p> : files.data?.length ? <div className="divide-y">{files.data.map(file => <article key={file.id} className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0"><p className="truncate font-medium">{file.originalName}</p><p className="text-xs text-muted-foreground">{(file.byteSize / 1024).toFixed(1)} KB · {file.scanStatus}</p></div>
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
      {file.scanStatus === "quarantined" && policy.data?.scannerAvailable && <Button size="sm" variant="outline" onClick={() => void retryScan(file.id)}>Scan now</Button>}
    </article>)}</div> : <p className="py-5 text-sm text-muted-foreground">এখনো কোনো document upload করা হয়নি।</p>}
  </section>;
}
