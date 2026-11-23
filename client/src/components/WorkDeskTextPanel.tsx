import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Activity, ArrowDownToLine, Check, CheckCircle2, Clock3, Copy, FileText,
  Filter, Loader2, RefreshCw, RotateCcw, Save, Search, Send, ShieldCheck,
  Sparkles, WandSparkles, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { resolveWorkDeskTaskSubmission, type WorkDeskTaskSubmission } from "@shared/workDeskTaskSubmission";

const statusLabel: Record<string, string> = {
  queued: "অপেক্ষমাণ", running: "প্রক্রিয়াধীন", retry_wait: "পুনরায় চেষ্টার অপেক্ষায়",
  completed: "সম্পন্ন", failed: "ব্যর্থ", cancelled: "বাতিল",
};
const statusTone: Record<string, string> = {
  queued: "border-amber-200 bg-amber-50 text-amber-800",
  running: "border-sky-200 bg-sky-50 text-sky-800",
  retry_wait: "border-orange-200 bg-orange-50 text-orange-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  failed: "border-rose-200 bg-rose-50 text-rose-800",
  cancelled: "border-slate-200 bg-slate-100 text-slate-600",
};
const promptIdeas = [
  "এই লেখাটি সহজ বাংলায় বুঝিয়ে দিন",
  "মূল বিষয়গুলো bullet point-এ সংক্ষেপ করুন",
  "পেশাদার একটি চিঠির খসড়া তৈরি করুন",
  "বাংলা থেকে ইংরেজিতে অনুবাদ করুন",
];

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString("bn-BD", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka",
  });
}
async function copyText(value: string) {
  try { await navigator.clipboard.writeText(value); toast.success("লেখা কপি হয়েছে।"); }
  catch { toast.error("কপি করা যায়নি। ব্রাউজারের clipboard অনুমতি পরীক্ষা করুন।"); }
}
function downloadText(value: string, taskId: string) {
  const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "dsai-workdesk-" + taskId.slice(0, 8) + ".txt";
  document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
}

