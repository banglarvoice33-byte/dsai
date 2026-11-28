import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Activity, ArrowDownToLine, Check, CheckCircle2, Clock3, Copy, FileText,
  Filter, Loader2, Paperclip, RefreshCw, RotateCcw, Save, Search, Send, ShieldCheck,
  Sparkles, WandSparkles, XCircle, Volume2, Square,
} from "lucide-react";
import FileUploadPanel from "@/components/FileUploadPanel";
import { Streamdown } from "streamdown";
import { normalizeBanglaForSpeech } from "@/lib/bn-speech.mjs";
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

function splitSpeechChunks(value: string, maxLength = 220) {
  const chunks: string[] = [];
  let remaining = value.replace(/\s+/g, " ").trim();
  while (remaining.length > maxLength) {
    let boundary = remaining.lastIndexOf(" ", maxLength);
    if (boundary < Math.floor(maxLength * 0.55)) boundary = maxLength;
    chunks.push(remaining.slice(0, boundary).trim());
    remaining = remaining.slice(boundary).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

export default function WorkDeskTextPanel({ prefillText, skillPrompt, initialShowFiles = false }: { prefillText?: string | null; skillPrompt?: { id: string; prompt: string } | null; initialShowFiles?: boolean }) {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState<"bn" | "en" | "auto">("bn");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "failed">("all");
  const [search, setSearch] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  // Follow the newest server task until the user explicitly selects history.
  const [followLatestTask, setFollowLatestTask] = useState(true);
  const [editedResult, setEditedResult] = useState("");
  const [isEditingResult, setIsEditingResult] = useState(false);
  const [draftTaskId, setDraftTaskId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<"auto" | "openrouter" | "gemini">("auto");
  const [geminiBillingConsent, setGeminiBillingConsent] = useState(false);
  const [showFiles, setShowFiles] = useState(initialShowFiles);
  // Retain the idempotency key after a transport error; the server may already have persisted the task.
  const [pendingSubmission, setPendingSubmission] = useState<WorkDeskTaskSubmission | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechQueueRef = useRef<string[]>([]);
  const speechRunIdRef = useRef(0);

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
    if (prompt.trim() && prompt.trim() !== template && !window.confirm("আপনার বর্তমান নির্দেশনায় লেখা আছে। Skill template বসালে সেটি প্রতিস্থাপিত হবে। এগোবেন?")) return;
    setPrompt(template.slice(0, 12000));
    setLanguage("bn");
    toast.success("Skill নির্দেশনা WorkDesk-এ যোগ হয়েছে।");
  }, [skillPrompt?.id]);

  const connectorList = trpc.userConnectors.list.useQuery(undefined, { retry: false, staleTime: 30_000 });
  const personalOpenRouterReady = Boolean(connectorList.data?.some(item => item.id === "openrouter" && item.connected && item.workDeskEnabled));
  const personalGeminiReady = Boolean(connectorList.data?.some(item => item.id === "gemini" && item.connected && item.workDeskEnabled));
  useEffect(() => { if ((!personalOpenRouterReady && selectedProvider === "openrouter") || (!personalGeminiReady && selectedProvider === "gemini")) setSelectedProvider("auto"); }, [personalOpenRouterReady, personalGeminiReady, selectedProvider]);

  const tasks = trpc.workDesk.textTasks.useQuery({ limit: 30 }, {
    retry: false,
    refetchInterval: query => query.state.data?.some(task => ["queued", "running", "retry_wait"].includes(task.status)) ? 6000 : 30000,
    refetchIntervalInBackground: false,
    staleTime: 5000,
  });
  const start = trpc.workDesk.startTextTask.useMutation({
    onSuccess: async result => {
      await tasks.refetch();
      if (result.status === "completed") {
        toast.success("আপনার কাজ সম্পন্ন হয়েছে।");
      } else if (result.status === "failed") {
        toast.error(result.errorMessage || "AI কাজটি সম্পন্ন করতে পারেনি। কাজের তালিকা থেকে আবার চেষ্টা করুন।");
      } else if (result.status === "queued" || result.status === "retry_wait") {
        toast.info("কাজটি জমা আছে; AI worker চালু হলে ফলাফল দেখাবে।");
      }
    },
    onError: error => {
      toast.error(error.message || "কাজটি জমা হয়েছে, কিন্তু AI চালু করা যায়নি। সাম্প্রতিক কাজ থেকে আবার শুরু করুন।");
      void tasks.refetch();
    },
  });
  const create = trpc.workDesk.createTextTask.useMutation({
    onSuccess: async result => {
      setPendingSubmission(null);
      setPrompt(""); setFollowLatestTask(true); setSelectedTaskId(result.id);
      // Publish the persisted task in history before starting provider I/O.
      // The owner can then see its status and cancel it while the worker is running.
      await tasks.refetch();
      if (["queued", "retry_wait"].includes(result.status)) {
        toast.info("কাজ গ্রহণ করা হয়েছে; AI-তে পাঠানো হচ্ছে…");
        start.mutate({ taskId: result.id });
      } else if (result.status === "completed") {
        toast.success("আপনার কাজ সম্পন্ন হয়েছে।");
      } else if (result.status === "failed") {
        toast.error(result.errorMessage || "কাজটি শুরু করা যায়নি।");
      }
    },
    onError: error => toast.error(error.message || "কাজটি জমা দেওয়া যায়নি।"),
  });
  const save = trpc.workDesk.saveTextTaskResult.useMutation({
    onSuccess: async result => {
      setEditedResult(result.result ?? "");
      setIsEditingResult(false);
      await tasks.refetch();
      toast.success("আপনার সম্পাদিত ফলাফল স্থায়ীভাবে সংরক্ষণ হয়েছে।");
    },
    onError: error => toast.error(error.message || "সম্পাদিত ফলাফল সংরক্ষণ করা যায়নি।"),
  });
  const retry = trpc.workDesk.retryTextTask.useMutation({
    onSuccess: async result => {
      setFollowLatestTask(true);
      setSelectedTaskId(result.id);
      if (result.status === "queued") start.mutate({ taskId: result.id });
      await tasks.refetch();
      toast.success("কাজটি আবার শুরু হচ্ছে।");
    },
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
    if (followLatestTask && allTasks.length > 0 && selectedTaskId !== allTasks[0].id) {
      // The first cached response may be stale; keep following the newest row after refetch.
      setSelectedTaskId(allTasks[0].id);
      return;
    }
    if (!activeTask) {
      if (!selectedTaskId && allTasks.length > 0) setSelectedTaskId(allTasks[0].id);
      return;
    }

    if (draftTaskId !== activeTask.id) {
      // A newly selected task starts with its persisted result, never the prior task's draft.
      setEditedResult(activeTask.result ?? "");
      setIsEditingResult(false);
      setDraftTaskId(activeTask.id);
      return;
    }

    // Polling updates the same task object as queued/running work completes.
    // Hydrate its result when it arrives, but never overwrite an active or unsaved edit.
    const persistedOriginal = activeTask.originalResult ?? "";
    const hasLocalDraft = editedResult.trim().length > 0
      && editedResult !== persistedOriginal
      && editedResult !== (activeTask.result ?? "");
    if (
      activeTask.status === "completed"
      && !isEditingResult
      && !hasLocalDraft
      && editedResult !== (activeTask.result ?? "")
    ) {
      setEditedResult(activeTask.result ?? "");
    }
  }, [
    activeTask?.id,
    activeTask?.status,
    activeTask?.result,
    activeTask?.originalResult,
    draftTaskId,
    selectedTaskId,
    allTasks,
    followLatestTask,
    isEditingResult,
    editedResult,
  ]);

  const stopSpeaking = () => {
    speechRunIdRef.current += 1;
    speechQueueRef.current = [];
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakResult = () => {
    if (!editedResult.trim()) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      toast.error("এই ব্রাউজারে Read Aloud সমর্থিত নয়।");
      return;
    }
    stopSpeaking();
    const normalized = normalizeBanglaForSpeech(editedResult).text;
    speechQueueRef.current = splitSpeechChunks(normalized);
    const runId = speechRunIdRef.current;
    const voices = window.speechSynthesis.getVoices();

    const speakNext = () => {
      if (runId !== speechRunIdRef.current) return;
      const chunk = speechQueueRef.current.shift();
      if (!chunk) { setIsSpeaking(false); return; }
      const banglaCount = (chunk.match(/[\u0980-\u09FF]/g) ?? []).length;
      const latinCount = (chunk.match(/[A-Za-z]/g) ?? []).length;
      const isBangla = banglaCount >= latinCount;
      const preferredVoice = voices.find(voice => isBangla
        ? /^(bn|bn-bd)(-|$)/i.test(voice.lang)
        : /^(en-us|en-gb|en)(-|$)/i.test(voice.lang));
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = isBangla ? "bn-BD" : "en-US";
      utterance.rate = 0.92;
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.onend = speakNext;
      utterance.onerror = event => {
        if (runId !== speechRunIdRef.current) return;
        speechQueueRef.current = [];
        setIsSpeaking(false);
        if (event.error !== "canceled" && event.error !== "interrupted") toast.error("লেখাটি পড়ে শোনানো যায়নি।");
      };
      window.speechSynthesis.speak(utterance);
    };
    setIsSpeaking(true);
    speakNext();
  };

  useEffect(() => () => {
    speechRunIdRef.current += 1;
    speechQueueRef.current = [];
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const isSubmitting = create.isPending || start.isPending;
  const canSubmit = prompt.trim().length >= 3 && prompt.trim().length <= 12000 && !isSubmitting && (selectedProvider !== "gemini" || geminiBillingConsent);
  const hasUnsavedEdits = Boolean(activeTask?.status === "completed" && editedResult.trim() && editedResult !== (activeTask.result ?? ""));

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-y-6 sm:gap-y-8" aria-labelledby="workdesk-title">
      <header className="flex flex-wrap items-end justify-between gap-4 px-1">
        <div>
          
          <h1 id="workdesk-title" className="text-3xl font-semibold tracking-tight text-[#1d3028] sm:text-4xl lg:text-5xl">কী করতে চান?</h1>
          
        </div>
        <div className="flex items-center gap-2 text-sm text-[#52675b]">
          <span className="rounded-full border border-[#dce7df] bg-white px-3 py-2.5 text-sm"><Activity className="mr-1 inline h-3.5 w-3.5 text-[#27805b]" />{activeCount.toLocaleString("bn-BD")} চলমান</span>
          <span className="rounded-full border border-[#dce7df] bg-white px-3 py-2.5 text-sm"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />{completedCount.toLocaleString("bn-BD")} সম্পন্ন</span>
        </div>
      </header>

      {activeTask && (
        <section className="order-5 overflow-hidden rounded-3xl border border-[#e0e8e1] bg-white shadow-[0_8px_28px_rgba(22,55,38,.04)]" aria-label="সাম্প্রতিক ফলাফল" aria-live="polite">
          <div className="flex items-center justify-between gap-3 border-b border-[#edf1ed] px-5 py-3">
            <span className="text-sm font-semibold text-[#344b3c]">সাম্প্রতিক ফলাফল</span>
            <span className={"rounded-full border px-2.5 py-1 text-[10px] font-medium " + (statusTone[activeTask.status] ?? statusTone.cancelled)}>{statusLabel[activeTask.status] ?? activeTask.status}</span>
          </div>
          {activeTask.status === "completed" ? (
            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[#20372c] sm:text-lg">DSAI উত্তর</p>
                  
                </div>
                <details className="group rounded-xl border border-[#e5ebe5] bg-[#f8faf8] px-3 py-2 text-xs text-[#637268]">
                  <summary className="cursor-pointer font-medium">সেবার বিবরণ</summary>
                  <div className="mt-2 space-y-1 border-t border-[#e5ebe5] pt-2">
                    <p>সংযোগের ধরন: {activeTask.requestedProvider === "openrouter" ? "আপনার OpenRouter API" : activeTask.requestedProvider === "gemini" ? "আপনার Gemini API · Google-এর বিলিং প্রযোজ্য" : "DSAI-এর বিনামূল্যের AI সংযোগ"}</p>
                    {activeTask.provider && <p>AI সেবা: {activeTask.provider}</p>}
                    {activeTask.model && <p className="break-all">AI মডেল: {activeTask.model}</p>}
                    {activeTask.requestedProvider === "gemini" && (
                      <p>অনুরোধের অবস্থা: {activeTask.providerChargeStatus === "unknown" ? "নিশ্চিত নয়—আবার পাঠালে দ্বৈত চার্জ হতে পারে" : activeTask.providerChargeStatus === "submitted" ? "প্রদানকারীর কাছে পাঠানো হয়েছে" : activeTask.providerChargeStatus === "not_submitted" ? "এখনো পাঠানো হয়নি" : "প্রযোজ্য নয়"}</p>
                    )}
                  </div>
                </details>
              </div>
              {activeTask.editedResult && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">আপনার সম্পাদিত ফলাফল সংরক্ষিত।</p>}
              {isEditingResult ? (
                <textarea value={editedResult} onChange={event => setEditedResult(event.target.value)} rows={14} maxLength={250000} aria-label="সম্পাদনাযোগ্য DSAI ফলাফল" className="min-h-72 w-full resize-y rounded-2xl border border-[#dce5dd] bg-[#fbfdfb] p-4 text-base leading-8 text-[#24372d] sm:text-lg outline-none focus:border-[#27805b] focus:ring-4 focus:ring-[#27805b]/10" />
              ) : (
                <div role="region" aria-label="DSAI উত্তর" className="min-h-72 rounded-2xl border border-[#e2e9e2] bg-[#fbfdfb] p-5 text-base leading-8 text-[#24372d] sm:p-7 sm:text-lg">
                  {editedResult.trim() ? <div className="prose prose-base max-w-none break-words text-[#24372d] sm:prose-lg"><Streamdown>{editedResult}</Streamdown></div> : <p className="text-[#7b897f]">এই কাজের কোনো লেখা ফলাফল পাওয়া যায়নি।</p>}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[#778278]">{editedResult.length.toLocaleString("bn-BD")} / ২,৫০,০০০ অক্ষর</span>
                <div className="flex flex-wrap gap-2">
                  {!isSpeaking ? <Button type="button" variant="outline" size="sm" onClick={speakResult} disabled={!editedResult.trim()}><Volume2 className="mr-1 h-3.5 w-3.5" /> শুনুন</Button> : <Button type="button" variant="outline" size="sm" onClick={stopSpeaking}><Square className="mr-1 h-3.5 w-3.5" /> থামুন</Button>}
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsEditingResult(value => !value)} disabled={!editedResult.trim()}><WandSparkles className="mr-1 h-3.5 w-3.5" /> {isEditingResult ? "সম্পাদনা বন্ধ" : "সম্পাদনা"}</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => void copyText(editedResult)} disabled={!editedResult.trim()}><Copy className="mr-1 h-3.5 w-3.5" /> কপি</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => downloadText(editedResult, activeTask.id)} disabled={!editedResult.trim()}><ArrowDownToLine className="mr-1 h-3.5 w-3.5" /> ডাউনলোড</Button>
                  <Button type="button" size="sm" onClick={() => save.mutate({ taskId: activeTask.id, editedResult })} disabled={!hasUnsavedEdits || save.isPending || !editedResult.trim()} className="bg-[#176b4b] text-white hover:bg-[#10563b]"><Save className="mr-1 h-3.5 w-3.5" /> {save.isPending ? "সংরক্ষণ হচ্ছে…" : "পরিবর্তন সংরক্ষণ"}</Button>
                </div>
              </div>
              {activeTask.originalResult && editedResult !== activeTask.originalResult && <details className="rounded-xl border border-[#e5ebe5] bg-[#f8faf8] p-3"><summary className="cursor-pointer text-xs font-semibold text-[#526257]">মূল AI ফলাফল</summary><pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#405046]">{activeTask.originalResult}</pre></details>}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
              {["queued", "running", "retry_wait"].includes(activeTask.status) ? <Loader2 className="h-7 w-7 animate-spin text-[#27805b]" /> : <Activity className="h-7 w-7 text-amber-600" />}
              <p className="text-sm font-semibold text-[#2c4235]">{statusLabel[activeTask.status] ?? activeTask.status}</p>
              <p className="max-w-lg text-sm leading-6 text-[#718078]">{activeTask.errorMessage || "ফলাফল প্রস্তুত হলে এখানে দেখা যাবে।"}</p>
              {activeTask.providerChargeStatus === "unknown" && <p className="max-w-lg rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950">Provider অনুরোধ গ্রহণ বা বিল করেছে কি না নিশ্চিত হওয়া যায়নি। Google AI Studio-এর usage পরীক্ষা না করে আবার চালাবেন না। পুনরায় চেষ্টা করলে নতুন provider charge হতে পারে।</p>}
              <div className="flex flex-wrap justify-center gap-2">
                {["queued", "running", "retry_wait"].includes(activeTask.status) && <Button type="button" variant="outline" size="sm" onClick={() => cancel.mutate({ taskId: activeTask.id })} disabled={cancel.isPending}>কাজ বাতিল</Button>}
                {activeTask.status === "queued" && <Button type="button" variant="outline" size="sm" onClick={() => start.mutate({ taskId: activeTask.id })} disabled={start.isPending}>আবার শুরু</Button>}
                {activeTask.status === "failed" && <Button type="button" variant="outline" size="sm" onClick={() => { const gemini = activeTask.requestedProvider === "gemini"; if (gemini && !window.confirm("এই Gemini request আবার পাঠালে Google আপনার project-এ নতুন charge করতে পারে। আপনি কি নতুন করে সম্মতি দিচ্ছেন?")) return; retry.mutate({ taskId: activeTask.id, ...(gemini ? { providerConsent: true } : {}) }); }} disabled={retry.isPending}><RotateCcw className="mr-1 h-3.5 w-3.5" /> পুনরায় চেষ্টা</Button>}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="order-2 overflow-hidden rounded-[28px] border border-[#dfe7df] bg-white shadow-[0_18px_55px_rgba(22,55,38,.07)]" aria-label="নতুন কাজের নির্দেশনা">
        <form className="space-y-4 p-4 sm:p-6" onSubmit={event => {
          event.preventDefault();
          const submission = resolveWorkDeskTaskSubmission(
            pendingSubmission,
            { prompt: prompt.trim(), language, ...(selectedProvider === "openrouter" ? { provider: "openrouter" as const } : selectedProvider === "gemini" ? { provider: "gemini" as const, providerConsent: geminiBillingConsent } : {}) },
            () => crypto.randomUUID(),
          );
          setPendingSubmission(submission);
          create.mutate(submission);
        }}>
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-1">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#43594b]"><WandSparkles className="h-5 w-5 text-[#27805b]" /> আপনার কাজ</span>
            <label className="flex items-center gap-2 text-sm text-[#5e7065]">ভাষা
              <select value={language} onChange={event => setLanguage(event.target.value as "bn" | "en" | "auto")} className="min-h-10 rounded-lg border border-[#e1e8e1] bg-[#fbfdfb] px-3 py-2 text-sm text-[#33463b]"><option value="bn">বাংলা</option><option value="en">English</option><option value="auto">স্বয়ংক্রিয়</option></select>
            </label>
          </div>
          <textarea id="workdesk-text-prompt" value={prompt} onChange={event => setPrompt(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} minLength={3} maxLength={12000} rows={4} required aria-label="আপনার নির্দেশনা" aria-describedby="workdesk-prompt-hint" placeholder="আপনার কাজ লিখুন… (Enter পাঠাবে, Shift+Enter নতুন লাইন)" className="min-h-44 w-full resize-y border-0 bg-white px-3 py-3 text-lg leading-8 text-[#20372c] outline-none placeholder:text-[#89998e] focus:ring-0 sm:px-4 sm:text-xl" />
          {showFiles && <div className="mx-1 rounded-2xl border border-[#e5ebe5] bg-[#f8faf8] p-3 sm:p-4">
            <FileUploadPanel onOcrText={text => setPrompt(current => [current.trim(), text.trim()].filter(Boolean).join("\n\n").slice(0, 12000))} />
          </div>}
          <p id="workdesk-prompt-hint" className="sr-only">Enter চাপলে নির্দেশনা পাঠানো হবে। নতুন লাইন দিতে Shift এবং Enter একসঙ্গে চাপুন।</p>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ed] px-2 pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowFiles(value => !value)} className="min-h-11 rounded-full border-[#dce6dd] px-4 text-sm text-[#43594b] hover:bg-[#f3f8f4]"><Paperclip className="mr-1 h-4 w-4" /> {showFiles ? "ফাইল বন্ধ করুন" : "ফাইল / ছবি যোগ করুন"}</Button>
              <select aria-label="AI provider" value={selectedProvider} onChange={event => { setSelectedProvider(event.target.value as "auto" | "openrouter" | "gemini"); setGeminiBillingConsent(false); }} className="min-h-11 max-w-[220px] rounded-full border border-[#e1e8e1] bg-[#fbfdfb] px-3 py-2 text-sm text-[#52675b]">
                <option value="auto">DSAI Free route</option>{personalOpenRouterReady && <option value="openrouter">আমার OpenRouter Free</option>}{personalGeminiReady && <option value="gemini">আমার Gemini BYOK</option>}
              </select>
              {selectedProvider === "gemini" && <label className="flex max-w-2xl items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950"><input type="checkbox" checked={geminiBillingConsent} onChange={event => setGeminiBillingConsent(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-amber-700" /><span>আমি বুঝেছি: এই অনুরোধটি আমার Google Gemini API key দিয়ে পাঠানো হবে। Google-এর Free quota শেষ হলে আমার Google project-এ খরচ হতে পারে। এই অনুরোধে DSAI Free Credit কাটা হবে না।</span></label>}
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-[#7b8b80] sm:inline">{prompt.length.toLocaleString("bn-BD")} / ১২,০০০</span>
              <Button type="submit" disabled={!canSubmit} className="min-h-12 rounded-full bg-[#176b4b] px-7 text-base font-semibold text-white shadow-sm hover:bg-[#10563b]">
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {start.isPending ? "AI-তে পাঠানো হচ্ছে…" : "পাঠানো হচ্ছে…"}</> : <><Send className="mr-2 h-4 w-4" /> পাঠান</>}
              </Button>
            </div>
          </div>
        </form>
      </section>
      <p className="order-4 px-2 text-center text-xs leading-5 text-[#7b897f]">
        এআই-তৈরি উত্তর ভুল হতে পারে—গুরুত্বপূর্ণ তথ্য যাচাই করে নিন।
      </p>

      <div className="order-3 flex flex-wrap gap-2 px-1">{promptIdeas.map(idea => <button key={idea} type="button" onClick={() => setPrompt(current => (current.trim() ? current.trim() + "\n\n" : "") + idea)} className="min-h-10 rounded-full border border-[#dfe7df] bg-white px-4 py-2 text-sm text-[#52675b] transition hover:border-[#9bbca7] hover:text-[#176b4b]">{idea}</button>)}</div>

      <section className="order-1 overflow-hidden rounded-3xl border border-[#e0e8e1] bg-white" aria-label="সাম্প্রতিক কাজের তালিকা">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1ed] px-5 py-4">
          <div><h2 className="text-lg font-semibold text-[#263c30] sm:text-xl">সাম্প্রতিক কাজ</h2></div>
          <div className="flex flex-wrap gap-2">
            <label className="relative"><span className="sr-only">কাজ খুঁজুন</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b968c]" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="কাজ খুঁজুন" className="h-11 w-40 rounded-full border border-[#e1e8e1] bg-[#fbfdfb] pl-9 pr-3 text-sm outline-none focus:border-[#27805b] sm:w-52" /></label>
            <Button type="button" variant="outline" size="sm" onClick={() => void tasks.refetch()} disabled={tasks.isFetching}><RefreshCw className={"mr-1 h-3.5 w-3.5 " + (tasks.isFetching ? "animate-spin" : "")} /> হালনাগাদ</Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 px-5 pt-4">
          {([{ id: "all", label: "সব" }, { id: "active", label: "চলমান" }, { id: "completed", label: "সম্পন্ন" }, { id: "failed", label: "ব্যর্থ" }] as const).map(item => <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={"rounded-full border px-3 py-1.5 text-xs transition " + (filter === item.id ? "border-[#176b4b] bg-[#176b4b] text-white" : "border-[#dfe7df] bg-white text-[#647167] hover:border-[#9bbca7]")}>{item.label}</button>)}
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          {tasks.isLoading ? <div className="col-span-full flex items-center gap-2 py-8 text-sm text-[#778278]"><Loader2 className="h-4 w-4 animate-spin" /> কাজ লোড হচ্ছে…</div>
            : tasks.isError ? <div className="col-span-full rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">কাজের তালিকা পাওয়া যায়নি। <Button variant="outline" size="sm" onClick={() => void tasks.refetch()}>আবার চেষ্টা</Button></div>
            : filteredTasks.length ? filteredTasks.map(task => <article key={task.id} className={"rounded-2xl border p-4 transition " + (selectedTaskId === task.id ? "border-[#9bbca7] bg-[#f5faf6]" : "border-[#e5ebe5] bg-white hover:border-[#c8d7ca]")}>
                <button type="button" onClick={() => { setFollowLatestTask(false); setSelectedTaskId(task.id); }} className="w-full text-left">
                  <div className="flex items-center justify-between gap-3"><span className={"rounded-full border px-2.5 py-1 text-[10px] font-medium " + (statusTone[task.status] ?? statusTone.cancelled)}>{statusLabel[task.status] ?? task.status}</span><span className="text-xs text-[#75847a]">{formatDate(task.createdAt)}</span></div>
                  <p className="mt-3 line-clamp-3 whitespace-pre-wrap break-words text-base leading-7 text-[#34473a]">{task.prompt || "নির্দেশনা"}</p>
                  {task.editedResult && <div className="mt-3 text-xs font-medium text-emerald-700"><Check size={13} className="mr-1 inline" />সম্পাদনা সংরক্ষিত</div>}
                </button>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-[#e6e9e2] pt-3">
                  {task.result && <Button variant="outline" size="sm" onClick={() => { setSelectedTaskId(task.id); void copyText(task.result!); }}><Copy className="mr-1 h-3 w-3" /> কপি</Button>}
                  {task.status === "queued" && <Button variant="outline" size="sm" onClick={() => { setSelectedTaskId(task.id); start.mutate({ taskId: task.id }); }} disabled={start.isPending}><Send className="mr-1 h-3 w-3" /> শুরু করুন</Button>}
                  {["queued", "running", "retry_wait"].includes(task.status) && <Button variant="outline" size="sm" onClick={() => cancel.mutate({ taskId: task.id })} disabled={cancel.isPending}><XCircle className="mr-1 h-3 w-3" /> বাতিল</Button>}
                  {task.status === "failed" && <Button variant="outline" size="sm" onClick={() => retry.mutate({ taskId: task.id })} disabled={retry.isPending}><RotateCcw className="mr-1 h-3 w-3" /> পুনরায় চেষ্টা</Button>}
                </div>
              </article>)
            : <div className="col-span-full py-8 text-center text-sm text-[#7b877d]"><Filter className="mx-auto mb-2 h-5 w-5" />এই ফিল্টারে কোনো কাজ পাওয়া যায়নি।</div>}
        </div>
      </section>
    </section>
  );
}
