import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowUpRight, Bot, Code2, FileSearch, Globe, Image, Languages, Mic,
  Music, Search, Video, Workflow, X,
} from "lucide-react";
import { buildProviderReferralUrl, DSAI_AI_HUB_CATEGORIES, type AIHubCategoryId } from "@shared/aiHubPublicCatalog";
import { isAiHubConnectorSetupAvailable } from "@shared/aiHubCapabilities";
import { filterAIHubCategories } from "@shared/aiHubSearch";

const icons = [Bot, Bot, Image, Video, Mic, Music, Globe, Globe, Code2, Search, Workflow, FileSearch, Languages, FileSearch];

function readFiltersFromUrl(): { query: string; selected: AIHubCategoryId | "all" } {
  const params = new URLSearchParams(window.location.search);
  const requestedCategory = params.get("category") as AIHubCategoryId | null;
  const selected = requestedCategory && DSAI_AI_HUB_CATEGORIES.some(category => category.id === requestedCategory)
    ? requestedCategory
    : "all";
  return { query: params.get("q") ?? "", selected };
}

export default function AIHub() {
  const [initialFilters] = useState(readFiltersFromUrl);
  const [selected, setSelected] = useState<AIHubCategoryId | "all">(initialFilters.selected);
  const [query, setQuery] = useState(initialFilters.query);
  const categories = useMemo(
    () => filterAIHubCategories(DSAI_AI_HUB_CATEGORIES, query, selected),
    [selected, query],
  );
  const providerCount = DSAI_AI_HUB_CATEGORIES.reduce((sum, category) => sum + category.providers.length, 0);
  const visibleCount = categories.reduce((sum, category) => sum + category.providers.length, 0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (query.trim()) params.set("q", query.trim());
    else params.delete("q");
    if (selected !== "all") params.set("category", selected);
    else params.delete("category");
    const suffix = params.toString();
    window.history.replaceState(window.history.state, "", window.location.pathname + (suffix ? "?" + suffix : "") + window.location.hash);
  }, [query, selected]);

  useEffect(() => {
    const restore = () => {
      const filters = readFiltersFromUrl();
      setQuery(filters.query);
      setSelected(filters.selected);
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  const clearFilters = () => { setQuery(""); setSelected("all"); };

  return (
    <main className="min-h-screen bg-[#f6f8f5] text-[#1d3028]">
      <header className="sticky top-0 z-40 border-b border-[#e2e8e2] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/ai-hub" className="inline-flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#176b4b] text-sm font-bold text-white">D</span>
            <span>DSAI <span className="font-normal text-[#728078]">/ AI Hub</span></span>
          </Link>
          <nav className="flex items-center gap-2" aria-label="DSAI navigation">
            <span aria-current="page" className="rounded-full bg-[#eaf4ee] px-3 py-2 text-xs font-semibold text-[#176b4b]">AI Hub</span>
            <Link href="/workspace" className="rounded-full px-3 py-2 text-xs font-medium text-[#66756b] transition hover:bg-[#f1f5f1] hover:text-[#176b4b]">Work Desk</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#27805b]">DSAI / AI HUB</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">এআই সেবা খুঁজুন</h1>
            <p className="mt-2 text-sm leading-6 text-[#6d7b72]">কাজ, মডেল ও টুল অনুযায়ী সেবা বেছে নিন। তালিকাভুক্ত সেবা এবং DSAI-তে সংযুক্ত সুবিধা আলাদাভাবে চিহ্নিত।</p>
          </div>
          <div className="flex gap-2">
            <div className="rounded-2xl border border-[#e1e8e1] bg-white px-4 py-3"><strong className="block text-2xl tabular-nums">{DSAI_AI_HUB_CATEGORIES.length}</strong><span className="text-[10px] text-[#77857b]">বিভাগ</span></div>
            <div className="rounded-2xl border border-[#e1e8e1] bg-white px-4 py-3"><strong className="block text-2xl tabular-nums">{providerCount}</strong><span className="text-[10px] text-[#77857b]">তালিকাভুক্ত সেবা</span></div>
          </div>
        </section>

        <section className="mt-7 rounded-3xl border border-[#e1e8e1] bg-white p-3 shadow-[0_8px_28px_rgba(22,55,38,.04)] sm:p-4" aria-label="এআই সেবা অনুসন্ধান">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block min-w-0 flex-1">
              <span className="sr-only">এআই সেবা, কাজ বা প্ল্যাটফর্ম খুঁজুন</span>
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a988e]" aria-hidden="true" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                onKeyDown={event => { if (event.key === "Escape") setQuery(""); }}
                placeholder="সেবা, মডেল বা কাজ খুঁজুন…"
                className="h-12 w-full rounded-2xl border border-[#e3eae3] bg-[#fbfdfb] pl-11 pr-11 text-sm outline-none transition focus:border-[#27805b] focus:ring-4 focus:ring-[#27805b]/10"
              />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="অনুসন্ধান মুছুন" className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[#718078] hover:bg-[#edf3ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27805b]"><X size={15} /></button>}
            </label>
            <label className="flex min-w-0 items-center gap-2">
              <span className="sr-only">ক্যাটাগরি নির্বাচন</span>
              <select aria-label="ক্যাটাগরি নির্বাচন" value={selected} onChange={event => setSelected(event.target.value as AIHubCategoryId | "all")} className="h-12 w-full min-w-0 rounded-2xl border border-[#e1e8e1] bg-[#fbfdfb] px-4 text-sm text-[#52675a] outline-none focus:border-[#27805b] sm:w-56">
                <option value="all">সব বিভাগ</option>
                {DSAI_AI_HUB_CATEGORIES.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="এআই সেবার বিভাগ">
            <button type="button" onClick={() => setSelected("all")} aria-pressed={selected === "all"} className={"shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition " + (selected === "all" ? "bg-[#176b4b] text-white" : "border border-[#e1e8e1] bg-white text-[#64746a] hover:border-[#a9c7b2]")}>সব</button>
            {DSAI_AI_HUB_CATEGORIES.map((category, index) => {
              const CategoryIcon = icons[index] ?? Bot;
              return <button type="button" key={category.id} onClick={() => setSelected(category.id)} aria-pressed={selected === category.id} className={"inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition " + (selected === category.id ? "bg-[#176b4b] text-white" : "border border-[#e1e8e1] bg-white text-[#64746a] hover:border-[#a9c7b2]")}>
                <CategoryIcon size={13} aria-hidden="true" />{category.name}
              </button>;
            })}
          </div>
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#718078]" aria-live="polite" aria-atomic="true">
            {visibleCount.toLocaleString("bn-BD")}টি সেবা পাওয়া গেছে
            {query.trim() ? <> · “{query.trim()}”</> : null}
          </p>
          {query || selected !== "all" ? <button type="button" onClick={clearFilters} className="text-xs font-medium text-[#176b4b] hover:underline">সব ফিল্টার মুছুন</button> : null}
        </div>

        <div className="mt-4 rounded-2xl border border-[#e1e8e1] bg-[#f0f5f0] px-4 py-3 text-xs leading-6 text-[#52675a]">
          <strong className="font-semibold text-[#284c38]">ব্যবহারের ধরন:</strong> “DSAI সংযোগ” মানে Work Desk-এ অনুমোদিত API credential flow আছে। অন্য সেবাগুলো তাদের নিজস্ব ওয়েবসাইটে ব্যবহার করতে হবে; তালিকায় থাকা মানেই DSAI integration নয়।
        </div>

        <section className="mt-5 space-y-7" aria-label="এআই সেবার তালিকা">
          {categories.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#d8e2d9] bg-white p-12 text-center" role="status">
              <Search className="mx-auto h-7 w-7 text-[#9aaa9f]" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-semibold">কোনো সেবা পাওয়া যায়নি</h2>
              <p className="mt-1 text-sm text-[#77857b]">বাংলা, বাংলিশ বা ইংরেজিতে অন্য শব্দ দিয়ে খুঁজুন।</p>
              <button type="button" onClick={clearFilters} className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-[#176b4b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#10563b]">সব সেবা দেখুন</button>
            </div>
          ) : categories.map(category => {
            const CategoryIcon = icons[DSAI_AI_HUB_CATEGORIES.findIndex(item => item.id === category.id)] ?? Bot;
            return (
              <section key={category.id} className="overflow-hidden rounded-3xl border border-[#e1e8e1] bg-white shadow-[0_8px_28px_rgba(22,55,38,.035)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1ed] px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#eaf4ee] text-[#176b4b]"><CategoryIcon size={19} /></span>
                    <div className="min-w-0"><h2 className="font-semibold text-[#263c30]">{category.name}</h2><p className="mt-0.5 text-xs leading-5 text-[#839087]">{category.description}</p></div>
                  </div>
                  <span className="rounded-full bg-[#f3f6f3] px-3 py-1 text-[10px] font-medium text-[#6e7d73]">{category.providers.length.toLocaleString("bn-BD")}টি</span>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                  {category.providers.map(provider => {
                    const canSetup = isAiHubConnectorSetupAvailable(provider.id);
                    const isGemini = provider.id === "gemini";
                    const connectorLabel = isGemini ? "নিজস্ব Gemini API · খরচ হতে পারে" : "নিজস্ব OpenRouter API · OpenRouter Free route";
                    return (
                      <article key={provider.id} className="flex min-h-44 min-w-0 flex-col rounded-2xl border border-[#e7ece7] bg-[#fcfdfc] p-4 transition hover:border-[#b9d2bf] hover:shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="min-w-0 font-semibold text-[#2a4033]">{provider.name}</h3>
                          <span className={"shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold " + (canSetup ? "bg-[#e5f4ea] text-[#236b42]" : "bg-[#f1f3f1] text-[#66756b]")}>
                            {canSetup ? "DSAI সংযোগ" : "বাহ্যিক সেবা"}
                          </span>
                        </div>
                        <p className="mt-2 flex-1 text-sm leading-6 text-[#69786e]">{provider.purpose}</p>
                        {canSetup && <p className="mt-2 text-[11px] leading-5 text-[#607267]">{connectorLabel}{isGemini ? " — generation-এর আগে খরচের সম্মতি আবশ্যক।" : " — free model availability ও rate limit পরিবর্তনশীল।"}</p>}
                        {!canSetup && <p className="mt-2 text-[11px] text-[#7c887f]">DSAI-তে API execution সংযুক্ত নয়। অফিসিয়াল সাইটে ব্যবহার করুন।</p>}
                        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#edf1ed] pt-3">
                          {provider.officialUrl && <a href={buildProviderReferralUrl(provider)} target="_blank" rel="noopener noreferrer" aria-label={provider.name + " অফিসিয়াল সাইট খুলুন (নতুন ট্যাবে)"} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#176b4b] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#10563b]">অফিসিয়াল সাইট <ArrowUpRight size={13} aria-hidden="true" /></a>}
                          {canSetup && <Link href="/workspace?panel=marketplace" className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#dce6dd] px-3 py-2 text-[11px] font-semibold text-[#52675a] hover:border-[#9bbca7]">DSAI Connector সেটআপ <ArrowUpRight size={13} aria-hidden="true" /></Link>}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </section>
      </div>
    </main>
  );
}
