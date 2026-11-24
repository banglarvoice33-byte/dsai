import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowUpRight, Bot, Code2, FileSearch, Globe, Image, Languages, Mic,
  Music, Search, Video, Workflow, X,
} from "lucide-react";
import { buildProviderReferralUrl, DSAI_AI_HUB_CATEGORIES, type AIHubCategoryId } from "@shared/aiHubPublicCatalog";
import { isAiHubConnectorSetupAvailable } from "@shared/aiHubCapabilities";

const icons = [Bot, Bot, Image, Video, Mic, Music, Globe, Globe, Code2, Search, Workflow, FileSearch, Languages, FileSearch];

// Curated aliases improve practical Bangla/English keyword discovery without claiming semantic search.
const providerAliases: Record<string, string> = {
  chatgpt: "চ্যাট জিপিটি লেখা প্রশ্ন উত্তর assistant chatbot",
  "openai-platform": "api developer platform gpt",
  claude: "ক্লড anthropic writing coding",
  gemini: "জেমিনি google chat",
  deepseek: "ডিপসিক coding reasoning",
  "meta-ai": "মেটা এআই",
  "qwen-chat": "কুয়েন alibaba",
  "adobe-firefly": "অ্যাডোবি ফায়ারফ্লাই",
  canva: "ক্যানভা design poster",
  veo: "ভিও video",
  runway: "রানওয়ে ভিডিও",
  "cloudflare-workers-ai": "ক্লাউডফ্লেয়ার inference",
  huggingface: "হাগিং ফেস open model",
  openrouter: "ওপেনরাউটার model api",
  groq: "গ্রক fast inference",
  mistral: "মিস্ট্রাল",
  n8n: "automation workflow",
};

