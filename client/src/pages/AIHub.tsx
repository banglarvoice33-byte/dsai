import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft, ArrowUpRight, Bot, Code2, FileSearch,
  Globe, Image, Languages, Mic, Music, Search, Video, Workflow,
} from "lucide-react";
import { buildProviderReferralUrl, DSAI_AI_HUB_CATEGORIES, type AIHubCategoryId } from "@shared/aiHubPublicCatalog";

const icons = [Bot, Bot, Image, Video, Mic, Music, Globe, Globe, Code2, Search, Workflow, FileSearch, Languages, FileSearch];
// These providers have a real user-owned API-key verification/setup flow.
// Only OpenRouter is currently wired into WorkDesk's durable text-task runtime.
const connectorSetupIds = new Set(["openrouter", "gemini", "openai", "xai"]);
const workDeskTaskProviderIds = new Set(["openrouter"]);

export default function AIHub() {
  const [selected, setSelected] = useState<AIHubCategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const categories = useMemo(() => DSAI_AI_HUB_CATEGORIES.map(category => ({
    ...category,
    providers: category.providers.filter(provider =>
      !query.trim() || `${provider.name} ${provider.purpose}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
    ),
  })).filter(category => (selected === "all" || category.id === selected) && category.providers.length > 0), [selected, query]);
  const providerCount = DSAI_AI_HUB_CATEGORIES.reduce((sum, category) => sum + category.providers.length, 0);

  return <main className="min-h-screen bg-[#f4f1e9] text-[#18241f]">
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-8 lg:px-12">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#18241f]/15 pb-4">
        <Link href="/workspace" className="inline-flex items-center gap-2 text-sm text-[#18241f]/65 hover:text-[#963a28]"><ArrowLeft size={16}/> কাজের জায়গা</Link>
        <span className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#963a28]">DSAI / এআই সেবা</span>
        <Link href="/workspace?panel=marketplace" className="rounded-md border border-[#18241f]/20 px-3 py-2 text-xs font-semibold text-[#18241f] hover:border-[#963a28]">Connector সেটআপ</Link>
        <Link href="/workspace" className="rounded-md bg-[#963a28] px-3 py-2 text-xs font-semibold text-white hover:bg-[#7e3023]">বাংলায় কাজ শুরু করুন</Link>
      </header>
      <section className="grid gap-8 py-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:py-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#963a28]">আপনার প্রয়োজন · আপনার পছন্দের এআই</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[1.04] sm:text-6xl">আপনার কাজের জন্য <em className="text-[#963a28]">সঠিক এআই</em> খুঁজুন।</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#18241f]/70">লেখা, ছবি, ভিডিও, ভয়েস, পড়াশোনা, গবেষণা ও দৈনন্দিন কাজের জন্য পছন্দের এআই সেবা সহজে খুঁজে নিন। ওয়েব অ্যাকাউন্টের ফ্রি ব্যবহার API credit-এর সমান নয়। OpenRouter বর্তমানে DSAI task runtime-এ ব্যবহারযোগ্য; Gemini, OpenAI ও xAI-তে key verify/save করা যায়, কিন্তু এগুলো এখনো DSAI task provider নয়।</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-[#18241f]/15 bg-white/60 p-4"><strong className="block text-3xl">{DSAI_AI_HUB_CATEGORIES.length}</strong><span className="mt-1 block text-xs text-[#18241f]/60">বিভাগ</span></div>
          <div className="border border-[#18241f]/15 bg-white/60 p-4"><strong className="block text-3xl">{providerCount}</strong><span className="mt-1 block text-xs text-[#18241f]/60">এআই সেবা</span></div>
        </div>
      </section>
      <section className="border-y border-[#18241f]/15 py-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1"><span className="sr-only">এআই সেবা খুঁজুন</span><Search className="absolute left-3 top-3.5 h-4 w-4 text-[#18241f]/45"/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="কোন এআই সেবা বা কাজ খুঁজছেন?" className="w-full border border-[#18241f]/20 bg-white/70 py-3 pl-10 pr-3 text-sm outline-none focus:border-[#963a28]"/></label>
          <select aria-label="ক্যাটাগরি নির্বাচন" value={selected} onChange={event => setSelected(event.target.value as AIHubCategoryId | "all")} className="border border-[#18241f]/20 bg-white/70 px-3 py-3 text-sm"><option value="all">সব বিভাগ</option>{DSAI_AI_HUB_CATEGORIES.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setSelected("all")} className={`border px-3 py-2 text-xs ${selected === "all" ? "border-[#963a28] bg-[#963a28] text-white" : "border-[#18241f]/20 bg-white/50"}`}>সব</button>
          {DSAI_AI_HUB_CATEGORIES.map(category => {
            const categoryIndex = DSAI_AI_HUB_CATEGORIES.findIndex(item => item.id === category.id);
            const CategoryIcon = icons[categoryIndex] ?? Bot;
            return <button type="button" key={category.id} onClick={() => setSelected(category.id)} className={`inline-flex items-center gap-1.5 border px-3 py-2 text-xs ${selected === category.id ? "border-[#963a28] bg-[#963a28] text-white" : "border-[#18241f]/20 bg-white/50"}`}><CategoryIcon size={13}/>{category.name}</button>;
          })}
        </div>
      </section>
      <section className="space-y-8 py-8" aria-label="এআই সেবার তালিকা">
        <p className="text-xs text-[#18241f]/55" aria-live="polite">{categories.reduce((total, category) => total + category.providers.length, 0)}টি সেবা</p>
        {categories.length === 0 ? <div className="border border-dashed border-[#18241f]/25 bg-white/60 p-8 text-center" role="status"><h2 className="font-display text-2xl">কোনো সেবা পাওয়া যায়নি</h2><p className="mt-2 text-sm text-[#18241f]/60">অন্য শব্দ দিয়ে খুঁজুন অথবা বিভাগ পরিবর্তন করুন।</p><button type="button" onClick={() => { setQuery(""); setSelected("all"); }} className="mt-4 inline-flex min-h-10 items-center justify-center bg-[#963a28] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7e3023]">আবার খুঁজুন</button></div> : categories.map(category => {
          const categoryIndex = DSAI_AI_HUB_CATEGORIES.findIndex(item => item.id === category.id);
            const CategoryIcon = icons[categoryIndex] ?? Bot;
          return <section key={category.id} className="border border-[#18241f]/15 bg-white/55 p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#18241f]/10 pb-4">
              <div className="flex items-start gap-3"><span className="flex h-10 w-10 items-center justify-center bg-[#963a28]/10 text-[#963a28]"><CategoryIcon size={20}/></span><div><h2 className="font-display text-2xl sm:text-3xl">{category.name}</h2><p className="mt-1 text-sm text-[#18241f]/60">{category.description}</p></div></div>
              <span className="border border-[#18241f]/15 px-3 py-1 text-xs">{category.providers.length}টি</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {category.providers.map(provider => <article key={provider.id} className="flex min-h-40 flex-col border border-[#18241f]/10 bg-white/70 p-4">
                <h3 className="font-semibold">{provider.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-5 text-[#18241f]/75">{provider.purpose}</p>
                {provider.officialUrl && <div className="mt-4 flex flex-wrap gap-2 border-t border-[#18241f]/10 pt-3"><a href={buildProviderReferralUrl(provider)} target="_blank" rel="noopener noreferrer" aria-label={`${provider.name} খুলুন (নতুন ট্যাবে)`} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#963a28] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#7e3023] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#963a28] focus-visible:ring-offset-2">ওয়েবসাইট খুলুন <ArrowUpRight size={14} aria-hidden="true"/></a>{connectorSetupIds.has(provider.id) && <><Link href="/workspace?panel=marketplace" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#18241f]/20 px-3 py-2 text-xs font-semibold text-[#18241f] hover:border-[#963a28]">DSAI Connector সেটআপ <ArrowUpRight size={13} aria-hidden="true"/></Link><span className="self-center text-[10px] leading-4 text-[#68766c]">{workDeskTaskProviderIds.has(provider.id) ? "DSAI task runtime: supported" : "API key verify/save only · DSAI task runtime নয়"}</span></>}</div>}
              </article>)}
            </div>
          </section>;
        })}
      </section>
    </div>
  </main>;
}
