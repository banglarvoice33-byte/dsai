import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Activity, ArrowDownToLine, Check, CheckCircle2, Clock3, Copy, FileText,
  Filter, Grid2X2, ImagePlus, Lightbulb, Loader2, Menu, MessageSquare, Mic, Plus,
  RefreshCw, RotateCcw, Save, Search, Send, ShieldCheck, Sparkles, WandSparkles,
  XCircle, Volume2, Square, Pencil,
} from "lucide-react";
import FileUploadPanel from "@/components/FileUploadPanel";
import { Streamdown } from "streamdown";
import { normalizeBanglaForSpeech } from "@/lib/bn-speech.mjs";
import { toast } from "sonner";
import { resolveWorkDeskTaskSubmission, type WorkDeskTaskSubmission } from "@shared/workDeskTaskSubmission";

const statusLabel: Record<string, string> = {
  queued: "চলছে", running: "চলছে", retry_wait: "চলছে",
  completed: "সম্পন্ন", failed: "ব্যর্থ", cancelled: "বাতিল",
};
const statusTone: Record<string, string> = {
  queued: "border-sky-200 bg-sky-50 text-sky-800",
  running: "border-sky-200 bg-sky-50 text-sky-800",
  retry_wait: "border-sky-200 bg-sky-50 text-sky-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  failed: "border-rose-200 bg-rose-50 text-rose-800",
  cancelled: "border-slate-200 bg-slate-100 text-slate-600",
};

function createWorkDeskRequestId() {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === "function") return cryptoApi.randomUUID();

  // Android WebViews may not expose randomUUID even on HTTPS.
  const bytes = new Uint8Array(16);
  if (typeof cryptoApi?.getRandomValues === "function") {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

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

type SpeechChunk = { text: string; lang: "bn-BD" | "en-US" };

type WorkDeskSpeechResult = { 0: { transcript: string } };
type WorkDeskSpeechEvent = { resultIndex: number; results: ArrayLike<WorkDeskSpeechResult> };
type WorkDeskSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: WorkDeskSpeechEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};
type WorkDeskSpeechRecognitionConstructor = new () => WorkDeskSpeechRecognition;

