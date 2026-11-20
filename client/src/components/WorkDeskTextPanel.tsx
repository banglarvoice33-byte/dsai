import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { toast } from "sonner";

const statusLabel: Record<string, string> = {
  queued: "অপেক্ষমাণ", running: "চলমান", retry_wait: "আবার চেষ্টা হবে", completed: "সম্পন্ন",
  failed: "ব্যর্থ", cancelled: "বাতিল",
};

export default function WorkDeskTextPanel() {
  const [prompt, setPrompt] = useState("");
  const tasks = trpc.workDesk.textTasks.useQuery({ limit: 20 }, { retry: false, refetchInterval: 8000 });
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
          {task.result && <div className="whitespace-pre-wrap break-words text-sm leading-7">{task.result}</div>}
          {task.errorCode && <p className="text-sm text-destructive">কাজটি সম্পন্ন হয়নি ({task.errorCode})। নতুন request দিয়ে আবার চেষ্টা করতে পারেন।</p>}
          <div className="flex flex-wrap gap-2">
            {task.result && <Button variant="outline" size="sm" onClick={() => { void navigator.clipboard.writeText(task.result!); toast.success("ফলাফল কপি হয়েছে।"); }}><Copy className="mr-1 h-3.5 w-3.5" /> কপি</Button>}
            {["queued","running","retry_wait","failed"].includes(task.status) && <Button variant="outline" size="sm" onClick={() => cancel.mutate({ taskId: task.id })} disabled={cancel.isPending}><XCircle className="mr-1 h-3.5 w-3.5" /> বাতিল</Button>}
            {task.status === "failed" && <Button variant="outline" size="sm" onClick={() => retry.mutate({ taskId: task.id })} disabled={retry.isPending}><RotateCcw className="mr-1 h-3.5 w-3.5" /> আবার চেষ্টা</Button>}
          </div>
        </article>) : <p className="text-sm text-muted-foreground">এখনো কোনো text task নেই। উপরে লেখা দিয়ে প্রথম কাজটি শুরু করুন।</p>}
    </div>
  </section>;
}