export default function WorkDeskTextPanel({ prefillText, skillPrompt }: { prefillText?: string | null; skillPrompt?: { id: string; prompt: string } | null }) {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState<"bn" | "en" | "auto">("bn");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "failed">("all");
  const [search, setSearch] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editedResult, setEditedResult] = useState("");
  const [draftTaskId, setDraftTaskId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<"auto" | "openrouter">("auto");
  // Retain the idempotency key after a transport error; the server may already have persisted the task.
  const [pendingSubmission, setPendingSubmission] = useState<WorkDeskTaskSubmission | null>(null);

  useEffect(() => {
    const incoming = prefillText?.trim();
    if (!incoming) return;
    setPrompt(current => {
      const combined = [current.trim(), incoming].filter(Boolean).join("\n\n");
      if (combined.length > 12000) {
        toast.info("OCR লেখা ১২,০০০ অক্ষরের সীমার মধ্যে যোগ করা হয়েছে।");
        return combined.slice(0, 12000);
      }
      return combined;
    });
  }, [prefillText]);

  // A selected marketplace skill is a reusable prompt recipe, not an external
  // tool invocation. It is loaded into the normal, authenticated WorkDesk queue.
  useEffect(() => {
    const template = skillPrompt?.prompt.trim();
    if (!template) return;
    setPrompt(template.slice(0, 12000));
    setLanguage("bn");
    toast.success("Skill নির্দেশনা WorkDesk-এ যোগ হয়েছে।");
  }, [skillPrompt?.id]);

  const connectorList = trpc.userConnectors.list.useQuery(undefined, { retry: false, staleTime: 30_000 });
  const personalOpenRouterReady = Boolean(connectorList.data?.some(item => item.id === "openrouter" && item.connected && item.workDeskEnabled));
  useEffect(() => { if (!personalOpenRouterReady && selectedProvider === "openrouter") setSelectedProvider("auto"); }, [personalOpenRouterReady, selectedProvider]);

  const tasks = trpc.workDesk.textTasks.useQuery({ limit: 30 }, {
    retry: false,
    refetchInterval: query => query.state.data?.some(task => ["queued", "running", "retry_wait"].includes(task.status)) ? 6000 : 30000,
    refetchIntervalInBackground: false,
    staleTime: 5000,
  });
  const create = trpc.workDesk.createTextTask.useMutation({
    onSuccess: async result => {
      setPendingSubmission(null);
      setPrompt(""); setSelectedTaskId(result.id);
      await tasks.refetch();
      toast.success(result.status === "completed" ? "আপনার কাজ সম্পন্ন হয়েছে।" : "কাজটি নিরাপদে জমা হয়েছে।");
    },
    onError: error => toast.error(error.message || "কাজটি শুরু করা যায়নি।"),
  });
  const save = trpc.workDesk.saveTextTaskResult.useMutation({
    onSuccess: async result => {
      setEditedResult(result.result ?? "");
      await tasks.refetch();
      toast.success("আপনার সম্পাদিত ফলাফল স্থায়ীভাবে সংরক্ষণ হয়েছে।");
    },
    onError: error => toast.error(error.message || "সম্পাদিত ফলাফল সংরক্ষণ করা যায়নি।"),
  });
  const retry = trpc.workDesk.retryTextTask.useMutation({
    onSuccess: async result => { await tasks.refetch(); setSelectedTaskId(result.id); toast.success("কাজটি আবার queue-তে জমা হয়েছে।"); },
    onError: error => toast.error(error.message || "কাজটি আবার শুরু করা যায়নি।"),
  });
  const cancel = trpc.workDesk.cancelTextTask.useMutation({
    onSuccess: async () => { await tasks.refetch(); toast.info("কাজ বাতিল করা হয়েছে।"); },
    onError: error => toast.error(error.message || "কাজটি বাতিল করা যায়নি।"),
  });

  const allTasks = tasks.data ?? [];
  const activeCount = allTasks.filter(task => ["queued", "running", "retry_wait"].includes(task.status)).length;
  const completedCount = allTasks.filter(task => task.status === "completed").length;
  const failedCount = allTasks.filter(task => task.status === "failed").length;
  const filteredTasks = useMemo(() => allTasks.filter(task => {
    const matchesFilter = filter === "all" ||
      (filter === "active" && ["queued", "running", "retry_wait"].includes(task.status)) ||
      (filter === "completed" && task.status === "completed") ||
      (filter === "failed" && task.status === "failed");
    const q = search.trim().toLocaleLowerCase();
    return matchesFilter && (!q || String(task.prompt ?? "").toLocaleLowerCase().includes(q));
  }), [allTasks, filter, search]);
  const activeTask = allTasks.find(task => task.id === selectedTaskId) ?? null;

  useEffect(() => {
    if (activeTask && draftTaskId !== activeTask.id) {
      setEditedResult(activeTask.result ?? "");
      setDraftTaskId(activeTask.id);
    }
    if (!selectedTaskId && allTasks.length > 0) setSelectedTaskId(allTasks[0].id);
  }, [activeTask, allTasks, draftTaskId, selectedTaskId]);

  const canSubmit = prompt.trim().length >= 3 && prompt.trim().length <= 12000 && !create.isPending;
  const hasUnsavedEdits = Boolean(activeTask?.status === "completed" && editedResult.trim() && editedResult !== (activeTask.result ?? ""));

  return (
    <section className="space-y-6" aria-labelledby="workdesk-title">
      <header className="relative isolate overflow-hidden rounded-[28px] bg-[#172923] px-5 py-7 text-[#f8f4e9] shadow-[0_24px_70px_rgba(20,39,31,.16)] sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-[#d9ad64]/25" />
        <div className="pointer-events-none absolute -right-5 -top-9 h-44 w-44 rounded-full border border-[#d9ad64]/20" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-36 w-1/2 bg-gradient-to-l from-[#b75a3c]/20 to-transparent" />
        <div className="relative grid gap-7 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d9ad64]/35 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.2em] text-[#f1d18f]"><span className="h-1.5 w-1.5 rounded-full bg-[#d9ad64]" />DSAI / Intelligent Workbench</span>
            <h2 id="workdesk-title" className="mt-5 max-w-3xl font-display text-3xl leading-tight sm:text-5xl">আপনার কাজ, <em className="text-[#e0b86c] not-italic">আরও গোছানো</em>।</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#f8f4e9]/70 sm:text-base">লেখা দিন, ফলাফল তৈরি করুন, প্রয়োজনমতো সম্পাদনা করুন—আপনার প্রতিটি কাজ ব্যক্তিগতভাবে সংরক্ষিত থাকবে।</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[#f8f4e9]/65">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-[#e0b86c]" /> ব্যক্তিগত ও owner-scoped</span>
              <span className="inline-flex items-center gap-2"><Activity size={15} className="text-[#e0b86c]" /> Durable task queue</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[#e0b86c]" /> আপনার নিয়ন্ত্রণে</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[.06] p-3 sm:p-4"><Clock3 size={17} className="text-[#e0b86c]" /><strong className="mt-3 block text-2xl tabular-nums">{activeCount.toLocaleString("bn-BD")}</strong><span className="mt-1 block text-[10px] leading-4 text-white/55">চলমান</span></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.06] p-3 sm:p-4"><CheckCircle2 size={17} className="text-[#a8d4b5]" /><strong className="mt-3 block text-2xl tabular-nums">{completedCount.toLocaleString("bn-BD")}</strong><span className="mt-1 block text-[10px] leading-4 text-white/55">সম্পন্ন</span></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.06] p-3 sm:p-4"><XCircle size={17} className="text-[#f2a39a]" /><strong className="mt-3 block text-2xl tabular-nums">{failedCount.toLocaleString("bn-BD")}</strong><span className="mt-1 block text-[10px] leading-4 text-white/55">সমস্যা</span></div>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)]">
        <section className="overflow-hidden rounded-[24px] border border-[#1d332b]/12 bg-white shadow-[0_16px_45px_rgba(27,42,34,.06)]">
          <div className="border-b border-[#1d332b]/10 bg-[#fbfaf6] px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#963a28] text-white shadow-lg shadow-[#963a28]/15"><WandSparkles size={20} /></span><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#963a28]">নতুন কাজ</p><h3 className="mt-1 text-lg font-semibold text-[#1b2d25]">AI-কে নির্দেশনা দিন</h3></div></div>
            <p className="mt-3 text-sm leading-6 text-[#617067]">সারাংশ, অনুবাদ, ব্যাখ্যা, চিঠি, প্রতিবেদন বা নিজের প্রয়োজনের কাজ লিখুন।</p>
          </div>
          <form className="space-y-4 p-5 sm:p-6" onSubmit={event => {
            event.preventDefault();
            const submission = resolveWorkDeskTaskSubmission(
              pendingSubmission,
              {
                prompt: prompt.trim(),
                language,
                ...(selectedProvider === "openrouter" ? { provider: "openrouter" as const } : {}),
              },
              () => crypto.randomUUID(),
            );
            setPendingSubmission(submission);
            create.mutate(submission);
          }}>
            <div className="flex flex-wrap gap-2">{promptIdeas.map(idea => <button key={idea} type="button" onClick={() => setPrompt(current => (current.trim() ? current.trim() + "\n\n" : "") + idea)} className="rounded-full border border-[#1d332b]/12 bg-[#f8f6f0] px-3 py-2 text-[11px] text-[#53645a] transition hover:border-[#963a28]/35 hover:bg-[#fff8f1] hover:text-[#963a28]">{idea}</button>)}</div>
            <div className="rounded-2xl border border-[#d9ded5] bg-[#fbfaf6] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-sm font-semibold text-[#24372d]">AI provider</p><p className="mt-1 text-xs text-[#778278]">নিজের সংযুক্ত Free route ব্যবহার করতে পারেন।</p></div>
                <select aria-label="WorkDesk AI provider" value={selectedProvider} onChange={event => setSelectedProvider(event.target.value as "auto" | "openrouter")} className="min-h-10 rounded-xl border border-[#d9ded5] bg-white px-3 text-xs">
                  <option value="auto">DSAI automatic free route</option>
                  {personalOpenRouterReady && <option value="openrouter">আমার OpenRouter Free connector</option>}
                </select>
              </div>
              {!personalOpenRouterReady && <p className="mt-2 text-[11px] leading-5 text-[#7a867c]">নিজের OpenRouter key যুক্ত করতে Marketplace → Connectors খুলুন।</p>}
            </div>
            <label htmlFor="workdesk-text-prompt" className="block text-sm font-semibold text-[#24372d]">আপনার নির্দেশনা বা লেখা</label>
            <textarea id="workdesk-text-prompt" value={prompt} onChange={event => setPrompt(event.target.value)} minLength={3} maxLength={12000} rows={8} required placeholder="বাংলায় লিখুন—যেমন, এই নথিটি সহজ ভাষায় বুঝিয়ে দিন, গুরুত্বপূর্ণ বিষয়গুলো সংক্ষেপ করুন, অথবা একটি পেশাদার চিঠি তৈরি করুন…" className="min-h-48 w-full resize-y rounded-2xl border border-[#d9ded5] bg-[#fdfcf9] p-4 text-sm leading-7 text-[#23352b] outline-none transition placeholder:text-[#97a197] focus:border-[#963a28] focus:ring-4 focus:ring-[#963a28]/10" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-[#778278]"><span>{prompt.length.toLocaleString("bn-BD")} / ১২,০০০</span><span className="h-1 w-1 rounded-full bg-[#a8b0a7]" /><label className="flex items-center gap-2">ভাষা<select value={language} onChange={event => setLanguage(event.target.value as "bn" | "en" | "auto")} className="rounded-lg border border-[#d9ded5] bg-white px-2 py-1.5 text-xs text-[#33463b]"><option value="bn">বাংলা</option><option value="en">English</option><option value="auto">স্বয়ংক্রিয়</option></select></label></div>
              <Button type="submit" disabled={!canSubmit} className="min-h-11 rounded-xl bg-[#963a28] px-5 text-white shadow-lg shadow-[#963a28]/15 hover:bg-[#7e3023]">{create.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> জমা হচ্ছে…</> : <><Send className="mr-2 h-4 w-4" /> কাজ শুরু করুন</>}</Button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-[24px] border border-[#1d332b]/12 bg-white shadow-[0_16px_45px_rgba(27,42,34,.06)]" aria-labelledby="workdesk-result-title">
          <div className="flex items-center justify-between gap-3 border-b border-[#1d332b]/10 bg-[#fbfaf6] px-5 py-5 sm:px-6"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#963a28]">ফলাফল ও সম্পাদনা</p><h3 id="workdesk-result-title" className="mt-1 text-lg font-semibold text-[#1b2d25]">আপনার ফলাফল</h3></div><FileText size={20} className="text-[#963a28]" /></div>
          {activeTask?.status === "completed" ? (
            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#778278]"><span>{activeTask.provider ? "Provider: " + activeTask.provider : "AI ফলাফল"}</span><span>{activeTask.model ?? ""}</span></div>
              {activeTask.editedResult && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">আপনার সর্বশেষ সম্পাদনা সংরক্ষিত। মূল AI ফলাফল আলাদা রাখা হয়েছে।</p>}
              <textarea value={editedResult} onChange={event => setEditedResult(event.target.value)} rows={12} maxLength={250000} aria-label="সম্পাদনাযোগ্য AI ফলাফল" className="min-h-64 w-full resize-y rounded-2xl border border-[#d9ded5] bg-[#fdfcf9] p-4 text-sm leading-7 text-[#23352b] outline-none focus:border-[#963a28] focus:ring-4 focus:ring-[#963a28]/10" />
              <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-[#778278]">{editedResult.length.toLocaleString("bn-BD")} / ২,৫০,০০০ অক্ষর</span><div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => void copyText(editedResult)} disabled={!editedResult.trim()}><Copy className="mr-1 h-3.5 w-3.5" /> কপি</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => downloadText(editedResult, activeTask.id)} disabled={!editedResult.trim()}><ArrowDownToLine className="mr-1 h-3.5 w-3.5" /> ডাউনলোড</Button>
                <Button type="button" size="sm" onClick={() => save.mutate({ taskId: activeTask.id, editedResult })} disabled={!hasUnsavedEdits || save.isPending || !editedResult.trim()} className="bg-[#963a28] text-white hover:bg-[#7e3023]"><Save className="mr-1 h-3.5 w-3.5" /> {save.isPending ? "সংরক্ষণ হচ্ছে…" : "পরিবর্তন সংরক্ষণ"}</Button>
              </div></div>
              {activeTask.originalResult && <details className="rounded-xl border border-[#e3e5de] bg-[#faf9f5] p-3"><summary className="cursor-pointer text-xs font-semibold text-[#526257]">অপরিবর্তিত মূল AI ফলাফল দেখুন</summary><pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#405046]">{activeTask.originalResult}</pre></details>}
            </div>
          ) : activeTask ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
              {["queued", "running", "retry_wait"].includes(activeTask.status) ? <Loader2 className="h-8 w-8 animate-spin text-[#963a28]" /> : <Activity className="h-8 w-8 text-[#9b6a3b]" />}
              <h4 className="mt-4 font-semibold text-[#26382e]">{statusLabel[activeTask.status] ?? activeTask.status}</h4>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#728076]">{activeTask.errorMessage || "কাজের অবস্থা হালনাগাদ হচ্ছে। কিছুক্ষণ পর ফলাফল এখানে দেখা যাবে।"}</p>
              {activeTask.status === "failed" && <Button variant="outline" size="sm" onClick={() => retry.mutate({ taskId: activeTask.id })} disabled={retry.isPending} className="mt-4"><RotateCcw className="mr-2 h-4 w-4" /> আবার চেষ্টা</Button>}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#f5eee3] text-[#963a28]"><Sparkles size={24} /></span><h4 className="mt-4 font-semibold text-[#26382e]">আপনার প্রথম কাজের অপেক্ষায়</h4><p className="mt-2 max-w-sm text-sm leading-6 text-[#728076]">নির্দেশনা লিখে কাজ শুরু করুন। ফলাফল তৈরি হলে এখানে সম্পাদনা ও সংরক্ষণ করতে পারবেন।</p></div>
          )}
        </section>
      </div>

      <section className="overflow-hidden rounded-[24px] border border-[#1d332b]/12 bg-white shadow-[0_16px_45px_rgba(27,42,34,.06)]">
        <div className="flex flex-col gap-4 border-b border-[#1d332b]/10 bg-[#fbfaf6] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#963a28]">Task history</p><h3 className="mt-1 text-lg font-semibold text-[#1b2d25]">আপনার সাম্প্রতিক কাজ</h3></div>
          <div className="flex flex-wrap gap-2"><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b968c]" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="কাজ খুঁজুন" className="h-10 w-full min-w-36 rounded-xl border border-[#d9ded5] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#963a28] sm:w-48" /></label><Button type="button" variant="outline" size="sm" onClick={() => void tasks.refetch()} disabled={tasks.isFetching}><RefreshCw className={"mr-1 h-3.5 w-3.5 " + (tasks.isFetching ? "animate-spin" : "")} /> হালনাগাদ</Button></div>
        </div>
        <div className="flex flex-wrap gap-2 px-5 pt-4 sm:px-6">
          {([{ id: "all", label: "সব" }, { id: "active", label: "চলমান" }, { id: "completed", label: "সম্পন্ন" }, { id: "failed", label: "ব্যর্থ" }] as const).map(item => <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={"rounded-full border px-3 py-1.5 text-xs transition " + (filter === item.id ? "border-[#963a28] bg-[#963a28] text-white" : "border-[#d9ded5] bg-white text-[#647167] hover:border-[#963a28]/40")}>{item.label}</button>)}
        </div>
        <div className="grid gap-3 p-5 sm:p-6 lg:grid-cols-2">
          {tasks.isLoading ? <div className="col-span-full flex items-center gap-2 py-8 text-sm text-[#778278]"><Loader2 className="h-4 w-4 animate-spin" /> আপনার কাজ লোড হচ্ছে…</div>
            : tasks.isError ? <div className="col-span-full rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">কাজের তালিকা পাওয়া যায়নি। <Button variant="outline" size="sm" onClick={() => void tasks.refetch()}>আবার চেষ্টা</Button></div>
            : filteredTasks.length ? filteredTasks.map(task => <article key={task.id} className={"rounded-2xl border p-4 transition " + (selectedTaskId === task.id ? "border-[#963a28]/50 bg-[#fffaf5] shadow-[0_8px_24px_rgba(150,58,40,.07)]" : "border-[#e4e7df] bg-white hover:border-[#bdc8bd]")}>
                <button type="button" onClick={() => setSelectedTaskId(task.id)} className="w-full text-left">
                  <div className="flex items-center justify-between gap-3"><span className={"rounded-full border px-2.5 py-1 text-[10px] font-medium " + (statusTone[task.status] ?? statusTone.cancelled)}>{statusLabel[task.status] ?? task.status}</span><span className="text-[10px] text-[#879187]">{formatDate(task.createdAt)}</span></div>
                  <p className="mt-3 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#34473a]">{task.prompt || "নির্দেশনা"}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-[#89938a]"><span>চেষ্টা {task.attemptCount}/{task.maxAttempts}</span>{task.provider && <span>{task.provider}</span>}{task.editedResult && <span className="inline-flex items-center gap-1 text-emerald-700"><Check size={12} /> সম্পাদনা সংরক্ষিত</span>}</div>
                </button>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-[#e6e9e2] pt-3">
                  {task.result && <Button variant="outline" size="sm" onClick={() => { setSelectedTaskId(task.id); void copyText(task.result!); }}><Copy className="mr-1 h-3 w-3" /> কপি</Button>}
                  {["queued", "running", "retry_wait"].includes(task.status) && <Button variant="outline" size="sm" onClick={() => cancel.mutate({ taskId: task.id })} disabled={cancel.isPending}><XCircle className="mr-1 h-3 w-3" /> বাতিল</Button>}
                  {task.status === "failed" && <Button variant="outline" size="sm" onClick={() => retry.mutate({ taskId: task.id })} disabled={retry.isPending}><RotateCcw className="mr-1 h-3 w-3" /> পুনরায় চেষ্টা</Button>}
                </div>
              </article>)
            : <div className="col-span-full py-8 text-center text-sm text-[#7b877d]"><Filter className="mx-auto mb-2 h-5 w-5" />এই ফিল্টারে কোনো কাজ পাওয়া যায়নি।</div>}
        </div>
        <p className="border-t border-[#1d332b]/10 px-5 py-3 text-[10px] leading-5 text-[#879187] sm:px-6">সর্বশেষ ৩০টি কাজ দেখানো হয়। কাজগুলো আপনার অ্যাকাউন্টের সঙ্গে যুক্ত; অন্য ব্যবহারকারী এগুলো দেখতে পারবেন না।</p>
      </section>
    </section>
  );
}
