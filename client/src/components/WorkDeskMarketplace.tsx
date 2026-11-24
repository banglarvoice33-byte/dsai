import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight, BookOpen, Bot, Building2, ExternalLink, FileText,
  Link2, Search, Sparkles, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { governmentServices, type GovernmentService, type GovernmentServiceCategory } from "@/data/governmentServices";

type MarketplaceTab = "government" | "skills" | "connectors";
type Skill = { id: string; title: string; category: string; description: string; prompt: string };
type UserConnectorId = "openrouter" | "gemini" | "openai" | "xai";

const skills: Skill[] = [
  { id: "bn-research", title: "বাংলা গবেষণা সহকারী", category: "গবেষণা", description: "একাধিক উৎস, দাবি, প্রমাণ ও অনিশ্চয়তা আলাদা করে গবেষণা সাজান", prompt: "আপনি একজন সতর্ক বাংলা গবেষণা সহকারী। আমার দেওয়া বিষয়টি বিশ্লেষণ করুন। তথ্য, অনুমান ও মতামত আলাদা রাখুন; যাচাইযোগ্য দাবির জন্য প্রাথমিক/সরকারি উৎসকে অগ্রাধিকার দিন; উৎস না থাকলে বানিয়ে দেবেন না। শেষে সংক্ষিপ্ত সারাংশ, মূল প্রমাণ, অনিশ্চয়তা এবং পরবর্তী যাচাইয়ের তালিকা দিন।\n\nবিষয়: " },
  { id: "document-summary", title: "নথি সারাংশ ও মূল পয়েন্ট", category: "নথি", description: "দীর্ঘ নথি থেকে সিদ্ধান্ত, সময়সীমা, দায়িত্ব ও ঝুঁকি বের করুন", prompt: "নিচের নথিটি বাংলায় বিশ্লেষণ করুন। ১) ৫-৭ লাইনের সারাংশ, ২) গুরুত্বপূর্ণ তথ্য ও তারিখ, ৩) করণীয় ও দায়িত্বপ্রাপ্ত ব্যক্তি/প্রতিষ্ঠান, ৪) প্রয়োজনীয় কাগজপত্র, ৫) ঝুঁকি/অস্পষ্টতা, ৬) যে তথ্যগুলো মূল নথি থেকে পুনরায় যাচাই করা দরকার—এই কাঠামোয় ফলাফল দিন। কোনো অনুপস্থিত তথ্য অনুমান করবেন না।\n\nনথির লেখা:\n" },
  { id: "ocr-cleanup", title: "OCR ভুল সংশোধন", category: "নথি", description: "স্ক্যান থেকে পাওয়া বাংলা লেখার বানান ও বিন্যাস ঠিক করুন", prompt: "নিচের OCR-এ পাওয়া বাংলা লেখাটি সম্পাদনা করুন। মূল অর্থ, নাম, নম্বর, তারিখ, টাকা, ঠিকানা ও আইনি শব্দ অপরিবর্তিত রাখুন। নিশ্চিত নয় এমন অক্ষর/শব্দ [যাচাই প্রয়োজন] দিয়ে চিহ্নিত করুন; কোনো নাম, নম্বর বা তথ্য বানিয়ে পূরণ করবেন না। শেষে সংশোধিত পাঠ এবং সন্দেহযুক্ত অংশের তালিকা দিন।\n\nOCR লেখা:\n" },
  { id: "formal-letter", title: "সরকারি/পেশাদার চিঠি", category: "লেখা", description: "বাংলা দাপ্তরিক আবেদন, জবাব ও পেশাদার চিঠির খসড়া", prompt: "নিচের তথ্যের ভিত্তিতে শুদ্ধ, সংক্ষিপ্ত ও সম্মানজনক বাংলায় একটি পেশাদার/দাপ্তরিক চিঠির খসড়া তৈরি করুন। প্রাপক, বিষয়, প্রাসঙ্গিক তথ্য, অনুরোধ, সংযুক্তি ও যোগাযোগের জায়গা রাখুন। অনুপস্থিত তথ্য [পূরণ করুন] হিসেবে দেখান। চিঠি জমা বা পাঠানোর আগে মানবীয় যাচাই প্রয়োজন—এটি স্পষ্ট রাখুন।\n\nপ্রেক্ষাপট:\n" },
  { id: "government-checklist", title: "সরকারি আবেদন প্রস্তুতি", category: "সরকারি সেবা", description: "যোগ্যতা, কাগজপত্র, ফি ও শেষ তারিখ যাচাইয়ের তালিকা বানান", prompt: "সরকারি সেবার জন্য একটি প্রস্তুতি checklist তৈরি করুন। সরকারি পোর্টালে দেওয়া বর্তমান নির্দেশনাই চূড়ান্ত; অজানা ফি, যোগ্যতা বা সময়সীমা অনুমান করবেন না। তথ্যগুলোকে (ক) আবেদনকারীর কাছ থেকে প্রয়োজন, (খ) সরকারি উৎসে যাচাই, (গ) আবেদন-পূর্ব চূড়ান্ত পর্যালোচনা—এই তিন ভাগে সাজান। OTP, password, NID-এর পূর্ণ নম্বর বা payment credential এখানে চাইবেন না।\n\nসেবা ও প্রেক্ষাপট:\n" },
  { id: "egp-tender", title: "e-GP টেন্ডার বিশ্লেষণ", category: "সরকারি সেবা", description: "দরপত্রের যোগ্যতা, জমার শর্ত ও শেষ তারিখ আলাদা করুন", prompt: "নিচের e-GP tender notice/document বিশ্লেষণ করুন। Tender ID, Procuring Entity, deadline, eligibility, turnover/experience, TIN/VAT, licence, tender security, document checklist এবং submission method আলাদা করে দিন। অস্পষ্ট/অনুপস্থিত শর্ত [সরকারি নথিতে যাচাই প্রয়োজন] হিসেবে দেখান। DSAI কোনো bid জমা, tender security payment বা সরকারি অনুমোদন করে না।\n\nTender notice:\n" },
  { id: "tax-docs", title: "NBR কর নথি প্রস্তুতি", category: "সরকারি সেবা", description: "e-TIN/e-Return-এর নথি ও তথ্যের প্রস্তুতি গুছিয়ে নিন", prompt: "NBR e-TIN/e-Return প্রস্তুতির জন্য একটি তথ্য ও নথি checklist তৈরি করুন। কর-সংক্রান্ত সিদ্ধান্ত বা কর গণনা চূড়ান্ত বলে দাবি করবেন না। করবর্ষ, আয়, বিনিয়োগ, সম্পদ, উৎসে কর, TIN ও প্রয়োজনীয় প্রমাণ আলাদা করুন; অনুপস্থিত তথ্য চিহ্নিত করুন; সর্বশেষ NBR নির্দেশনা ও প্রয়োজনে কর-পেশাজীবীর যাচাইয়ের কথা বলুন।\n\nপ্রেক্ষাপট:\n" },
  { id: "translation", title: "বাংলা ↔ English অনুবাদ", category: "ভাষা", description: "অর্থ, নাম, সংখ্যা ও আনুষ্ঠানিক ভঙ্গি অক্ষুণ্ণ রাখুন", prompt: "নিচের লেখাটি [বাংলা থেকে ইংরেজি / ইংরেজি থেকে বাংলা] অনুবাদ করুন। মূল অর্থ, নাম, তারিখ, পরিমাণ, আইনি/প্রযুক্তিগত শব্দ ও অনুচ্ছেদের কাঠামো অক্ষুণ্ণ রাখুন। অনুবাদে অস্পষ্ট অংশ থাকলে আলাদা করে উল্লেখ করুন; নিজের পক্ষ থেকে তথ্য যোগ করবেন না।\n\nলেখা:\n" },
  { id: "code-review", title: "উৎপাদন-উপযোগী কোড পর্যালোচনা", category: "ডেভেলপমেন্ট", description: "নিরাপত্তা, ব্যতিক্রমী পরিস্থিতি, গতি ও পরীক্ষার মান পর্যালোচনা", prompt: "Act as a senior production engineer. Review the code I provide for correctness, security, privacy, authorization, data integrity, concurrency, performance, accessibility, observability and failure handling. Prioritize concrete bugs over style. For every finding include severity, exact evidence, impact, minimal safe fix and regression test. Do not claim a fix is implemented unless source code is changed and tests pass.\n\nCode/context:\n" },
  { id: "api-integration", title: "API সংযোগের নকশা", category: "ডেভেলপমেন্ট", description: "অনুমোদন, ব্যবহারের সীমা, পুনঃচেষ্টা, নিরাপদ বিকল্প ও খরচ নিয়ন্ত্রণ সাজান", prompt: "Design a production-grade API integration for the provider described below. Specify authentication, secret storage, input/output schemas, timeout, bounded retries, idempotency, rate limits, audit trail, data minimization, consent, provider outage handling, free-tier cost guard, kill switch and tests. Never put secrets in frontend code or logs. Clearly separate implemented capabilities from proposed work.\n\nProvider/use case:\n" },
];

