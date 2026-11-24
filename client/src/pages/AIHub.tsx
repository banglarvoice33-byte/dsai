import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowUpRight, Bot, CheckCircle2, Code2, FileSearch, Globe, Image, Languages, Mic,
  Music, Search, Video, Workflow, X,
} from "lucide-react";
import { buildProviderReferralUrl, DSAI_AI_HUB_CATEGORIES, type AIHubCategoryId } from "@shared/aiHubPublicCatalog";
import { AI_HUB_CONNECTOR_SETUP_IDS, isAiHubConnectorSetupAvailable } from "@shared/aiHubCapabilities";
import { filterAIHubCategories } from "@shared/aiHubSearch";

const icons = [Bot, Bot, Image, Video, Mic, Music, Globe, Globe, Code2, Search, Workflow, FileSearch, Languages, FileSearch];
const runtimeProviders = new Set<string>(AI_HUB_CONNECTOR_SETUP_IDS);

export default function AIHub() {
  const [selected, setSelected] = useState<AIHubCategoryId | "all">(() => {
    const value = new URLSearchParams(window.location.search).get("category");
    return value && DSAI_AI_HUB_CATEGORIES.some(category => category.id === value) ? value as AIHubCategoryId : "all";
  });
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");

  // Keep filters shareable without forcing a full navigation or changing existing routes.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (query.trim()) params.set("q", query.trim()); else params.delete("q");
    if (selected !== "all") params.set("category", selected); else params.delete("category");
    const next = params.toString();
    const url = next ? `${window.location.pathname}?${next}` : window.location.pathname;
    window.history.replaceState(window.history.state, "", url);
  }, [query, selected]);

  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(window.location.search);
      const category = params.get("category") as AIHubCategoryId | null;
      setQuery(params.get("q") ?? "");
      setSelected(category && DSAI_AI_HUB_CATEGORIES.some(item => item.id === category) ? category : "all");
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  const providerCount = DSAI_AI_HUB_CATEGORIES.reduce((sum, category) => sum + category.providers.length, 0);
  const integratedCount = DSAI_AI_HUB_CATEGORIES.reduce(
    (sum, category) => sum + category.providers.filter(provider => runtimeProviders.has(provider.id)).length, 0,
  );

  const categories = useMemo(
    () => filterAIHubCategories(DSAI_AI_HUB_CATEGORIES, query, selected),
    [selected, query],
  );

  const visibleCount = categories.reduce((sum, category) => sum + category.providers.length, 0);

  return <main className="min-h-screen bg-[#f5f8f5] text-[#1d3028]">
    <header className="sticky top-0 z-40 border-b border-[#e2e8e2] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/ai-hub" className="inline-flex items-center gap-2 font-semibold tracking-tight" aria-label="DSAI AI Hub home">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#176b4b] text-sm font-bold text-white">D</span>
          <span>DSAI <span className="font-normal text-[#728078]">/ AI Hub</span></span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="DSAI navigation">
          <span aria-current="page" className="rounded-full bg-[#eaf4ee] px-3 py-2 text-xs font-semibold text-[#176b4b]">AI Hub</span>
          <Link href="/workspace" className="rounded-full px-3 py-2 text-xs font-medium text-[#66756b] transition hover:bg-[#f1f5f1] hover:text-[#176b4b]">Work Desk <ArrowUpRight size={13} className="ml-1 inline" /></Link>
        </nav>
      </div>
    </header>

    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#153d2d] px-5 py-7 text-white shadow-[0_18px_55px_rgba(20,58,42,.12)] sm:px-8 sm:py-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-12 h-48 w-48 rounded-full border border-white/10" />
        <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#a9d6b7]">DSAI / AI HUB</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">আপনার কাজের জন্য সঠিক AI খুঁজুন</h1>
                        <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/workspace" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-[#17432f] transition hover:bg-[#eaf4ee]">Work Desk খুলুন <ArrowUpRight size={14} /></Link>
              <span className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 py-2.5 text-xs text-[#e0eee4]">বাংলা ও English সার্চ</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:min-w-[290px]">
            <div className="rounded-2xl border border-white/15 bg-white/[.07] p-4">
              <strong className="block text-3xl font-semibold tabular-nums">{providerCount.toLocaleString("bn-BD")}</strong>
              <span className="mt-1 block text-[11px] text-[#c6d9cc]">তালিকাভুক্ত সেবা</span>
            </div>
            <div className="rounded-2xl border border-[#a9d6b7]/30 bg-[#a9d6b7]/10 p-4">
              <strong className="block text-3xl font-semibold tabular-nums">{integratedCount.toLocaleString("bn-BD")}</strong>
              <span className="mt-1 block text-[11px] text-[#c6e5d0]">DSAI connector setup</span>
            </div>
            <p className="col-span-2 text-right text-[10px] leading-5 text-[#b8cfc0]">তালিকাভুক্ত সেবা ও চালু connector আলাদা হিসাব</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-[#e1e8e1] bg-white p-3 shadow-[0_8px_28px_rgba(22,55,38,.04)] sm:p-4" aria-label="এআই সেবা অনুসন্ধান">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">এআই সেবা খুঁজুন</span>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a988e]" aria-hidden="true" />
            <input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Escape") setQuery(""); }} placeholder="কী করতে চান? যেমন: ছবি তৈরি, research, coding…" className="h-12 w-full rounded-2xl border border-[#e3eae3] bg-[#fbfdfb] pl-11 pr-11 text-sm outline-none transition focus:border-[#27805b] focus:ring-4 focus:ring-[#27805b]/10" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="সার্চ মুছুন" className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[#718078] hover:bg-[#edf3ee]"><X size={15} /></button>}
          </label>
          <select aria-label="ক্যাটাগরি নির্বাচন" value={selected} onChange={event => setSelected(event.target.value as AIHubCategoryId | "all")} className="h-12 rounded-2xl border border-[#e1e8e1] bg-[#fbfdfb] px-4 text-sm text-[#52675a] outline-none focus:border-[#27805b]">
            <option value="all">সব বিভাগ</option>
            {DSAI_AI_HUB_CATEGORIES.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="এআই সেবার বিভাগ">
          <button type="button" onClick={() => setSelected("all")} aria-pressed={selected === "all"} className={"min-h-9 shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition " + (selected === "all" ? "bg-[#176b4b] text-white" : "border border-[#e1e8e1] bg-white text-[#64746a] hover:border-[#a9c7b2]")}>সব বিভাগ</button>
          {DSAI_AI_HUB_CATEGORIES.map((category, index) => {
            const CategoryIcon = icons[index] ?? Bot;
            return <button type="button" key={category.id} onClick={() => setSelected(category.id)} aria-pressed={selected === category.id} className={"inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition " + (selected === category.id ? "bg-[#176b4b] text-white" : "border border-[#e1e8e1] bg-white text-[#64746a] hover:border-[#a9c7b2]")}>
              <CategoryIcon size={13} aria-hidden="true" />{category.name}
            </button>;
          })}
        </div>
      </section>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#718078]" aria-live="polite">
          <strong className="font-semibold text-[#314b3a]">{visibleCount.toLocaleString("bn-BD")}</strong>টি সেবা পাওয়া গেছে
          <span className="mx-2 text-[#b3beb5]">·</span>
          {categories.length.toLocaleString("bn-BD")}টি বিভাগ
          <span className="mx-2 text-[#b3beb5]">·</span>
          <span>{integratedCount.toLocaleString("bn-BD")}টি DSAI connector</span>
        </div>
        {(query || selected !== "all") && <button type="button" onClick={() => { setQuery(""); setSelected("all"); }} className="min-h-9 rounded-full px-3 text-xs font-medium text-[#176b4b] hover:bg-[#eaf4ee]">ফিল্টার মুছুন</button>}
      </div>

      <section className="mt-4 space-y-6" aria-label="এআই সেবার তালিকা">
        {categories.length === 0 ? <div className="rounded-3xl border border-dashed border-[#d8e2d9] bg-white p-12 text-center" role="status">
          <Search className="mx-auto h-7 w-7 text-[#9aaa9f]" aria-hidden="true" /><h2 className="mt-3 text-lg font-semibold">কোনো সেবা পাওয়া যায়নি</h2><p className="mt-1 text-sm text-[#77857b]">বাংলা বা ইংরেজিতে অন্য শব্দ দিয়ে খুঁজুন।</p>
          <button type="button" onClick={() => { setQuery(""); setSelected("all"); }} className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-[#176b4b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#10563b]">আবার খুঁজুন</button>
        </div> : categories.map(category => {
          const CategoryIcon = icons[DSAI_AI_HUB_CATEGORIES.findIndex(item => item.id === category.id)] ?? Bot;
          return <section key={category.id} className="overflow-hidden rounded-3xl border border-[#e1e8e1] bg-white shadow-[0_8px_28px_rgba(22,55,38,.035)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1ed] px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#eaf4ee] text-[#176b4b]"><CategoryIcon size={19} aria-hidden="true" /></span>
                <div className="min-w-0"><h2 className="font-semibold text-[#263c30]">{category.name}</h2><p className="mt-0.5 text-xs leading-5 text-[#839087]">{category.description}</p></div>
              </div>
              <span className="rounded-full bg-[#f3f6f3] px-3 py-1 text-[10px] font-medium text-[#6e7d73]">{category.providers.length.toLocaleString("bn-BD")}টি</span>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
              {category.providers.map(provider => {
                const runtimeReady = runtimeProviders.has(provider.id);
                const canSetup = isAiHubConnectorSetupAvailable(provider.id);
                const referralUrl = buildProviderReferralUrl(provider);
                return <article key={provider.id} className="flex min-h-44 min-w-0 flex-col rounded-2xl border border-[#e7ece7] bg-[#fcfdfc] p-4 transition hover:-translate-y-0.5 hover:border-[#b9d2bf] hover:shadow-[0_10px_24px_rgba(22,55,38,.06)]">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="min-w-0 font-semibold leading-6 text-[#2a4033]">{provider.name}</h3>
                    <span className={"shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold " + (runtimeReady ? "bg-[#e5f4ea] text-[#236b42]" : "bg-[#f1f3f1] text-[#68766d]")}>
                      {runtimeReady ? "চালু" : "শুধু তালিকা"}
                    </span>
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[#69786e]">{provider.purpose}</p>
                  <details className="mt-3 rounded-xl border border-[#e7ece7] bg-white">
                    <summary className="flex min-h-10 cursor-pointer items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-[#52675a] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#27805b]">
                      ব্যবহার ও সংযোগের অবস্থা
                      <span aria-hidden="true" className="text-[#8a988e]">＋</span>
                    </summary>
                    <div className="space-y-2 border-t border-[#edf1ed] px-3 py-3 text-xs leading-5 text-[#69786e]">
                      <p><strong className="font-semibold text-[#405648]">DSAI:</strong> {runtimeReady ? "চালু" : "শুধু তালিকা"}</p>
                      {provider.id === "gemini" && canSetup && <p>নিজস্ব Gemini API key ব্যবহার করুন; generation-এর আগে খরচের সম্মতি আবশ্যক।</p>}
                      {provider.id === "openrouter" && canSetup && <p>নিজস্ব OpenRouter API key ব্যবহার করুন; Free route-এর প্রাপ্যতা পরিবর্তনশীল।</p>}
                      {provider.officialUrl && <a href={referralUrl ?? provider.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center font-semibold text-[#176b4b] underline underline-offset-2">অফিসিয়াল তথ্য দেখুন <ArrowUpRight size={12} className="ml-1" aria-hidden="true" /></a>}
                    </div>
                  </details>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#7c897f]">
                    {runtimeReady ? <><CheckCircle2 size={12} className="text-[#27805b]" aria-hidden="true" />চালু</> : <>শুধু তালিকা</>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-[#edf1ed] pt-3">
                    {referralUrl && <a href={referralUrl} target="_blank" rel="noopener noreferrer" aria-label={provider.name + " অফিসিয়াল সাইট খুলুন (নতুন ট্যাবে)"} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#176b4b] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#10563b]">অফিসিয়াল সাইট <ArrowUpRight size={13} aria-hidden="true" /></a>}
                    {canSetup && <Link href="/workspace?panel=marketplace" className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#dce6dd] px-3 py-2 text-[11px] font-semibold text-[#52675a] hover:border-[#9bbca7]">DSAI Connector সেটআপ <ArrowUpRight size={13} aria-hidden="true" /></Link>}
                  </div>
                </article>;
              })}
            </div>
          </section>;
        })}
      </section>
      <footer className="mt-10 flex flex-col gap-2 border-t border-[#e1e8e1] py-6 text-xs leading-6 text-[#718078] sm:flex-row sm:items-center sm:justify-between">
        <p>তালিকাভুক্ত সেবা মানেই DSAI integration নয়; খরচ ও সীমা প্রদানকারীর।</p>
        <Link href="/workspace" className="shrink-0 font-semibold text-[#176b4b] hover:underline">Work Desk-এ যান →</Link>
      </footer>
    </div>
  </main>;
}