function splitSpeechChunks(value: string, maxLength = 220): SpeechChunk[] {
  const chunks: SpeechChunk[] = [];
  const segments = value.replace(/\s+/g, " ").trim().match(/[\u0980-\u09FF]+|[^\u0980-\u09FF]+/g) ?? [];
  for (const segment of segments) {
    const lang = /[\u0980-\u09FF]/.test(segment) ? "bn-BD" : "en-US";
    let remaining = segment.trim();
    while (remaining.length > maxLength) {
      let boundary = remaining.lastIndexOf(" ", maxLength);
      if (boundary < Math.floor(maxLength * 0.55)) boundary = maxLength;
      const text = remaining.slice(0, boundary).trim();
      if (text) chunks.push({ text, lang });
      remaining = remaining.slice(boundary).trim();
    }
    if (remaining) chunks.push({ text: remaining, lang });
  }
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
  const [documentExtractionPending, setDocumentExtractionPending] = useState(false);
  const [showCurrentResult, setShowCurrentResult] = useState(true);
  const [composerFocused, setComposerFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  // Retain the idempotency key after a transport error; the server may already have persisted the task.
  const [pendingSubmission, setPendingSubmission] = useState<WorkDeskTaskSubmission | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechQueueRef = useRef<SpeechChunk[]>([]);
  const speechRunIdRef = useRef(0);
  const recognitionRef = useRef<WorkDeskSpeechRecognition | null>(null);

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
    onSuccess: async () => { await tasks.refetch(); },
    onError: error => {
      toast.error(error.message || "কাজটি শুরু করা যায়নি। তালিকা থেকে আবার শুরু করুন।");
      void tasks.refetch();
    },
  });
  const create = trpc.workDesk.createTextTask.useMutation({
    onSuccess: async result => {
      setPendingSubmission(null);
      setPrompt(""); setFollowLatestTask(true); setSelectedTaskId(result.id); setShowCurrentResult(true);
      // Start separately after receiving the task ID. This leaves the UI free
      // to issue Cancel while the provider request is still running.
      if (["queued", "retry_wait"].includes(result.status)) start.mutate({ taskId: result.id });
      await tasks.refetch();
      toast.success(result.status === "completed" ? "আপনার কাজ সম্পন্ন হয়েছে।" : "কাজ জমা হয়েছে; প্রক্রিয়া শুরু হচ্ছে।");
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
      setShowCurrentResult(true);
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
      const preferredVoice = voices.find(voice => chunk.lang === "bn-BD"
        ? /^(bn|bn-bd)(-|$)/i.test(voice.lang)
        : /^(en-us|en-gb|en)(-|$)/i.test(voice.lang));
      const utterance = new SpeechSynthesisUtterance(chunk.text);
      utterance.lang = chunk.lang;
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
    recognitionRef.current?.abort();
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const stopSpeechInput = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const startSpeechInput = (continuous = false) => {
    if (isListening) {
      stopSpeechInput();
      return;
    }

    const speechWindow = window as unknown as {
      SpeechRecognition?: WorkDeskSpeechRecognitionConstructor;
      webkitSpeechRecognition?: WorkDeskSpeechRecognitionConstructor;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      toast.error("এই ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়।");
      return;
    }

    try {
      const recognition = new Recognition();
      recognition.lang = language === "en" ? "en-US" : "bn-BD";
      recognition.continuous = continuous;
      recognition.interimResults = false;
      recognition.onresult = event => {
        const transcript = Array.from(
          { length: event.results.length - event.resultIndex },
          (_, index) => event.results[event.resultIndex + index][0]?.transcript ?? "",
        ).join(" ").trim();
        if (transcript) {
          setPrompt(current => [current.trim(), transcript].filter(Boolean).join(" ").slice(0, 12000));
        }
      };
      recognition.onerror = () => {
        setIsListening(false);
        recognitionRef.current = null;
        toast.error("মাইক্রোফোন ইনপুট পাওয়া যায়নি। ব্রাউজারের microphone permission পরীক্ষা করুন।");
      };
      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      toast.error("ভয়েস ইনপুট শুরু করা যায়নি। আবার চেষ্টা করুন।");
    }
  };

  const startNewChat = () => {
    if (documentExtractionPending || create.isPending) {
      toast.info("বর্তমান কাজ বা নথি প্রক্রিয়া শেষ হলে নতুন চ্যাট শুরু করুন।");
      return;
    }
    stopSpeaking();
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setIsListening(false);
    setPrompt("");
    setShowCurrentResult(false);
    setFollowLatestTask(false);
    setIsEditingResult(false);
    setShowFiles(false);
    setSelectedProvider("auto");
    setGeminiBillingConsent(false);
    setPendingSubmission(null);
    setEditedResult("");
    setDraftTaskId(null);
  };

  const isSubmitting = create.isPending || start.isPending;
  const canSubmit = prompt.trim().length >= 3 && prompt.trim().length <= 12000 && !documentExtractionPending && !isSubmitting && (selectedProvider !== "gemini" || geminiBillingConsent);
  const submitPrompt = () => {
    if (isSubmitting) return;
    if (documentExtractionPending) {
      toast.info("নথির নিরাপত্তা যাচাই ও লেখা পড়া শেষ হলে পাঠাতে পারবেন।");
      return;
    }
    const cleanPrompt = prompt.normalize("NFC").trim();
    if (cleanPrompt.length < 3) {
      toast.info("পাঠানোর আগে কমপক্ষে ৩টি অক্ষর লিখুন।");
      document.getElementById("workdesk-text-prompt")?.focus();
      return;
    }
    if (cleanPrompt.length > 12000) {
      toast.error("নির্দেশনা ১২,০০০ অক্ষরের মধ্যে রাখুন।");
      return;
    }
    if (selectedProvider === "gemini" && !geminiBillingConsent) {
      toast.info("Gemini ব্যবহারের আগে বিলিং সম্মতি দিন।");
      return;
    }
    try {
      const submission = resolveWorkDeskTaskSubmission(
        pendingSubmission,
        { prompt: cleanPrompt, language, ...(selectedProvider === "openrouter" ? { provider: "openrouter" as const } : selectedProvider === "gemini" ? { provider: "gemini" as const, providerConsent: geminiBillingConsent } : {}) },
        createWorkDeskRequestId,
      );
      setPendingSubmission(submission);
      create.mutate(submission);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "অনুরোধ প্রস্তুত করা যায়নি। আবার চেষ্টা করুন।");
    }
  };
  const hasUnsavedEdits = Boolean(activeTask?.status === "completed" && editedResult.trim() && editedResult !== (activeTask.result ?? ""));

  return (
    <section className="mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col gap-y-4 pb-28 lg:min-h-0 lg:gap-y-8 lg:pb-0" aria-labelledby="workdesk-title">
      <div className="order-0 sticky top-0 z-40 -mx-4 flex items-center justify-between border-b border-[#ececec] bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <details className="relative">
          <summary aria-label="DSAI navigation menu" className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-full bg-white text-[#202020] shadow-[0_2px_12px_rgba(0,0,0,.07)] [&::-webkit-details-marker]:hidden">
            <Menu size={21} />
          </summary>
          <nav className="absolute left-0 top-12 z-50 min-w-56 rounded-2xl border border-[#e8e8e8] bg-white p-2 shadow-xl" aria-label="Workspace navigation">
            <a href="/workspace" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#24372c] hover:bg-[#f5f7f5]"><MessageSquare size={17} /> নতুন কাজ</a>
            <a href="/ai-hub" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-[#52675b] hover:bg-[#f5f7f5]"><Lightbulb size={17} /> AI Hub / Explore</a>
            <button type="button" onClick={() => setShowFiles(true)} aria-controls="workdesk-tools" aria-expanded={showFiles} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-[#52675b] hover:bg-[#f5f7f5]"><Grid2X2 size={17} /> Workspace tools</button>
            <a href="/documents" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-[#52675b] hover:bg-[#f5f7f5]"><FileText size={17} /> নথি</a>
          </nav>
        </details>

        <a href="/plans" aria-label="DSAI Plus plan details" title="DSAI Plus" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#eff5ff] px-4 py-2.5 text-sm font-semibold text-[#0066ff] transition hover:bg-[#e5efff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066ff]">
          <Sparkles size={17} /> DSAI Plus
        </a>

        <button type="button" onClick={startNewChat} aria-label="New chat" title="New chat" className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#202020] shadow-[0_2px_12px_rgba(0,0,0,.07)] transition hover:bg-[#f7f9fc]">
          <Plus size={23} />
        </button>
      </div>

      <header className="order-0 hidden flex-wrap items-end justify-between gap-4 px-1 lg:flex">
        <div>
          
          <h1 id="workdesk-title" className="text-3xl font-semibold tracking-tight text-[#1d3028] sm:text-4xl lg:text-5xl">কী করতে চান?</h1>
          
        </div>
        <div className="flex items-center gap-2 text-sm text-[#52675b]">
          <span className="rounded-full border border-[#dce7df] bg-white px-3 py-2.5 text-sm"><Activity className="mr-1 inline h-3.5 w-3.5 text-[#27805b]" />{activeCount.toLocaleString("bn-BD")} চলমান</span>
          <span className="rounded-full border border-[#dce7df] bg-white px-3 py-2.5 text-sm"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />{completedCount.toLocaleString("bn-BD")} সম্পন্ন</span>
        </div>
      </header>

      <div className="order-1 hidden min-h-[20vh] flex-1 lg:hidden" aria-hidden="true" />

      {!composerFocused && (
        <div className="order-2 flex flex-col gap-4 px-6 lg:hidden" aria-label="Quick actions">
          <a href="/creative-studio" className="flex min-h-11 items-center gap-3 text-left text-sm font-medium text-[#252525] transition hover:text-[#0066ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0066ff]">
            <ImagePlus size={20} className="text-[#555]" /> ছবি তৈরি করুন
          </a>
          <button type="button" onClick={() => { setPrompt(current => [current.trim(), "নিচের বিষয়টি লিখুন বা সম্পাদনা করুন:"].filter(Boolean).join("\n\n").slice(0, 12000)); document.getElementById("workdesk-text-prompt")?.focus(); }} className="flex min-h-9 items-center gap-3 text-left text-sm font-medium text-[#252525]">
            <Pencil size={19} className="text-[#555]" /> লিখুন বা সম্পাদনা করুন
          </button>
        </div>
      )}

      {activeTask && showCurrentResult && (
        <section className="order-4 lg:order-3 overflow-hidden rounded-3xl border border-[#e0e8e1] bg-white shadow-[0_8px_28px_rgba(22,55,38,.04)]" aria-label="আপনার কাজের ফলাফল" aria-live="polite">
          <div className="flex items-center justify-between gap-3 border-b border-[#edf1ed] px-5 py-3">
            <span className="text-sm font-semibold text-[#344b3c]">আপনার কাজের ফলাফল</span>
            <span className={"rounded-full border px-2.5 py-1 text-[10px] font-medium " + (statusTone[activeTask.status] ?? statusTone.cancelled)}>{statusLabel[activeTask.status] ?? "অবস্থা জানা যাচ্ছে না"}</span>
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
              <p className="text-sm font-semibold text-[#2c4235]">{statusLabel[activeTask.status] ?? "অবস্থা জানা যাচ্ছে না"}</p>
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

      <section className="order-3 relative z-10 overflow-hidden rounded-[28px] border border-[#e7e7e7] bg-white shadow-[0_8px_30px_rgba(0,0,0,.08)] lg:order-2 lg:rounded-[28px] lg:border-[#dfe7df] lg:shadow-[0_18px_55px_rgba(22,55,38,.07)]" aria-label="নতুন কাজের নির্দেশনা">
        <form id="workdesk-compose-form" className="space-y-3 p-3 sm:p-5" onSubmit={event => {
          event.preventDefault();
          submitPrompt();
        }}>
          <div className="flex items-center justify-between gap-3 px-2 pt-1">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#303030]"><Sparkles className="h-4 w-4 text-[#0066ff]" /> Ask DSAI</span>
            <span className="text-[11px] text-[#8e8e93]">{prompt.length.toLocaleString("bn-BD")} / ১২,০০০</span>
          </div>

          <div className="flex items-end gap-2 px-1">
            <button type="button" onClick={() => setShowFiles(value => !value)} aria-label="ফাইল / ছবি যোগ করুন" title="ফাইল / ছবি যোগ করুন" aria-expanded={showFiles} className="grid h-11 w-10 shrink-0 place-items-center rounded-full text-[#252525] transition hover:bg-[#f4f5f6]">
              <Plus size={25} />
            </button>
            <textarea
              id="workdesk-text-prompt"
              value={prompt}
              onChange={event => setPrompt(event.target.value)}
              onFocus={() => setComposerFocused(true)}
              onBlur={() => setComposerFocused(false)}
              minLength={3}
              maxLength={12000}
              rows={2}
              required
              aria-label="আপনার কাজ লিখুন…"
              placeholder="Ask DSAI"
              className="max-h-40 min-h-[54px] min-w-0 flex-1 resize-y border-0 bg-white px-1 py-3 text-base leading-6 text-[#202020] outline-none placeholder:text-[#8e8e93] focus:ring-0"
            />
            <button type="button" onClick={() => startSpeechInput(false)} aria-label="Speech to text" aria-pressed={isListening} title="কথা লিখে নিন" className={`grid h-11 w-9 shrink-0 place-items-center rounded-full transition ${isListening ? "bg-[#eef4ff] text-[#0066ff]" : "text-[#8e8e93] hover:bg-[#f4f5f6]"}`}>
              <Mic size={22} />
            </button>
            <button type="button" onClick={() => startSpeechInput(true)} aria-label="Voice input" aria-pressed={isListening} title="ভয়েসে নির্দেশনা দিন" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0066ff] text-white shadow-sm transition hover:bg-[#0055d4]">
              <Activity size={22} />
            </button>
          </div>

          {isListening && <div className="flex items-center justify-between rounded-xl bg-[#f2f6ff] px-3 py-2 text-xs text-[#2457a7]" role="status">
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-[#0066ff]" /> শুনছি… কথা শেষ হলে মাইক্রোফোন বন্ধ করুন।</span>
            <button type="button" onClick={stopSpeechInput} className="font-semibold underline">থামুন</button>
          </div>}

          {showFiles && <div id="workdesk-tools" className="mx-1 rounded-2xl border border-[#e5ebe5] bg-[#f8faf8] p-3 sm:p-4">
            <FileUploadPanel
              onOcrText={text => setPrompt(current => [current.trim(), text.trim()].filter(Boolean).join("\n\n").slice(0, 12000))}
              onExtractedText={text => setPrompt(current => [current.trim(), "নথির লেখা:\n" + text.trim()].filter(Boolean).join("\n\n").slice(0, 12000))}
              onExtractionPending={setDocumentExtractionPending}
            />
          </div>}

          {documentExtractionPending && <p role="status" className="mx-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">নথির নিরাপত্তা যাচাই ও লেখা পড়া হচ্ছে। শেষ হলে নির্দেশনায় যোগ হবে; তার আগে পাঠানো বন্ধ থাকবে।</p>}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ed] px-2 pt-3">
            <details className="min-w-0 flex-1">
              <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-full px-3 text-xs font-semibold text-[#52675b] hover:bg-[#f5f7f5] [&::-webkit-details-marker]:hidden">
                <Sparkles size={15} /> আরও বিকল্প
              </summary>
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-[#f8faf8] p-3">
                <label className="flex items-center gap-2 text-xs text-[#5e7065]">ভাষা
                  <select value={language} onChange={event => setLanguage(event.target.value as "bn" | "en" | "auto")} className="min-h-10 rounded-lg border border-[#e1e8e1] bg-white px-3 py-2 text-sm text-[#33463b]"><option value="bn">বাংলা</option><option value="en">English</option><option value="auto">স্বয়ংক্রিয়</option></select>
                </label>
                <select aria-label="AI provider" value={selectedProvider} onChange={event => { setSelectedProvider(event.target.value as "auto" | "openrouter" | "gemini"); setGeminiBillingConsent(false); }} className="min-h-10 max-w-full rounded-full border border-[#e1e8e1] bg-white px-3 py-2 text-xs text-[#52675b]">
                  <option value="auto">DSAI Free route</option>{personalOpenRouterReady && <option value="openrouter">আমার OpenRouter Free</option>}{personalGeminiReady && <option value="gemini">আমার Gemini BYOK</option>}
                </select>
                {selectedProvider === "gemini" && <label className="flex max-w-2xl items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950"><input type="checkbox" checked={geminiBillingConsent} onChange={event => setGeminiBillingConsent(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-amber-700" /><span>আমি বুঝেছি: এই অনুরোধটি আমার Google Gemini API key দিয়ে পাঠানো হবে। Google-এর Free quota শেষ হলে আমার Google project-এ খরচ হতে পারে। এই অনুরোধে DSAI Free Credit কাটা হবে না।</span></label>}
              </div>
            </details>
            <Button type="submit" disabled={!canSubmit} aria-label={isSubmitting ? "অনুরোধ পাঠানো হচ্ছে" : "AI-তে নির্দেশনা পাঠান"} className="hidden min-h-11 rounded-full bg-[#0066ff] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#0055d4] lg:inline-flex">
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {start.isPending ? "AI-তে পাঠানো হচ্ছে…" : "পাঠানো হচ্ছে…"}</> : <><Send className="mr-2 h-4 w-4" /> পাঠান</>}
            </Button>
          </div>
        </form>
      </section>
      <p className="order-6 px-2 text-center text-xs leading-5 text-[#7b897f] lg:order-4">
        এআই-তৈরি উত্তর ভুল হতে পারে—গুরুত্বপূর্ণ তথ্য যাচাই করে নিন।
      </p>

      <div className={`fixed inset-x-0 z-50 border-t border-[#e7e7e7] bg-white/95 px-4 py-2 shadow-[0_-4px_18px_rgba(0,0,0,.06)] backdrop-blur lg:hidden bottom-[calc(76px+env(safe-area-inset-bottom))]`} style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}>
        <Button type="button" onClick={submitPrompt} disabled={isSubmitting} aria-label={isSubmitting ? "অনুরোধ পাঠানো হচ্ছে" : "AI-তে নির্দেশনা পাঠান"} className="min-h-12 w-full rounded-full bg-[#176b4b] px-6 text-base font-semibold text-white shadow-sm hover:bg-[#10563b] disabled:cursor-not-allowed disabled:opacity-55">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {start.isPending ? "AI-তে পাঠানো হচ্ছে…" : "পাঠানো হচ্ছে…"}</> : <><Send className="mr-2 h-4 w-4" /> পাঠান</>}
        </Button>
        <p className="mt-1 text-center text-[11px] text-[#718078]" role="status" aria-live="polite">
          {documentExtractionPending ? "নথি প্রক্রিয়া শেষ হলে পাঠাতে পারবেন।" : selectedProvider === "gemini" && !geminiBillingConsent ? "Gemini ব্যবহারের আগে বিলিং সম্মতি দিন।" : prompt.trim().length < 3 ? "কমপক্ষে ৩টি অক্ষর লিখুন।" : create.isError ? (create.error?.message || "অনুরোধ পাঠানো যায়নি। আবার চেষ্টা করুন।") : isSubmitting ? "আপনার অনুরোধ AI-তে পাঠানো হচ্ছে…" : "নির্দেশনা পাঠাতে চাপুন।"}
        </p>
      </div>

      {!composerFocused && <nav className="order-7 fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-[#ededed] bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-4px_18px_rgba(0,0,0,.04)] backdrop-blur lg:hidden" aria-label="Primary navigation">
        <button type="button" onClick={() => { setShowCurrentResult(false); document.getElementById("workdesk-text-prompt")?.focus(); }} className="flex min-h-12 flex-col items-center justify-center gap-1 text-[#0066ff]">
          <MessageSquare size={22} fill="currentColor" /> <span className="text-[10px] font-semibold">Chat</span>
        </button>
        <a href="/ai-hub" className="flex min-h-12 flex-col items-center justify-center gap-1 text-[#8e8e93]">
          <Lightbulb size={22} /> <span className="text-[10px]">Explore</span>
        </a>
        <button type="button" onClick={() => setShowFiles(true)} aria-controls="workdesk-tools" aria-expanded={showFiles} className="flex min-h-12 flex-col items-center justify-center gap-1 text-[#8e8e93]">
          <Grid2X2 size={22} /> <span className="text-[10px]">Tools</span>
        </button>
      </nav>}

      <section className="order-5 overflow-hidden rounded-3xl border border-[#e0e8e1] bg-white lg:order-1" aria-label="সাম্প্রতিক কাজের তালিকা">
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
                <button type="button" onClick={() => { setFollowLatestTask(false); setSelectedTaskId(task.id); setShowCurrentResult(true); }} className="w-full text-left">
                  <div className="flex items-center justify-between gap-3"><span className={"rounded-full border px-2.5 py-1 text-[10px] font-medium " + (statusTone[task.status] ?? statusTone.cancelled)}>{statusLabel[task.status] ?? "অবস্থা জানা যাচ্ছে না"}</span><span className="text-xs text-[#75847a]">{formatDate(task.createdAt)}</span></div>
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