const governmentCategories: Array<{ id: "all" | GovernmentServiceCategory; label: string }> = [
  { id: "all", label: "সব বিভাগ" }, { id: "jobs", label: "চাকরি" }, { id: "tender", label: "টেন্ডার" },
  { id: "business", label: "ব্যবসা" }, { id: "land", label: "ভূমি" }, { id: "transport", label: "পরিবহন" },
  { id: "pension", label: "পেনশন" }, { id: "education", label: "শিক্ষা" }, { id: "office", label: "দাপ্তরিক" },
  { id: "tax", label: "কর" }, { id: "legal", label: "আদালত" }, { id: "healthcare", label: "স্বাস্থ্য" },
];

export default function WorkDeskMarketplace({
  onUseSkill,
  onUseGovernmentService,
  onSaveGovernmentService,
  isAdmin,
}: {
  onUseSkill: (prompt: string) => void;
  onUseGovernmentService: (service: GovernmentService) => void;
  onSaveGovernmentService: (service: GovernmentService) => void;
  isAdmin: boolean;
}) {
  const [tab, setTab] = useState<MarketplaceTab>("government");
  // AI Hub links directly to connector setup without auto-submitting or changing account state.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("panel") === "marketplace") setTab("connectors");
  }, []);
  const [query, setQuery] = useState("");
  const [governmentCategory, setGovernmentCategory] = useState<"all" | GovernmentServiceCategory>("all");
  const [connectingProvider, setConnectingProvider] = useState<UserConnectorId | null>(null);
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const userConnectors = trpc.userConnectors.list.useQuery(undefined, { retry: false, staleTime: 20_000 });
  const connectConnector = trpc.userConnectors.connect.useMutation({
    onSuccess: async () => { setApiKeyDraft(""); setConnectingProvider(null); await userConnectors.refetch(); toast.success("সংযোগ নিরাপদে যুক্ত হয়েছে।"); },
    onError: error => toast.error(error.message || "সংযোগ যুক্ত করা যায়নি।"),
  });
  const testConnector = trpc.userConnectors.test.useMutation({
    onSuccess: async result => { await userConnectors.refetch(); result.connected ? toast.success(result.message) : toast.error(result.message); },
    onError: error => toast.error(error.message || "সংযোগ পরীক্ষা করা যায়নি।"),
  });
  const disconnectConnector = trpc.userConnectors.disconnect.useMutation({
    onSuccess: async () => { await userConnectors.refetch(); toast.success("সংযোগ বিচ্ছিন্ন করা হয়েছে।"); },
    onError: error => toast.error(error.message || "সংযোগ বিচ্ছিন্ন করা যায়নি।"),
  });

  const filteredGovernment = useMemo(() => governmentServices.filter(service => {
    const q = query.trim().toLocaleLowerCase();
    const matchesCategory = governmentCategory === "all" || service.category === governmentCategory;
    const haystack = [service.title, service.agency, service.description, service.categoryLabel, service.officialUrl, ...(service.aliases ?? [])].join(" ").toLocaleLowerCase();
    return matchesCategory && (!q || haystack.includes(q));
  }), [governmentCategory, query]);

  const connectorRows = [
    { id: "openrouter", name: "OpenRouter", detail: "একটি key দিয়ে OpenRouter-এর বিনামূল্যের মডেল ব্যবহার", note: "কোন মডেল পাওয়া যাবে ও ব্যবহারের সীমা—তা সেবাদাতা নির্ধারণ করে।", icon: Bot },
    { id: "gemini", name: "Google Gemini API", detail: "Google AI Studio-এর নিজস্ব API সংযোগ", note: "আপনার Google project-এর ব্যবহারসীমা ও মূল্য প্রযোজ্য; ব্যবহারের আগে সম্ভাব্য খরচ যাচাই করুন।", icon: Sparkles },
    { id: "openai", name: "OpenAI API", detail: "নিজস্ব OpenAI API সংযোগ", note: "আপনার OpenAI account অনুযায়ী ব্যবহারের জন্য মূল্য লাগতে পারে।", icon: Bot },
    { id: "xai", name: "xAI API", detail: "নিজস্ব xAI API সংযোগ", note: "আপনার xAI account অনুযায়ী ব্যবহারের জন্য মূল্য লাগতে পারে।", icon: Zap },
  ] as const;

  const tabs: Array<{ id: MarketplaceTab; label: string; count: number; icon: typeof Bot }> = [
    { id: "government", label: "সরকারি সেবা", count: governmentServices.length, icon: Building2 },
    { id: "skills", label: "কাজের নির্দেশনা", count: skills.length, icon: BookOpen },
    { id: "connectors", label: "নিজস্ব AI সংযোগ", count: connectorRows.length, icon: Link2 },
  ];

  return (
    <section className="space-y-6" aria-labelledby="workdesk-marketplace-title">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[#e5e9e2] pb-4">
        <div>
          <h2 id="workdesk-marketplace-title" className="text-2xl font-semibold tracking-tight text-[#20372c] sm:text-3xl">সেবা ও কাজের টুল</h2>
          
        </div>
      </header>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="কাজের ধরন">
        {tabs.map(item => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => { setTab(item.id); setQuery(""); }} className={"inline-flex min-h-12 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition " + (tab === item.id ? "border-[#176b4b] bg-[#176b4b] text-white" : "border-[#d9ded5] bg-white text-[#53645a] hover:border-[#176b4b]/40")}><item.icon size={14} />{item.label}<span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px]">{item.count}</span></button>)}
      </div>

      {tab === "government" && <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <label className="relative"><span className="sr-only">সরকারি সেবা খুঁজুন</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#879187]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="সরকারি সেবা, দপ্তর বা পোর্টাল খুঁজুন…" className="h-12 w-full rounded-xl border border-[#d9ded5] bg-white pl-10 pr-3 text-base outline-none focus:border-[#176b4b] focus:ring-4 focus:ring-[#176b4b]/10" /></label>
        <select aria-label="সরকারি সেবার বিভাগ" value={governmentCategory} onChange={event => setGovernmentCategory(event.target.value as "all" | GovernmentServiceCategory)} className="h-12 rounded-xl border border-[#d9ded5] bg-white px-4 text-sm">{governmentCategories.map(category => <option key={category.id} value={category.id}>{category.label}</option>)}</select>
      </div>}

      {tab === "government" && <>
        <details className="rounded-xl border border-[#e4e9e2] bg-[#f8faf7] px-4 py-3"><summary className="cursor-pointer text-sm font-semibold text-[#52675b]">সরকারি সেবা ব্যবহারের আগে জানুন</summary><p className="mt-2 text-sm leading-6 text-[#5f7065]">OTP, পেমেন্ট ও আবেদন জমা সংশ্লিষ্ট সরকারি ওয়েবসাইটেই হয়।</p></details>
        <p className="text-sm text-[#65766b]" aria-live="polite">{filteredGovernment.length.toLocaleString("bn-BD")}টি সেবা পাওয়া গেছে</p>
        <div className="grid gap-3 md:grid-cols-2">
          {filteredGovernment.map(service => <article key={service.id} className="flex min-w-0 flex-col rounded-2xl border border-[#e1e5dc] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-2"><span className="rounded-full bg-[#f3eee4] px-3 py-1.5 text-xs font-semibold text-[#735d38]">{service.categoryLabel}</span><span className="text-right text-xs text-[#68796e]">{service.agency}</span></div>
            <h3 className="mt-3 text-lg font-semibold leading-7 text-[#26382e] sm:text-xl">{service.title}</h3><p className="mt-2 line-clamp-3 text-base leading-7 text-[#52665a]">{service.description}</p>
            <details className="mt-3 rounded-xl border border-[#e6e9e2] bg-[#faf9f5] p-3"><summary className="cursor-pointer text-sm font-semibold text-[#405246]">প্রয়োজনীয় কাগজপত্র ও বিস্তারিত</summary><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#52665a]">{service.preparation.map(item => <li key={item}>{item}</li>)}</ul><p className="mt-3 border-t border-[#e6e9e2] pt-3 text-sm leading-6 text-[#705b49]">{service.boundary}</p></details>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-5"><Button type="button" size="sm" onClick={() => onUseGovernmentService(service)} className="min-h-11 bg-[#176b4b] px-4 text-sm text-white hover:bg-[#10563b]"><Sparkles size={15} className="mr-1" /> ব্যবহার করুন</Button><Button type="button" variant="outline" size="sm" onClick={() => onSaveGovernmentService(service)}><FileText size={14} className="mr-1" /> সংরক্ষণ</Button><a href={service.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#176b4b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#10563b]">পোর্টাল খুলুন <ArrowUpRight size={14} /></a></div>
          </article>)}
        </div>
      </>}

      {tab === "skills" && <>
        
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {skills.map(skill => <article key={skill.id} className="flex flex-col rounded-2xl border border-[#e1e5dc] bg-white p-5"><span className="w-fit rounded-full bg-[#f3eee4] px-3 py-1.5 text-xs font-semibold text-[#735d38]">{skill.category}</span><h3 className="mt-3 text-lg font-semibold text-[#26382e]">{skill.title}</h3><p className="mt-2 flex-1 text-base leading-7 text-[#52665a]">{skill.description}</p><div className="mt-4 flex flex-wrap gap-2"><Button type="button" onClick={() => onUseSkill(skill.prompt)} className="bg-[#176b4b] text-white hover:bg-[#10563b]"><Sparkles size={15} className="mr-2" /> ব্যবহার করুন</Button></div></article>)}
        </div>
      </>}

      {tab === "connectors" && <>
        <div className="rounded-2xl border border-[#d9c89e] bg-[#fbf7eb] p-4 text-xs leading-6 text-[#5c4a2b]">
          <strong>আপনার API key, আপনার নিয়ন্ত্রণে।</strong> key এনক্রিপ্ট করে সার্ভারে রাখা হয়; সংযোগ যাচাইয়ের সময় শুধু সেবাদাতার account তথ্য পরীক্ষা করা হয়। কোনো AI অনুরোধ বা অর্থ খরচের generation চালানো হয় না।
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {connectorRows.map(row => {
            const saved = userConnectors.data?.find(item => item.id === row.id);
            const connected = Boolean(saved?.connected);
            const canConnect = row.id === "openrouter" || row.id === "gemini";
            const freeLabel = row.id === "openrouter" ? "বিনামূল্যের সংযোগ · Work Desk-এ ব্যবহারযোগ্য" : row.id === "gemini" ? "নিজস্ব API key · সেবাদাতার মূল্য প্রযোজ্য হতে পারে" : "পেইড API · বর্তমান বিনামূল্যের নীতিতে সংযোগ বন্ধ";
            return <article key={row.id} className="flex min-w-0 flex-col rounded-2xl border border-[#e1e5dc] bg-white p-5 shadow-[0_10px_30px_rgba(27,42,34,.04)]">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f3eee4] text-[#176b4b]"><row.icon size={20} /></span>
                <div className="min-w-0 flex-1"><h3 className="font-semibold text-[#26382e]">{row.name}</h3><p className="mt-1 text-sm leading-6 text-[#607166]">{row.detail}</p></div>
              </div>
              <span className="mt-3 w-fit rounded-full border border-[#e4e0d5] bg-[#faf9f5] px-3 py-1.5 text-xs font-semibold text-[#6b624f]">{freeLabel}</span>
              <p className="mt-3 text-sm leading-6 text-[#5f7065]">{row.note}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#e6e9e2] pt-3">
                <div className="min-w-0">
                  <span className={"inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold " + (connected ? "border-emerald-200 bg-emerald-50 text-emerald-800" : saved?.status === "degraded" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-50 text-slate-600")}>{connected ? "যুক্ত ও যাচাইকৃত" : saved?.status === "degraded" ? "মনোযোগ প্রয়োজন" : "যুক্ত নয়"}</span>
                  {saved?.keyHint && <p className="mt-1 text-[10px] text-[#7a867c]">সংরক্ষিত key: {saved.keyHint}</p>}
                  {saved?.lastTestedAt && <p className="mt-1 text-[10px] text-[#929b91]">শেষ পরীক্ষা: {new Date(saved.lastTestedAt).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}</p>}
                </div>
                {row.id === "gemini" && <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-[#176b4b] hover:bg-[#fff8f1]">Google AI Studio থেকে key নিন <ExternalLink size={12} /></a>}
                {row.id === "openrouter" && <a href="https://openrouter.ai/keys"
                  target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-[#176b4b] hover:bg-[#fff8f1]">বিনামূল্যের API key নিন <ExternalLink size={12} /></a>}
              </div>
              {canConnect && connectingProvider === row.id ? <form className="mt-4 space-y-3 rounded-xl border border-[#e6e9e2] bg-[#fbfaf6] p-3" onSubmit={event => { event.preventDefault(); connectConnector.mutate({ provider: row.id, apiKey: apiKeyDraft.trim() }); }}>
                <label className="block text-xs font-semibold text-[#405246]" htmlFor={"connector-key-" + row.id}>সেবাদাতার API key</label>
                <input id={"connector-key-" + row.id} type="password" autoComplete="off" spellCheck={false} required minLength={12} maxLength={4096} value={apiKeyDraft} onChange={event => setApiKeyDraft(event.target.value)} placeholder="এখানে API key দিন" className="h-11 w-full rounded-xl border border-[#d9ded5] bg-white px-3 text-sm outline-none focus:border-[#176b4b] focus:ring-4 focus:ring-[#176b4b]/10" />
                <p className="text-[10px] leading-5 text-[#7a867c]">API key শুধু এই নিরাপদ অনুরোধে পাঠানো হবে। সংরক্ষণের পরে আর দেখানো হবে না।</p>
                <div className="flex flex-wrap gap-2"><Button type="submit" disabled={connectConnector.isPending || apiKeyDraft.trim().length < 12} className="bg-[#176b4b] text-white hover:bg-[#10563b]">{connectConnector.isPending ? "যাচাই হচ্ছে…" : "যাচাই করে সংযোগ দিন"}</Button><Button type="button" variant="outline" onClick={() => { setConnectingProvider(null); setApiKeyDraft(""); }}>বাতিল</Button></div>
              </form> : <div className="mt-4 flex flex-wrap gap-2">
                {!connected && canConnect && <Button type="button" onClick={() => { setConnectingProvider(row.id); setApiKeyDraft(""); }} className="bg-[#176b4b] text-white hover:bg-[#10563b]"><Link2 size={14} className="mr-2" /> সংযোগ দিন</Button>}
                {!connected && !canConnect && <span className="self-center text-xs text-[#7a867c]">বর্তমান বিনামূল্যের নীতিতে key যোগ করা যাচ্ছে না</span>}
                {connected && <>{canConnect && <Button type="button" variant="outline" disabled={testConnector.isPending} onClick={() => testConnector.mutate({ provider: row.id })}>সংযোগ পরীক্ষা</Button>}<Button type="button" variant="outline" disabled={disconnectConnector.isPending} onClick={() => disconnectConnector.mutate({ provider: row.id })}>সংযোগ বিচ্ছিন্ন</Button>{!canConnect && <span className="self-center text-xs text-amber-700">পুরোনো সংরক্ষিত key সরাতে সংযোগ বিচ্ছিন্ন করুন</span>}</>}
              </div>}
              {row.id === "openrouter" && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-[11px] leading-5 text-emerald-800">সংযুক্ত হলে Work Desk-এর লেখার ঘর থেকে “আমার OpenRouter বিনামূল্যের সংযোগ” বেছে নিজের key দিয়ে কাজ চালাতে পারবেন।</p>}
              {row.id === "gemini" && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-900">Google AI Studio-এর Free quota account ও model অনুযায়ী বদলায়। Free quota শেষ হলে Google আপনার project-এ charge করতে পারে। DSAI এই খরচ নিয়ন্ত্রণ বা পরিশোধ করে না; DSAI Free Credit কাটবে না, তবে আলাদা fair-use request limit থাকবে। Key server-side AES-256-GCM দিয়ে encrypted থাকে; Test Connection শুধু metadata endpoint ব্যবহার করে, generation চালায় না।</p>}
            </article>;
          })}
        </div>
        {userConnectors.isLoading && <p className="text-xs text-[#7a867c]" role="status">আপনার সংযোগের অবস্থা লোড হচ্ছে…</p>}
        {userConnectors.isError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">সংযোগের তালিকা পাওয়া যায়নি। <Button type="button" variant="outline" size="sm" onClick={() => void userConnectors.refetch()}>আবার চেষ্টা</Button></div>}
        <p className="text-[11px] leading-5 text-[#879187]">নিরাপত্তা: API key-এর গোপন অংশ কোনো তালিকা, log বা browser response-এ প্রকাশ করা হয় না। বিনামূল্যের ব্যবহার সেবাদাতার নিজস্ব নিয়ম ও সীমার অধীন; DSAI পেইড সেবায় স্বয়ংক্রিয়ভাবে যায় না।</p>
      </>}
    </section>
  );
}
