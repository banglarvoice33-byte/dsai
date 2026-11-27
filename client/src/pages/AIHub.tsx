import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Bot, Code2, FileSearch, Globe, Image, Languages, Mic, Music, Search, Video, Workflow, X } from "lucide-react";
import { buildProviderReferralUrl, DSAI_AI_HUB_CATEGORIES, type AIHubCategoryId } from "@shared/aiHubPublicCatalog";
import { AI_HUB_CONNECTOR_SETUP_IDS } from "@shared/aiHubCapabilities";
import { filterAIHubCategories } from "@shared/aiHubSearch";

const icons = [Bot, Bot, Image, Video, Mic, Music, Globe, Globe, Code2, Search, Workflow, FileSearch, Languages, FileSearch];
const connectorIds = new Set<string>(AI_HUB_CONNECTOR_SETUP_IDS);

export default function AIHub() {
  const [selected, setSelected] = useState<AIHubCategoryId | "all">(() => {
    const value = new URLSearchParams(window.location.search).get("category");
    return value && DSAI_AI_HUB_CATEGORIES.some(category => category.id === value) ? value as AIHubCategoryId : "all";
  });
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (query.trim()) params.set("q", query.trim()); else params.delete("q");
    if (selected !== "all") params.set("category", selected); else params.delete("category");
    const value = params.toString();
    window.history.replaceState(window.history.state, "", value ? `${window.location.pathname}?${value}` : window.location.pathname);
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

  const categories = useMemo(() => filterAIHubCategories(DSAI_AI_HUB_CATEGORIES, query, selected), [selected, query]);
  const visibleCount = categories.reduce((sum, category) => sum + category.providers.length, 0);

  return <main className="min-h-screen bg-[#f5f8f5] text-[#1d3028]">
    <header className="sticky top-0 z-40 border-b border-[#e2e8e2] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/ai-hub" className="inline-flex items-center gap-2 font-semibold tracking-tight" aria-label="DSAI AI Hub">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#176b4b] text-sm font-bold text-white">D</span>
          <span>DSAI <span className="font-normal text-[#728078]">/ AI Hub</span></span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="DSAI">
          <span aria-current="page" className="rounded-full bg-[#eaf4ee] px-3 py-2 text-xs font-semibold text-[#176b4b]">AI Hub</span>
          <Link href="/workspace" className="rounded-full px-3 py-2 text-xs font-semibold text-[#52675a] hover:bg-[#f1f5f1] hover:text-[#176b4b]">Work Desk <ArrowUpRight size={13} className="ml-1 inline" /></Link>
        </nav>
      </div>
    </header>

    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
      <section className="rounded-2xl border border-[#e1e8e1] bg-white p-3 shadow-sm sm:p-4" aria-label="AI সেবা খুঁজুন">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">এআই সেবা খুঁজুন</span>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a988e]" aria-hidden="true" />
            <input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Escape") setQuery(""); }} placeholder="কী করতে চান? যেমন: ছবি তৈরি, research, coding…" className="h-12 w-full rounded-xl border border-[#e3eae3] bg-[#fbfdfb] pl-11 pr-11 text-sm outline-none transition focus:border-[#27805b] focus:ring-4 focus:ring-[#27805b]/10" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="সার্চ মুছুন" className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[#718078] hover:bg-[#edf3ee]"><X size={15} /></button>}
          </label>
          <select aria-label="ক্যাটাগরি নির্বাচন" value={selected} onChange={event => setSelected(event.target.value as AIHubCategoryId | "all")} className="h-12 rounded-xl border border-[#e1e8e1] bg-[#fbfdfb] px-4 text-sm text-[#52675a] outline-none focus:border-[#27805b]">
            <option value="all">সব বিভাগ</option>
            {DSAI_AI_HUB_CATEGORIES.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="বিভাগ">
          <button type="button" onClick={() => setSelected("all")} aria-pressed={selected === "all"} className={"min-h-9 shrink-0 rounded-full px-4 py-2 text-xs font-semibold " + (selected === "all" ? "bg-[#176b4b] text-white" : "border border-[#e1e8e1] bg-white text-[#64746a]")}>সব বিভাগ</button>
          {DSAI_AI_HUB_CATEGORIES.map((category, index) => {
            const Icon = icons[index] ?? Bot;
            return <button type="button" key={category.id} onClick={() => setSelected(category.id)} aria-pressed={selected === category.id} className={"inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium " + (selected === category.id ? "bg-[#176b4b] text-white" : "border border-[#e1e8e1] bg-white text-[#64746a]")}>
              <Icon size={13} aria-hidden="true" />{category.name}
            </button>;
          })}
        </div>
      </section>
      <p className="mt-3 text-xs leading-5 text-[#64746a]">DSAI-তে চালু সেবা Work Desk-এ নিজের সংযোগ দিয়ে ব্যবহার করুন; Gemini ব্যবহারের আগে সম্ভাব্য খরচে সম্মতি আবশ্যক। অন্য সেবাগুলো সংশ্লিষ্ট প্রতিষ্ঠানের অফিসিয়াল সাইটে ব্যবহার করুন।</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#718078]" aria-live="polite">
        <p><strong className="font-semibold text-[#314b3a]">{visibleCount.toLocaleString("bn-BD")}</strong>টি সেবা পাওয়া গেছে</p>
        {(query || selected !== "all") && <button type="button" onClick={() => { setQuery(""); setSelected("all"); }} className="min-h-9 rounded-full px-3 font-semibold text-[#176b4b] hover:bg-[#eaf4ee]">ফিল্টার মুছুন</button>}
      </div>

      <section className="mt-3 space-y-4" aria-label="এআই সেবা">
        {categories.length === 0 ? <div className="rounded-2xl border border-dashed border-[#d8e2d9] bg-white p-10 text-center" role="status">
          <Search className="mx-auto h-7 w-7 text-[#9aaa9f]" aria-hidden="true" />
          <h2 className="mt-3 font-semibold">কোনো সেবা পাওয়া যায়নি</h2>
          <button type="button" onClick={() => { setQuery(""); setSelected("all"); }} className="mt-3 min-h-10 rounded-full bg-[#176b4b] px-4 text-xs font-semibold text-white">সব সেবা দেখুন</button>
        </div> : categories.map(category => {
          const index = DSAI_AI_HUB_CATEGORIES.findIndex(item => item.id === category.id);
          const Icon = icons[index] ?? Bot;
          return <section key={category.id} className="overflow-hidden rounded-2xl border border-[#e1e8e1] bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-[#edf1ed] px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eaf4ee] text-[#176b4b]"><Icon size={18} aria-hidden="true" /></span>
                <div className="min-w-0"><h2 className="font-semibold text-[#263c30]">{category.name}</h2><p className="text-xs text-[#839087]">{category.description}</p></div>
              </div>
              <span className="shrink-0 rounded-full bg-[#f3f6f3] px-3 py-1 text-[10px] text-[#6e7d73]">{category.providers.length.toLocaleString("bn-BD")}টি</span>
            </div>
            <div className="grid gap-2 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-3">
              {category.providers.map(provider => {
                const active = connectorIds.has(provider.id);
                const referralUrl = buildProviderReferralUrl(provider);
                return <article key={provider.id} className="flex min-w-0 flex-col rounded-xl border border-[#e7ece7] bg-[#fcfdfc] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="min-w-0 text-sm font-semibold leading-5 text-[#2a4033]">{provider.name}</h3>
                    <span className={"shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold " + (active ? "bg-[#e5f4ea] text-[#236b42]" : "bg-[#f1f3f1] text-[#68766d]")}>{active ? "DSAI-তে চালু" : "শুধু তালিকায়"}</span>
                  </div>
                  <p className="mt-1 flex-1 text-xs leading-5 text-[#69786e]">{provider.purpose}</p>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-[#edf1ed] pt-2">
                    {referralUrl && <a href={referralUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-[#176b4b] px-3 text-[11px] font-semibold text-white hover:bg-[#10563b]">অফিসিয়াল সাইট <ArrowUpRight size={12} /></a>}
                    {active && <Link href="/workspace?panel=marketplace" className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#dce6dd] px-3 text-[11px] font-semibold text-[#52675a] hover:border-[#9bbca7]">DSAI-তে সংযোগ দিন <ArrowUpRight size={12} /></Link>}
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
