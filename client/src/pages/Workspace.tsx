import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, FileText, FileUp, Loader2, LockKeyhole, Plus, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import FileUploadPanel from "@/components/FileUploadPanel";
import { buildGovernmentServiceGuidance, findGovernmentServiceForPrompt, governmentServices } from "@/data/governmentServices";

type WorkspaceAssistantMessage = { role: "user" | "assistant"; content: string };

const ACCESS_STATUS_LABELS: Record<string, string> = {
  draft: "খসড়া",
  review: "পর্যালোচনা প্রয়োজন",
  ready: "প্রস্তুত",
  closed: "সম্পন্ন",
};

const CREATIVE_STATUS_LABELS: Record<string, string> = {
  queued: "অপেক্ষমাণ",
  processing: "তৈরি হচ্ছে",
  complete: "সম্পন্ন",
  failed: "সমস্যা হয়েছে",
};

function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "warm" | "green" }) {
  return <span className={`workspace-status workspace-status-${tone}`}>{children}</span>;
}

export default function Workspace() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activePanel, setActivePanel] = useState<"overview" | "access" | "creative" | "files" | "services">(() => { const requestedPanel = new URLSearchParams(window.location.search).get("panel"); const allowedPanels = ["overview", "access", "creative", "files", "services"] as const; if (requestedPanel && allowedPanels.includes(requestedPanel as typeof allowedPanels[number])) return requestedPanel as typeof allowedPanels[number]; return window.location.pathname === "/documents" ? "files" : "overview"; });
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceCategory, setServiceCategory] = useState("all");
  const [accessTitle, setAccessTitle] = useState("");
  const [creativePrompt, setCreativePrompt] = useState("");
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<WorkspaceAssistantMessage[]>([]);
  const accessCases = trpc.access.list.useQuery(undefined, { enabled: Boolean(user) && user?.loginMethod !== "supabase-anonymous", retry: false });
  const creativeRequests = trpc.creative.list.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const accessCreate = trpc.access.create.useMutation({ onSuccess: () => { setAccessTitle(""); void accessCases.refetch(); toast.success("কাজের খসড়া তৈরি হয়েছে।"); }, onError: () => toast.error("কাজটি সংরক্ষণ করা যায়নি। পরে আবার চেষ্টা করুন।") });
  const creativeCreate = trpc.creative.request.useMutation({ onSuccess: () => { setCreativePrompt(""); void creativeRequests.refetch(); toast.success("সৃজনশীল পরিকল্পনা সংরক্ষণ হয়েছে।"); }, onError: () => toast.error("কাজটি সংরক্ষণ করা যায়নি। পরে আবার চেষ্টা করুন।") });
  const assistantComplete = trpc.aiAssistant.complete.useMutation({
    onSuccess: (result, variables) => {
      const lastSubmittedMessage = variables.messages ? variables.messages[variables.messages.length - 1] : undefined;
      const submitted = lastSubmittedMessage?.content ?? variables.prompt ?? "";
      if (submitted) {
        setAssistantMessages(current => [
          ...current,
          { role: "user" as const, content: submitted },
          { role: "assistant" as const, content: result.text },
        ].slice(-24));
      }
      setAssistantPrompt("");
    },
    onError: () => { toast.error("এখন উত্তর তৈরি করা যায়নি। পরে আবার চেষ্টা করুন।"); },
  });

  if (loading) return <main className="workspace-page workspace-loading"><Loader2 className="animate-spin" /><span>আপনার কাজের জায়গা প্রস্তুত হচ্ছে…</span></main>;
  if (user?.loginMethod === "supabase-anonymous") return <main className="workspace-page workspace-auth"><div className="workspace-auth-card"><LockKeyhole size={25} /><span className="learn-label">অস্থায়ী ব্যবহার</span><h1>অস্থায়ী ব্যবহার<br /><em>শুধু ছবি তৈরির জন্য</em>।</h1><p>অস্থায়ী ব্যবহারে ছবি তৈরি, আগের কাজ দেখা ও ডাউনলোড করতে পারবেন। সংরক্ষিত কাজ ও অন্যান্য সুবিধা পেতে ইমেইল দিয়ে নিবন্ধন করুন।</p><Button onClick={() => { window.location.href = "/creative-studio"; }} className="btn-primary">ছবি তৈরি করুন <ArrowRight size={16} /></Button><Link href={"/auth/login?returnTo=" + encodeURIComponent(window.location.pathname + window.location.search)} className="workspace-back">{window.location.pathname === "/documents" ? "নথি যোগ করতে নিবন্ধন করুন বা প্রবেশ করুন" : "নিবন্ধন করুন বা প্রবেশ করুন"}</Link></div></main>;
  if (!user) return <main className="workspace-page workspace-auth"><div className="workspace-auth-card"><LockKeyhole size={25} /><span className="learn-label">আপনার ব্যক্তিগত জায়গা</span><h1>আপনার কাজের<br /><em>জায়গা</em> এখানে।</h1><p>আপনার খসড়া ও সৃজনশীল পরিকল্পনা দেখতে প্রবেশ করুন। গুরুত্বপূর্ণ কাজের আগে নিজে যাচাই করে নিন।</p><Button onClick={() => { const returnTo = window.location.pathname + window.location.search; window.location.href = "/auth/login?returnTo=" + encodeURIComponent(returnTo); }} className="btn-primary">প্রবেশ করুন / নিবন্ধন করুন <ArrowRight size={16} /></Button><Link href="/" className="workspace-back"><ArrowLeft size={15} /> মূল সাইটে ফিরুন</Link></div></main>;

  const cases = accessCases.data ?? [];
  const requests = creativeRequests.data ?? [];
  const total = cases.length + requests.length;
  const filteredGovernmentServices = governmentServices.filter(service => {
    const query = serviceSearch.trim().toLocaleLowerCase();
    const matchesQuery = !query || [service.title, service.agency, service.description, service.categoryLabel].some(value => value.toLocaleLowerCase().includes(query));
    return matchesQuery && (serviceCategory === "all" || service.category === serviceCategory);
  });

  return <main className="workspace-page"><header className="workspace-topbar"><Link href="/" className="workspace-brand"><span className="workspace-brand-mark">D</span><span>DSAI <small>কাজের জায়গা</small></span></Link><div className="workspace-user"><span>{user.name || user.email || "ব্যবহারকারী"}</span><button onClick={() => setLocation("/privacy#deletion-request")}>ডেটা অধিকার</button></div></header><div className="workspace-shell"><section className="workspace-welcome"><div><span className="eyebrow-pill"><span className="pulse-dot" />ব্যক্তিগত · আপনার নিয়ন্ত্রণে</span><h1>আপনার কাজের<br /><em>পরবর্তী ধাপ</em>।</h1><p>এক জায়গায় আপনার খসড়া, সৃজনশীল পরিকল্পনা ও কাজের অবস্থা দেখুন।</p></div><div className="workspace-safety"><LockKeyhole size={18} /><strong>আপনার অনুমতি ছাড়া কিছু পাঠানো হয় না।</strong><span>সহকারী খসড়া তৈরি করে; আপনি দেখে সিদ্ধান্ত নেবেন।</span></div></section><section className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#963a28]/20 bg-[#963a28]/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6" aria-labelledby="workspace-ai-hub-title"><div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#963a28] text-white"><Sparkles size={21} aria-hidden="true" /></span><div><span className="text-[10px] font-semibold uppercase অগ্রগতি-[.18em] text-[#963a28]">এআই সেবা খুঁজুন</span><h2 id="workspace-ai-hub-title" className="mt-1 text-lg font-semibold">সব এআই সেবা এক জায়গায়</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">আপনার প্রয়োজন অনুযায়ী এআই সেবা খুঁজে ব্যবহার শুরু করুন।</p></div></div><Button onClick={() => setLocation("/ai-hub")} className="shrink-0 bg-[#963a28] text-white hover:bg-[#7e3023]">এআই সেবা দেখুন <ArrowRight size={15} /></Button></section><nav className="workspace-tabs" aria-label="কাজের বিভাগ"><button className={activePanel === "overview" ? "active" : ""} onClick={() => setActivePanel("overview")}>সারাংশ</button><button className={activePanel === "access" ? "active" : ""} onClick={() => setActivePanel("access")}>আবেদন ও নথির কাজ <b>{cases.length}</b></button><button className={activePanel === "creative" ? "active" : ""} onClick={() => setActivePanel("creative")}>সৃজনশীল পরিকল্পনা <b>{requests.length}</b></button><button className={activePanel === "services" ? "active" : ""} onClick={() => setActivePanel("services")}>সরকারি সেবা</button><button className={activePanel === "files" ? "active" : ""} onClick={() => setActivePanel("files")}>নথি</button><button onClick={() => setLocation("/lead-composer")}>লিড তৈরি</button><button onClick={() => setLocation("/ai-hub")}>এআই সেবা</button></nav>
    {activePanel === "overview" && <><section className="workspace-stats"><article><span>মোট কাজ</span><strong>{total}</strong><small>আপনার কাজ</small></article><article><span>আবেদন ও নথির খসড়া</span><strong>{cases.length}</strong><small>বুঝুন ও প্রস্তুত হন</small></article><article><span>সৃজনশীল পরিকল্পনা</span><strong>{requests.length}</strong><small>আপনার সৃষ্টির ধারণা</small></article></section><section className="workspace-actions"><article><FileText size={20} /><div><h2>নতুন আবেদন বা নথির কাজ</h2><p>নোটিশ, ফর্ম বা নথির কাজের জন্য একটি খসড়া তৈরি করুন।</p></div><Button onClick={() => setActivePanel("access")} className="workspace-action-button">শুরু করুন <ArrowRight size={15} /></Button></article><article><Sparkles size={20} /><div><h2>নতুন সৃজনশীল পরিকল্পনা</h2><p>বাংলা বা ইংরেজিতে আপনার সৃষ্টির ধারণা লিখে গুছিয়ে নিন।</p></div><Button onClick={() => setActivePanel("creative")} className="workspace-action-button">ধারণা লিখুন <ArrowRight size={15} /></Button></article><article><Sparkles size={20} /><div><h2>লিড তৈরি ও গ্রাহক ব্যবস্থাপনা</h2><p>আপনার ব্যবসা বা সেবার জন্য বাংলায় নির্দেশনা দিন, গ্রাহকের উপযোগী খসড়া তৈরি করুন এবং CRM-এ সংরক্ষণ করুন। কাউকে বার্তা পাঠানোর আগে নিজে যাচাই ও সম্মতি নিশ্চিত করুন।</p></div><Button onClick={() => setLocation("/lead-composer")} className="workspace-action-button">লিড তৈরি করুন <ArrowRight size={15} /></Button></article><article><ExternalLink size={20} /><div><h2>সরকারি সেবা ও টেন্ডার</h2><p>যাচাইকৃত সরকারি পোর্টাল খুঁজুন, তালিকা দেখুন এবং কাজটি কাজের তালিকা-এ সংরক্ষণ করুন।</p></div><Button onClick={() => setActivePanel("services")} className="workspace-action-button">সেবা খুঁজুন <ArrowRight size={15} /></Button></article><article><FileUp size={20} /><div><h2>নথি আপলোড ও সংরক্ষণ</h2><p>পিডিএফ, ওয়ার্ড, এক্সেল, জিপ ও ছবি যোগ করুন। যাচাই শেষ না হওয়া পর্যন্ত কিছু নথি ব্যবহার করা যাবে না।</p></div><Button onClick={() => setActivePanel("files")} className="workspace-action-button">নথি যোগ করুন <ArrowRight size={15} /></Button></article></section><section className="workspace-panel mt-6"><div className="workspace-panel-heading"><div><span className="learn-label">এআই সহকারী</span><h2>আপনার কাজে এআই সহায়তা</h2><p>বাংলায় একাধিক বার্তা পাঠিয়ে কথোপকথন চালিয়ে যান। এআই আগের প্রসঙ্গ ধরে উত্তর দেবে—গুরুত্বপূর্ণ তথ্য নিজে যাচাই করুন।</p></div><Sparkles size={22} /></div>{assistantMessages.length > 0 && <div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">এই পাতার কথোপকথন শুধু এখানে থাকবে; পাতা বন্ধ বা নতুন করে খুললে মুছে যাবে।</p><Button type="button" variant="outline" size="sm" onClick={() => setAssistantMessages([])}>নতুন কথোপকথন</Button></div>}<div className="mb-4 space-y-3" aria-label="এআই কথোপকথন" aria-live="polite">{assistantMessages.length === 0 ? <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">বাংলায় প্রশ্ন লিখে শুরু করুন। পরের বার্তায় আগের কথোপকথনও বিবেচনা করা হবে; পাতা বন্ধ বা নতুন করে খুললে নতুন কথোপকথন শুরু হবে।</p> : assistantMessages.map((message, index) => <article key={index} className="workspace-record"><div className={`workspace-record-icon ${message.role === "assistant" ? "creative" : "access"}`}>{message.role === "assistant" ? <Sparkles size={16} /> : <span className="text-xs font-bold">আপনি</span>}</div><div className="min-w-0"><p className="mb-1 text-xs font-semibold">{message.role === "assistant" ? "DSএআই সহকারী" : "আপনি"}</p><div className="whitespace-pre-wrap text-sm leading-7">{message.content}</div></div></article>)}</div><form className="workspace-create-form" onSubmit={event => { event.preventDefault(); const prompt = assistantPrompt.trim(); const matchedService = findGovernmentServiceForPrompt(prompt);
    if (matchedService) {
      setAssistantMessages(current => [...current, { role: "user", content: prompt }, { role: "assistant", content: buildGovernmentServiceGuidance(matchedService) }].slice(-24));
      setAssistantPrompt("");
      return;
    }
    const recent = assistantMessages.slice(-10).map(message => message.role === "user" ? { role: "user" as const, content: message.content } : { role: "assistant" as const, content: message.content }); while (recent.length > 0 && recent.reduce((total, message) => total + message.content.length, prompt.length) > 16000) recent.splice(0, 2); assistantComplete.mutate({ messages: [...recent, { role: "user", content: prompt }] }); }}><label htmlFor="workspace-ai-prompt">আপনার বার্তা</label><div><textarea id="workspace-ai-prompt" required minLength={3} maxLength={4000} rows={4} value={assistantPrompt} onChange={event => setAssistantPrompt(event.target.value)} placeholder="বাংলায় আপনার প্রশ্ন বা পরবর্তী নির্দেশনা লিখুন…" /><Button type="submit" disabled={assistantComplete.isPending || assistantPrompt.trim().length < 3}><Sparkles size={15} /> {assistantComplete.isPending ? "উত্তর তৈরি হচ্ছে…" : "বার্তা পাঠান"}</Button></div></form></section></>}
    {activePanel === "services" && <section className="workspace-panel">
      <div className="workspace-panel-heading"><div><span className="learn-label">সরকারি সেবা</span><h2>সরকারি সেবা ও দরপত্র</h2><p>সরকারি পোর্টাল খুঁজুন, প্রয়োজনীয় নথির তালিকা দেখুন এবং নিজের কাজের তালিকায় সংরক্ষণ করুন।</p></div><ExternalLink size={22} /></div>
      <div className="mb-5 rounded-xl border border-amber-300/50 bg-amber-50/70 p-4 text-sm leading-6 text-amber-950">
        <strong>গুরুত্বপূর্ণ:</strong> DSAI সরকারি পোর্টালের বিকল্প নয়। এখানে প্রস্তুতি, তালিকা ও অগ্রগতি করবেন; আবেদন, একবারের যাচাইকরণ কোড, অর্থ জমা, দরপত্র জমা এবং চূড়ান্ত অনুমোদন সংশ্লিষ্ট সরকারি পোর্টালেই সম্পন্ন হবে। কোনো পোর্টালে যাওয়ার আগে ওয়েব ঠিকানা মিলিয়ে নিন।
      </div>
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input aria-label="সরকারি সেবা খুঁজুন" value={serviceSearch} onChange={event => setServiceSearch(event.target.value)} placeholder="সেবা, দপ্তর বা টেন্ডার লিখে খুঁজুন…" className="h-11 w-full rounded-lg border bg-background pl-10 pr-3 text-sm" /></label>
        <select aria-label="সেবার বিভাগ" value={serviceCategory} onChange={event => setServiceCategory(event.target.value)} className="h-11 rounded-lg border bg-background px-3 text-sm">
          <option value="all">সব বিভাগ</option><option value="jobs">চাকরি</option><option value="tender">টেন্ডার</option><option value="business">ব্যবসা</option><option value="land">ভূমি</option><option value="transport">পরিবহন</option><option value="pension">পেনশন</option><option value="education">শিক্ষা</option><option value="office">দাপ্তরিক</option><option value="tax">কর</option><option value="legal">আদালত</option><option value="healthcare">স্বাস্থ্য</option>
        </select>
      </div>
      <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">{filteredGovernmentServices.length}টি সরকারি পোর্টাল · সর্বশেষ উৎস যাচাই: ১৫ নভেম্বর ২০২৬</p>
      <div className="grid gap-4 md:grid-cols-2">
        {filteredGovernmentServices.map(service => <article key={service.id} className="flex flex-col rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-start justify-between gap-3"><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{service.categoryLabel}</span><span className="text-right text-xs text-muted-foreground">{service.agency}</span></div>
          <h3 className="text-base font-semibold">{service.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{service.description}</p>
          <div className="mt-4"><h4 className="text-sm font-semibold">শুরু করার তালিকা</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">{service.preparation.map(item => <li key={item}>{item}</li>)}</ul></div>
          <p className="mt-3 rounded-lg bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">{service.boundary}</p>
          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={() => accessCreate.mutate({ title: service.title, workflow: service.workflow, language: "bn", riskLevel: "medium", notes: ["সরকারি পোর্টাল: " + service.officialUrl, "দপ্তর: " + service.agency, "প্রয়োজনীয় প্রস্তুতি:", ...service.preparation.map((item, index) => (index + 1) + ". " + item), "গুরুত্বপূর্ণ সীমা: " + service.boundary].join("\n") })} disabled={accessCreate.isPending}>আমার কাজের তালিকায় যোগ করুন</Button>
            <a href={service.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium underline underline-offset-4 hover:bg-muted">সরকারি পোর্টাল <ExternalLink size={14} /></a>
          </div>
        </article>)}
      </div>
      {filteredGovernmentServices.length === 0 && <div className="workspace-empty"><FileText size={22} /><h3>কোনো সেবা পাওয়া যায়নি</h3><p>অন্য শব্দ দিয়ে খুঁজুন অথবা বিভাগ পরিবর্তন করুন।</p></div>}
    </section>}
    {activePanel === "files" && <FileUploadPanel />}
    {activePanel === "access" && <section className="workspace-panel"><div className="workspace-panel-heading"><div><span className="learn-label">আবেদন ও নথির কাজ</span><h2>আপনার আবেদন ও নথির কাজ</h2><p>প্রতিটি কাজের খসড়া দেখে আপনি পরবর্তী পদক্ষেপ ঠিক করবেন।</p></div><StatusPill tone="green"><CheckCircle2 size={13} /> পর্যালোচনা করুন</StatusPill></div><form className="workspace-create-form" onSubmit={event => { event.preventDefault(); accessCreate.mutate({ title: accessTitle, workflow: "document", language: "bn", riskLevel: "medium" }); }}><label htmlFor="workspace-access-title">কাজের নাম</label><div><input id="workspace-access-title" required maxLength={180} value={accessTitle} onChange={event => setAccessTitle(event.target.value)} placeholder="যেমন: সরকারি ফর্ম বুঝতে চাই" /><Button type="submit" disabled={accessCreate.isPending}><Plus size={15} /> {accessCreate.isPending ? "সংরক্ষণ হচ্ছে…" : "খসড়া তৈরি"}</Button></div></form><div className="workspace-records">{accessCases.isLoading ? <div className="workspace-empty"><Loader2 className="animate-spin" /></div> : accessCases.isError ? <div className="workspace-empty"><h3>তালিকা দেখানো যাচ্ছে না</h3><p>আবার চেষ্টা করুন।</p><Button variant="outline" onClick={() => void accessCases.refetch()}>আবার চেষ্টা করুন</Button></div> : cases.length ? cases.map(item => <article className="workspace-record" key={item.id}><div className="workspace-record-icon"><FileText size={16} /></div><div><h3>{item.title}</h3><p>{new Date(item.createdAt).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" })}</p></div><StatusPill tone={item.status === "ready" ? "green" : "warm"}>{ACCESS_STATUS_LABELS[item.status] ?? "চলমান"}</StatusPill></article>) : <div className="workspace-empty"><FileText size={22} /><h3>এখনো কোনো আবেদন বা নথির কাজ নেই।</h3><p>প্রথম কাজ তৈরি করলে এটি এখানে দেখা যাবে।</p></div>}</div></section>}
    {activePanel === "creative" && <section className="workspace-panel"><div className="workspace-panel-heading"><div><span className="learn-label">সৃজনশীল ধারণা</span><h2>আপনার সৃজনশীল পরিকল্পনা</h2><p>আপনার পরিকল্পনা ও ধারণাগুলো এখানে গুছিয়ে রাখুন। ছবি তৈরি করতে ছবি তৈরির পাতায় যান।</p></div><StatusPill tone="warm"><Sparkles size={13} /> পরিকল্পনা</StatusPill></div><form className="workspace-create-form" onSubmit={event => { event.preventDefault(); creativeCreate.mutate({ prompt: creativePrompt, tier: "free" }); }}><label htmlFor="workspace-creative-prompt">সৃজনশীল পরিকল্পনা</label><div><textarea id="workspace-creative-prompt" required maxLength={4000} rows={3} value={creativePrompt} onChange={event => setCreativePrompt(event.target.value)} placeholder="বাংলায় আপনার ছবির ধারণা লিখুন" /><Button type="submit" disabled={creativeCreate.isPending}><Plus size={15} /> {creativeCreate.isPending ? "সংরক্ষণ হচ্ছে…" : "পরিকল্পনা সংরক্ষণ"}</Button></div></form><div className="workspace-records">{creativeRequests.isLoading ? <div className="workspace-empty"><Loader2 className="animate-spin" /></div> : creativeRequests.isError ? <div className="workspace-empty"><h3>পরিকল্পনা দেখানো যাচ্ছে না</h3><p>আবার চেষ্টা করুন।</p><Button variant="outline" onClick={() => void creativeRequests.refetch()}>আবার চেষ্টা করুন</Button></div> : requests.length ? requests.map(item => <article className="workspace-record" key={item.id}><div className="workspace-record-icon creative"><Sparkles size={16} /></div><div><h3>{item.prompt}</h3><p>{new Date(item.createdAt).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" })}</p></div><StatusPill tone="warm">{CREATIVE_STATUS_LABELS[item.status] ?? "চলমান"}</StatusPill></article>) : <div className="workspace-empty"><Sparkles size={22} /><h3>এখনো কোনো সৃজনশীল পরিকল্পনা নেই।</h3><p>একটি পরিকল্পনা সংরক্ষণ করলে এখানে দেখা যাবে।</p></div>}</div></section>}
  </div></main>;
}
