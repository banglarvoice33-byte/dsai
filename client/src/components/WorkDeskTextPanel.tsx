import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Check, Copy, Loader2, Pencil, RotateCcw, Save, Sparkles, XCircle } from "lucide-react";
import { toast } from "sonner";

const statusLabel: Record<string, string> = {
  queued: "অপেক্ষমাণ", running: "চলমান", retry_wait: "আবার চেষ্টা হবে", completed: "সম্পন্ন",
  failed: "ব্যর্থ", cancelled: "বাতিল",
};

export default function WorkDeskTextPanel({ prefillText }: { prefillText?: string | null }) {
  const [prompt, setPrompt] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedResult, setEditedResult] = useState("");
  useEffect(() => {
    const incoming = prefillText?.trim();
    if (!incoming) return;
    const combined = [prompt.trim(), incoming].filter(Boolean).join("\n\n");
    if (combined.length > 12000) {
      setPrompt(combined.slice(0, 12000));
      toast.info("WorkDesk-এর ১২,০০০ অক্ষরের সীমার মধ্যে OCR লেখা যোগ করা হয়েছে। বাকিটুকু OCR ফলাফল থেকে কপি করতে পারবেন।");
      return;
    }
    setPrompt(combined);
  // A new OCR result is an explicit user action; do not overwrite the prompt on ordinary renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillText]);
  const tasks = trpc.workDesk.textTasks.useQuery({ limit: 20 }, { retry: false, refetchInterval: 8000 });
  const create = trpc.workDesk.createTextTask.useMutation({
    onSuccess: async result => {
      setPrompt("");
      await tasks.refetch();
      if (result.status === "completed") toast.success("আপনার কাজ সম্পন্ন হয়েছে।");
      else if (result.status === "failed") toast.error("কাজটি সম্পন্ন হয়নি। AI সেবা বা কোটা পরীক্ষা করে আবার চেষ্টা করুন।");
      else if (result.status === "queued") toast.success("কাজটি জমা হয়েছে। ফলাফল তৈরি হলে এখানে দেখতে পাবেন।");
    },
    onError: error => toast.error(error.message || "কাজটি শুরু করা যায়নি।"),
  });
  const saveResult = trpc.workDesk.saveTextTaskResult.useMutation({
    onSuccess: async () => {
      setEditingTaskId(null);
      setEditedResult("");
      await tasks.refetch();
      toast.success("আপনার সম্পাদিত খসড়া সংরক্ষণ হয়েছে।");
    },
    onError: error => toast.error(error.message || "সম্পাদিত লেখা সংরক্ষণ করা যায়নি।"),
  });
  const retry = trpc.workDesk.retryTextTask.useMutation({ onSuccess: () => { toast.success("কাজটি আবার জমা হয়েছে।"); void tasks.refetch(); }, onError: () => toast.error("কাজটি আবার শুরু করা যায়নি।") });
  const cancel = trpc.workDesk.cancelTextTask.useMutation({
    onSuccess: () => { toast.info("কাজ বাতিল করা হয়েছে।"); void tasks.refetch(); },
    onError: () => toast.error("কাজটি বাতিল করা যায়নি।"),
  });

  return <section className="workspace-panel space-y-5" aria-labelledby="workdesk-text-title">
    <div className="workspace-panel-heading">
      <div><span className="learn-label">লেখা দিয়ে কাজ</span><h2 id="workdesk-text-title">লেখা দিয়ে কাজ করুন</h2>
      <p>ফাইল ছাড়াই লেখা পাঠিয়ে সাহায্য নিন। কাজটি জমা থাকবে, ফলাফল তৈরি হলে এখানে দেখতে পাবেন।</p></div>
      <Sparkles size={22} />
    </div>
    <form className="space-y-3" onSubmit={event => {
      event.preventDefault();
      create.mutate({ prompt, language: "bn", idempotencyKey: crypto.randomUUID() });
    }}>
      <label htmlFor="workdesk-text-prompt" className="text-sm font-medium">আপনার নির্দেশনা বা লেখা</label>
      <textarea id="workdesk-text-prompt" value={prompt} onChange={event => setPrompt(event.target.value)}
        minLength={3} maxLength={12000} rows={5} required
        placeholder="বাংলায় লিখুন—যেমন, এই লেখাটি সংক্ষেপ করুন, অনুবাদ করুন, ব্যাখ্যা করুন বা একটি চিঠির খসড়া তৈরি করুন।"
        className="w-full rounded-lg border bg-background p-3 text-sm leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{prompt.length.toLocaleString("bn-BD")} / ১২,০০০</span>
        <Button type="submit" disabled={create.isPending || prompt.trim().length < 3}>
          {create.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> জমা হচ্ছে…</> : "কাজ শুরু করুন"}
        </Button>
      </div>
    </form>
    <div className="space-y-3">
      <h3 className="font-semibold">আপনার সাম্প্রতিক কাজ</h3>
      {tasks.isLoading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে…</div>
        : tasks.isError ? <div className="text-sm text-destructive">কাজের তালিকা পাওয়া যায়নি। <Button variant="outline" size="sm" onClick={() => void tasks.refetch()}>আবার চেষ্টা</Button></div>
        : tasks.data?.length ? tasks.data.map(task => <article key={task.id} className="rounded-xl border p-4 space-y-3">
          <div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{new Date(task.createdAt).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" })}</span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs">{statusLabel[task.status] ?? task.status}</span></div>
          {task.result && <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-amber-600/30 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">AI-তৈরি খসড়া · যাচাই প্রয়োজন</span>
              <span className="text-xs text-muted-foreground">তথ্য, বানান ও গুরুত্বপূর্ণ সিদ্ধান্ত নিজে যাচাই করে নিন।</span>
            </div>
            {editingTaskId === task.id
              ? <textarea aria-label="সম্পাদিত AI খসড়া" value={editedResult} onChange={event => setEditedResult(event.target.value)} maxLength={250000} rows={8} className="w-full rounded-lg border bg-background p-3 text-sm leading-7" />
              : <div className="whitespace-pre-wrap break-words text-sm leading-7">{task.result}</div>}
          </div>}
          {task.errorCode && <p className="text-sm text-destructive">কাজটি সম্পন্ন হয়নি ({task.errorCode})। নতুন request দিয়ে আবার চেষ্টা করতে পারেন।</p>}
          <div className="flex flex-wrap gap-2">
            {task.result && <Button variant="outline" size="sm" onClick={() => { void navigator.clipboard.writeText(task.result!); toast.success("ফলাফল কপি হয়েছে।"); }}><Copy className="mr-1 h-3.5 w-3.5" /> কপি</Button>}
            {task.result && editingTaskId !== task.id && <Button variant="outline" size="sm" onClick={() => { setEditingTaskId(task.id); setEditedResult(task.result!); }}><Pencil className="mr-1 h-3.5 w-3.5" /> সম্পাদনা</Button>}
            {task.result && editingTaskId === task.id && <>
              <Button size="sm" onClick={() => saveResult.mutate({ taskId: task.id, editedResult })} disabled={saveResult.isPending || !editedResult.trim()}><Save className="mr-1 h-3.5 w-3.5" /> {saveResult.isPending ? "সংরক্ষণ হচ্ছে…" : "খসড়া সংরক্ষণ"}</Button>
              <Button variant="outline" size="sm" onClick={() => { setEditingTaskId(null); setEditedResult(""); }} disabled={saveResult.isPending}>বাতিল</Button>
            </>}
            {["queued","running","retry_wait","failed"].includes(task.status) && <Button variant="outline" size="sm" onClick={() => cancel.mutate({ taskId: task.id })} disabled={cancel.isPending}><XCircle className="mr-1 h-3.5 w-3.5" /> বাতিল</Button>}
            {task.status === "failed" && <Button variant="outline" size="sm" onClick={() => retry.mutate({ taskId: task.id })} disabled={retry.isPending}><RotateCcw className="mr-1 h-3.5 w-3.5" /> আবার চেষ্টা</Button>}
          </div>
        </article>) : <p className="text-sm text-muted-foreground">এখনো কোনো text task নেই। উপরে লেখা দিয়ে প্রথম কাজটি শুরু করুন।</p>}
    </div>
  </section>;
}