function normalizeSearch(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/[.,!?;:()[\]{}“”'"\x60]/g, " ").replace(/\s+/g, " ").trim();
}

function getInitialFilters() {
  if (typeof window === "undefined") return { query: "", category: "all" as const };
  const params = new URLSearchParams(window.location.search);
  const requestedCategory = params.get("category") ?? "all";
  const validCategory = requestedCategory === "all" || DSAI_AI_HUB_CATEGORIES.some(item => item.id === requestedCategory);
  return {
    query: params.get("q") ?? "",
    category: (validCategory ? requestedCategory : "all") as AIHubCategoryId | "all",
  };
}

export default function AIHub() {
  const [initial] = useState(getInitialFilters);
  const [selected, setSelected] = useState<AIHubCategoryId | "all">(initial.category);
  const [query, setQuery] = useState(initial.query);
  const categories = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    const tokens = normalizedQuery.split(" ").filter(Boolean);
    return DSAI_AI_HUB_CATEGORIES.map(category => ({
      ...category,
      providers: category.providers.filter(provider => {
        const haystack = normalizeSearch([
          provider.name, provider.purpose, category.name, category.description,
          provider.id, providerAliases[provider.id] ?? "",
        ].join(" "));
        return !tokens.length || tokens.every(token => haystack.includes(token));
      }),
    })).filter(category => (selected === "all" || category.id === selected) && category.providers.length > 0);
  }, [selected, query]);
  const providerCount = DSAI_AI_HUB_CATEGORIES.reduce((sum, category) => sum + category.providers.length, 0);
  const visibleCount = categories.reduce((sum, category) => sum + category.providers.length, 0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selected !== "all") params.set("category", selected);
    const suffix = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (suffix ? "?" + suffix : "") + window.location.hash);
  }, [query, selected]);

  const clearFilters = () => { setQuery(""); setSelected("all"); };

  return <main className="min-h-screen bg-[#f5f8f5] text-[#1d3028]">
    <a href="#ai-hub-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3">মূল কনটেন্টে যান</a>
    <header className="sticky top-0 z-40 border-b border-[#e2e8e2] bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/ai-hub" className="inline-flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#176b4b] text-sm font-bold text-white">D</span>
          <span>DSAI <span className="font-normal text-[#728078]">/ AI Hub</span></span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="DSAI navigation">
          <span aria-current="page" className="rounded-full bg-[#eaf4ee] px-3 py-2 text-xs font-semibold text-[#176b4b]">AI Hub</span>
          <Link href="/workspace" className="rounded-full px-3 py-2 text-xs font-medium text-[#66756b] transition hover:bg-[#f1f5f1] hover:text-[#176b4b]">Work Desk</Link>
          <Link href="/" className="hidden rounded-full px-3 py-2 text-xs font-medium text-[#66756b] hover:bg-[#f1f5f1] sm:inline-flex">হোম</Link>
        </nav>
      </div>
    </header>

    <div id="ai-hub-content" className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#dce8df] bg-white p-6 shadow-[0_16px_48px_rgba(22,55,38,.055)] sm:p-9">
        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border-[36px] border-[#eff6f0]" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#27805b]">DSAI / DISCOVER AI</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#1d3028] sm:text-4xl">আপনার কাজের জন্য সঠিক AI খুঁজুন</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#68786e] sm:text-base">কাজ, বিভাগ বা প্ল্যাটফর্মের নাম দিয়ে খুঁজুন। বাংলা, বাংলিশ ও ইংরেজি কীওয়ার্ড সমর্থিত।</p>
          </div>
          <div className="flex gap-2">
            <div className="min-w-24 rounded-2xl border border-[#e1e8e1] bg-[#f9fcf9] px-4 py-3"><strong className="block text-2xl tabular-nums">{DSAI_AI_HUB_CATEGORIES.length.toLocaleString("bn-BD")}</strong><span className="text-[11px] text-[#77857b]">বিভাগ</span></div>
            <div className="min-w-28 rounded-2xl border border-[#e1e8e1] bg-[#f9fcf9] px-4 py-3"><strong className="block text-2xl tabular-nums">{providerCount.toLocaleString("bn-BD")}</strong><span className="text-[11px] text-[#77857b]">তালিকাভুক্ত সেবা</span></div>
          </div>
        </div>
        <div className="relative mt-7 flex flex-col gap-3 sm:flex-row">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">AI প্ল্যাটফর্ম বা কাজ খুঁজুন</span>
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#829187]" />
            <input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Escape") setQuery(""); }} placeholder="যেমন: ছবি তৈরি, coding, বাংলা অনুবাদ, ChatGPT…" className="h-14 w-full rounded-2xl border border-[#dce6dd] bg-[#fbfdfb] pl-12 pr-12 text-sm outline-none transition placeholder:text-[#91a096] focus:border-[#27805b] focus:ring-4 focus:ring-[#27805b]/10" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="অনুসন্ধান মুছুন" className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-[#6c7b71] hover:bg-[#edf4ee]"><X size={17} /></button>}
          </label>
          <label className="sr-only" htmlFor="ai-hub-category">বিভাগ নির্বাচন</label>
          <select id="ai-hub-category" value={selected} onChange={event => setSelected(event.target.value as AIHubCategoryId | "all")} className="h-14 rounded-2xl border border-[#dce6dd] bg-white px-4 text-sm text-[#52675a] outline-none focus:border-[#27805b] focus:ring-4 focus:ring-[#27805b]/10 sm:min-w-56">
            <option value="all">সব বিভাগ</option>
            {DSAI_AI_HUB_CATEGORIES.map(category => <option key={category.id} value={category.id}>{category.name} ({category.providers.length})</option>)}
          </select>
        </div>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="দ্রুত বিভাগ নির্বাচন">
          <button type="button" onClick={() => setSelected("all")} aria-pressed={selected === "all"} className={"min-h-10 rounded-full px-4 py-2 text-xs font-semibold transition " + (selected === "all" ? "bg-[#176b4b] text-white" : "border border-[#e1e8e1] bg-white text-[#64746a] hover:border-[#a9c7b2]")}>সব বিভাগ</button>
          {DSAI_AI_HUB_CATEGORIES.map((category, index) => {
            const CategoryIcon = icons[index] ?? Bot;
            return <button type="button" key={category.id} onClick={() => setSelected(category.id)} aria-pressed={selected === category.id} className={"inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition " + (selected === category.id ? "bg-[#176b4b] text-white" : "border border-[#e1e8e1] bg-white text-[#64746a] hover:border-[#a9c7b2]")}>
              <CategoryIcon size={13} aria-hidden="true" />{category.name}
            </button>;
          })}
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-semibold text-[#344b3c]" aria-live="polite">{visibleCount.toLocaleString("bn-BD")}টি সেবা পাওয়া গেছে</p><p className="mt-1 text-xs text-[#829087]">তালিকাভুক্ত সেবা; Connector সমর্থন আলাদাভাবে চিহ্নিত।</p></div>
        {(query || selected !== "all") && <button type="button" onClick={clearFilters} className="min-h-10 rounded-full px-3 text-xs font-semibold text-[#176b4b] hover:bg-[#eaf4ee]">সব ফিল্টার মুছুন</button>}
      </div>

      <section className="mt-4 space-y-7" aria-label="AI প্ল্যাটফর্মের তালিকা">
        {categories.length === 0 ? <div className="rounded-3xl border border-dashed border-[#d8e2d9] bg-white p-12 text-center" role="status">
          <Search className="mx-auto h-7 w-7 text-[#9aaa9f]" /><h2 className="mt-3 text-lg font-semibold">কোনো সেবা পাওয়া যায়নি</h2><p className="mt-1 text-sm text-[#77857b]">বানান বা অন্য বাংলা/ইংরেজি শব্দ দিয়ে খুঁজুন।</p>
          <button type="button" onClick={clearFilters} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[#176b4b] px-5 py-2 text-xs font-semibold text-white hover:bg-[#10563b]">সব সেবা দেখুন</button>
        </div> : categories.map(category => {
          const CategoryIcon = icons[DSAI_AI_HUB_CATEGORIES.findIndex(item => item.id === category.id)] ?? Bot;
          return <section key={category.id} className="overflow-hidden rounded-3xl border border-[#e1e8e1] bg-white shadow-[0_8px_28px_rgba(22,55,38,.035)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1ed] px-5 py-4">
              <div className="flex min-w-0 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#eaf4ee] text-[#176b4b]"><CategoryIcon size={19} /></span>
                <div className="min-w-0"><h2 className="font-semibold text-[#263c30]">{category.name}</h2><p className="mt-0.5 text-xs leading-5 text-[#839087]">{category.description}</p></div>
              </div>
              <span className="rounded-full bg-[#f3f6f3] px-3 py-1.5 text-[11px] font-medium text-[#6e7d73]">{category.providers.length.toLocaleString("bn-BD")}টি</span>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {category.providers.map(provider => {
                const canSetup = isAiHubConnectorSetupAvailable(provider.id);
                return <article key={provider.id} className="flex min-h-44 min-w-0 flex-col rounded-2xl border border-[#e7ece7] bg-[#fcfdfc] p-4 transition hover:border-[#b9d2bf] hover:shadow-sm">
                  <div className="flex items-start justify-between gap-2"><h3 className="font-semibold text-[#2a4033]">{provider.name}</h3>
                    <span className={"shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-semibold " + (canSetup ? "bg-[#e5f4ea] text-[#236b42]" : "bg-[#f1f3f1] text-[#68766d]")}>{canSetup ? "Connector সেটআপ" : "বাহ্যিক সেবা"}</span>
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[#69786e]">{provider.purpose}</p>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-[#edf1ed] pt-3">
                    {provider.officialUrl && <a href={buildProviderReferralUrl(provider)} target="_blank" rel="noopener noreferrer" aria-label={provider.name + " খুলুন (নতুন ট্যাবে)"} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#176b4b] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#10563b]">অফিশিয়াল সাইট <ArrowUpRight size={13} /></a>}
                    {canSetup && <Link href="/workspace#workdesk-marketplace-heading" className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#dce6dd] px-3 py-2 text-[11px] font-semibold text-[#52675a] hover:border-[#9bbca7]">DSAI সেটআপ <ArrowUpRight size={13} /></Link>}
                  </div>
                </article>;
              })}
            </div>
          </section>;
        })}
      </section>
    </div>
  </main>;
}
