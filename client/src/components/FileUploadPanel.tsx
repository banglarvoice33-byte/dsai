import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { FileUp, Download, Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const ACCEPT = ".pdf,.docx,.xlsx,.csv,.txt,.json,.jpg,.jpeg,.png,.webp";
const MAX_BYTES = 10 * 1024 * 1024;

export default function FileUploadPanel() {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const files = trpc.files.list.useQuery(undefined, { retry: false });
  const upload = async (file?: File) => {
    if (!file) return;
    if (file.size < 1 || file.size > MAX_BYTES) { toast.error("ফাইল ১০ MiB-এর মধ্যে হতে হবে।"); return; }
    setBusy(true);
    setProgress("ফাইল যাচাই ও malware scan হচ্ছে…");
    try {
      const bytes = await file.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const sha256 = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
      const response = await fetch("/api/files/upload", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-File-Name": encodeURIComponent(file.name),
          "X-File-Mime": file.type || "application/octet-stream",
          "X-File-Sha256": sha256,
        },
        body: bytes,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || result.error || "Upload failed");
      toast.success("নিরাপদে upload হয়েছে।");
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
        <p>আপনার account-এ private storage। Malware scan সফল না হলে কোনো ফাইল সংরক্ষণ বা download করা হবে না।</p></div>
      <ShieldCheck size={22} />
    </div>
    <div className="rounded-xl border border-dashed p-5 space-y-3">
      <label htmlFor="dsai-file-upload" className="flex flex-col items-center gap-2 cursor-pointer text-center">
        <FileUp size={28} />
        <strong>Document নির্বাচন করুন</strong>
        <span className="text-sm text-muted-foreground">PDF, DOCX, XLSX, CSV, TXT, JSON, JPG, PNG, WebP · সর্বোচ্চ ১০ MiB</span>
      </label>
      <input id="dsai-file-upload" type="file" accept={ACCEPT} disabled={busy} className="block w-full text-sm" onChange={e => { void upload(e.currentTarget.files?.[0]); e.currentTarget.value = ""; }} />
      {busy && <div role="status" className="flex items-center gap-2 text-sm"><Loader2 className="animate-spin h-4 w-4" />{progress}</div>}
    </div>
    <div className="flex items-center justify-between mt-5">
      <h3 className="font-semibold">Saved files</h3>
      <Button variant="outline" size="sm" onClick={() => void files.refetch()} disabled={files.isFetching}><RefreshCw size={14} className="mr-2" />Refresh</Button>
    </div>
    {files.isLoading ? <p className="py-5 text-sm text-muted-foreground">লোড হচ্ছে…</p> : files.isError ? <p className="py-5 text-sm text-destructive">ফাইলের তালিকা পাওয়া যায়নি।</p> : files.data?.length ? <div className="divide-y">{files.data.map(file => <article key={file.id} className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0"><p className="truncate font-medium">{file.originalName}</p><p className="text-xs text-muted-foreground">{(file.byteSize / 1024).toFixed(1)} KB · {file.scanStatus}</p></div>
      {file.scanStatus === "clean" && <Button size="sm" variant="outline" onClick={() => { window.location.href = "/api/files/" + file.id + "/download"; }}><Download size={14} className="mr-1" />Download</Button>}
    </article>)}</div> : <p className="py-5 text-sm text-muted-foreground">এখনো কোনো document upload করা হয়নি।</p>}
  </section>;
}
