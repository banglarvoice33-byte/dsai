import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Copy, Download, Edit3, Loader2, RotateCcw, Save, Sparkles, XCircle } from "lucide-react";
import { toast } from "sonner";

const ACTIVE_TASK_STATUSES = new Set(["queued", "running", "retry_wait"]);

const statusLabel: Record<string, string> = {
  queued: "অপেক্ষমাণ", running: "চলমান", retry_wait: "আবার চেষ্টা হবে", completed: "সম্পন্ন",
  failed: "ব্যর্থ", cancelled: "বাতিল",
};

function downloadResult(text: string, taskId: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `dsai-workdesk-${taskId.slice(0, 8)}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function copyResult(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("ফলাফল কপি হয়েছে।");
  } catch {
    toast.error("ফলাফল কপি করা যায়নি। লেখাটি নির্বাচন করে কপি করুন।");
  }
}

export default function WorkDeskTextPanel() {
  const [prompt, setPrompt] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedResults, setEditedResults] = useState<Record<string, string>>({});
  const tasks = trpc.workDesk.textTasks.useQuery({ limit: 20 }, {
    retry: false,
    // Poll only while work is active; idle Work Desk pages make no recurring API calls.
    refetchInterval: query => query.state.data?.some(task => ACTIVE_TASK_STATUSES.has(task.status)) ? 15_000 : false,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  });
  const create = trpc.workDesk.createTextTask.useMutation({
    onSuccess: async result => {
      setPrompt("");
      await tasks.refetch();
      if (result.status === "completed") toast.success("আপনার কাজ সম্পন্ন হয়েছে।");
      else if (result.status === "failed") toast.error("কাজটি সম্পন্ন হয়নি। AI সেবা বা কোটা পরীক্ষা করে আবার চেষ্টা করুন।");
      else if (result.status === "queued") toast.success("কাজটি নিরাপদ queue-তে জমা হয়েছে; ব্যাকএন্ড worker ফলাফল তৈরি করবে।");
    },
    onError: error => toast.error(error.message || "কাজটি শুরু করা যায়নি।"),
  });
  const retry = trpc.workDesk.retryTextTask.useMutation({ onSuccess: () => { toast.success("কাজটি আবার queue-তে জমা হয়েছে।"); void tasks.refetch(); }, onError: () => toast.error("কাজটি আবার শুরু করা যায়নি।") });
  const cancel = trpc.workDesk.cancelTextTask.useMutation({
    onSuccess: () => { toast.info("কাজ বাতিল করা হয়েছে।"); void tasks.refetch(); },
    onError: () => toast.error("কাজটি বাতিল করা যায়নি।"),
  });
  const saveEdited = trpc.workDesk.saveTextTaskResult.useMutation({
    onSuccess: async result => {
      setEditedResults(current => ({ ...current, [result.id]: result.result ?? "" }));
      setEditingTaskId(null);
      await tasks.refetch();
      toast.success("সম্পাদিত ফলাফল স্থায়ীভাবে সংরক্ষিত হয়েছে।");
    },
    onError: error => toast.error(error.message || "সংরক্ষণ করা যায়নি। আপনার সম্পাদিত লেখা এই সেশনে রাখা হয়েছে।"),
  });

  return <section className="workspace-panel space-y-5" aria-labelledby="workdesk-text-title">
    <div className="workspace-panel-heading">
      <div><span className="learn-label">নিরাপদ text-only workflow</span><h2 id="workdesk-text-title">লেখা দিয়ে কাজ করুন</h2>
      <p>ফাইল আপলোড বা malware scanner ছাড়াই লেখা পাঠিয়ে AI-র সাহায্য নিন। কাজটি durable queue-তে সংরক্ষিত হয়; ব্যাকএন্ড worker ফলাফল তৈরি করে আপনার অ্যাকাউন্টে রাখে।</p></div>
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
            {editingTaskId === task.id
              ? <><label className="block text-xs font-medium text-muted-foreground" htmlFor={`workdesk-edit-${task.id}`}>ফলাফল সম্পাদনা করুন</label><textarea id={`workdesk-edit-${task.id}`} value={editedResults[task.id] ?? task.result} onChange={event => setEditedResults(current => ({ ...current, [task.id]: event.target.value }))} disabled={saveEdited.isPending} rows={8} className="w-full rounded-lg border bg-background p-3 text-sm leading-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /><p className="text-xs text-muted-foreground">সংরক্ষণ করলে পরিবর্তন আপনার অ্যাকাউন্টে থাকবে এবং পরে আবার খুলতে পারবেন। মূল AI ফলাফল আলাদাভাবে অক্ষত থাকবে।</p></>
              : <div className="whitespace-pre-wrap break-words text-sm leading-7">{editedResults[task.id] ?? task.result}</div>}
          </div>}
          {task.status === "failed" && <p className="text-sm text-destructive">এই কাজটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।</p>}
          <div className="flex flex-wrap gap-2">
            {task.result && <>
              {editingTaskId === task.id && <Button size="sm" onClick={() => saveEdited.mutate({ taskId: task.id, editedResult: editedResults[task.id] ?? task.result! })} disabled={saveEdited.isPending || !(editedResults[task.id] ?? task.result).trim()}>
                {saveEdited.isPending ? <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> সংরক্ষণ হচ্ছে…</> : <><Save className="mr-1 h-3.5 w-3.5" /> সংরক্ষণ</>}
              </Button>}
              <Button variant="outline" size="sm" onClick={() => { void copyResult(editedResults[task.id] ?? task.result!); }}><Copy className="mr-1 h-3.5 w-3.5" /> কপি</Button>
              <Button variant="outline" size="sm" onClick={() => setEditingTaskId(current => current === task.id ? null : task.id)}><Edit3 className="mr-1 h-3.5 w-3.5" /> {editingTaskId === task.id ? "সম্পাদনা বন্ধ" : "সম্পাদনা"}</Button>
              <Button variant="outline" size="sm" onClick={() => { downloadResult(editedResults[task.id] ?? task.result!, task.id); toast.success("ফলাফল TXT ফাইলে ডাউনলোড হয়েছে।"); }}><Download className="mr-1 h-3.5 w-3.5" /> ডাউনলোড</Button>
            </>}
            {["queued","running","retry_wait","failed"].includes(task.status) && <Button variant="outline" size="sm" onClick={() => cancel.mutate({ taskId: task.id })} disabled={cancel.isPending}><XCircle className="mr-1 h-3.5 w-3.5" /> বাতিল</Button>}
            {task.status === "failed" && <Button variant="outline" size="sm" onClick={() => retry.mutate({ taskId: task.id })} disabled={retry.isPending}><RotateCcw className="mr-1 h-3.5 w-3.5" /> আবার চেষ্টা</Button>}
          </div>
        </article>) : <p className="text-sm text-muted-foreground">এখনো কোনো text task নেই। উপরে লেখা দিয়ে প্রথম কাজটি শুরু করুন।</p>}
    </div>
  </section>;
}
