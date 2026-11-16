import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowUpRight, Bot, Braces, CheckCircle2, CircleHelp, Database, FileSearch, Image, Languages, Mic, Search, ShieldCheck, Workflow, Code2, Video } from "lucide-react";
import { DSAI_AI_HUB_CATEGORIES, type AIHubCategoryId, type IntegrationKind } from "@shared/aiHubCatalog";

const kindLabels: Record<IntegrationKind, string> = {
  "hosted-api": "Hosted API",
  framework: "Framework / SDK",
  "hosted-app": "Hosted application",
  "self-hosted": "Open-source / self-host",
  "search-api": "Search API",
  database: "Database extension",
};
const icons = [Bot, Braces, Image, Video, Mic, Code2, Search, Workflow, FileSearch, Languages, Database];

export default function AIHub() {
  const [selected, setSelected] = useState<AIHubCategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const categories = useMemo(() => DSAI_AI_HUB_CATEGORIES.map(category => ({
    ...category,
    providers: category.providers.filter(provider => !query.trim() || `${provider.name} ${provider.purpose} ${provider.integrationNote}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())),
  })).filter(category => (selected === "all" || category.id === selected) && category.providers.length > 0), [selected, query]);
  const providerCount = DSAI_AI_HUB_CATEGORIES.reduce((sum, category) => sum + category.providers.length, 0);
  const Icon = (id: string) => icons[DSAI_AI_HUB_CATEGORIES.findIndex(category => category.id === id)] ?? Bot;

  return <main className="min-h-screen bg-[#f4f1e9] text-[#18241f]">
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-8 lg:px-12">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#18241f]/15 pb-4">
        <Link href="/workspace" className="inline-flex items-center gap-2 text-sm text-[#18241f]/65 hover:text-[#963a28]"><ArrowLeft size={16}/> Workdesk</Link>
        <span className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#963a28]">DSAI / Central AI Hub</span>
        <span className="rounded-full border border-[#18241f]/20 px-3 py-1 text-xs">Free-first · paid by approval</span>
      </header>

      <section className="grid gap-8 py-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:py-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#963a28]">বাংলা নির্দেশনা → AI নির্বাচন → কাজ → ফলাফল</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[1.04] sm:text-6xl">এক জায়গায় <em className="text-[#963a28]">AI-এর বহু পথ</em>।</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#18241f]/70">আপনার কাজের ধরন অনুযায়ী সঠিক AI capability খুঁজুন। এখানে directory, framework, hosted app এবং API আলাদা করে দেখানো হয়—শুধু তালিকাভুক্ত থাকলেই কোনো service connected বা free হয়ে যায় না।</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/workspace" className="inline-flex items-center gap-2 bg-[#963a28] px-4 py-3 text-sm font-semibold text-white hover:bg-[#7e3023]">বাংলায় কাজ লিখুন <ArrowUpRight size={16}/></Link>
            <Link href="/capabilities" className="inline-flex items-center gap-2 border border-[#18241f]/20 px-4 py-3 text-sm font-semibold hover:border-[#963a28]">Readiness ledger</Link>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="border border-[#18241f]/15 bg-white/60 p-4"><strong className="block text-3xl">{DSAI_AI_HUB_CATEGORIES.length}</strong><span className="mt-1 block text-xs text-[#18241f]/60">ক্যাটাগরি</span></div>
          <div className="border border-[#18241f]/15 bg-white/60 p-4"><strong className="block text-3xl">{providerCount}</strong><span className="mt-1 block text-xs text-[#18241f]/60">directory entry</span></div>
          <div className="border border-[#18241f]/15 bg-white/60 p-4"><strong className="block text-3xl">0</strong><span className="mt-1 block text-xs text-[#18241f]/60">এই catalog থেকে live verified</span></div>
        </div>
      </section>

      <section className="border-y border-[#18241f]/15 py-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1"><span className="sr-only">Provider search</span><Search className="absolute left-3 top-3.5 h-4 w-4 text-[#18241f]/45"/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Provider, কাজ বা capability খুঁজুন…" className="w-full border border-[#18241f]/20 bg-white/70 py-3 pl-10 pr-3 text-sm outline-none focus:border-[#963a28]"/></label>
          <select aria-label="ক্যাটাগরি নির্বাচন" value={selected} onChange={event => setSelected(event.target.value as AIHubCategoryId | "all")} className="border border-[#18241f]/20 bg-white/70 px-3 py-3 text-sm"><option value="all">সব ১১টি ক্যাটাগরি</option>{DSAI_AI_HUB_CATEGORIES.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setSelected("all")} className={`border px-3 py-2 text-xs ${selected === "all" ? "border-[#963a28] bg-[#963a28] text-white" : "border-[#18241f]/20 bg-white/50"}`}>সব</button>
          {DSAI_AI_HUB_CATEGORIES.map((category, index) => {
            const CategoryIcon = icons[index] ?? CircleHelp;
            return <button type="button" key={category.id} onClick={() => setSelected(category.id)} className={`inline-flex items-center gap-1.5 border px-3 py-2 text-xs ${selected === category.id ? "border-[#963a28] bg-[#963a28] text-white" : "border-[#18241f]/20 bg-white/50"}`}><CategoryIcon size={13}/>{category.name}</button>;
          })}
        </div>
      </section>

      <section className="space-y-8 py-8">
        {categories.map(category => {
          const CategoryIcon = Icon(category.id);
          return <section key={category.id} className="border border-[#18241f]/15 bg-white/55 p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#18241f]/10 pb-4">
              <div className="flex items-start gap-3"><span className="flex h-10 w-10 items-center justify-center bg-[#963a28]/10 text-[#963a28]"><CategoryIcon size={20}/></span><div><h2 className="font-display text-2xl sm:text-3xl">{category.name}</h2><p className="mt-1 text-sm text-[#18241f]/60">{category.description}</p></div></div>
              <span className="border border-[#18241f]/15 px-3 py-1 text-xs">{category.providers.length}টি candidate</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {category.providers.map(provider => <article key={provider.id} className="border border-[#18241f]/10 bg-white/70 p-4">
                <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{provider.name}</h3><p className="mt-1 text-xs text-[#963a28]">{kindLabels[provider.kind]}</p></div><span title="এখনো এই catalog থেকে live API test করা হয়নি" className="inline-flex items-center gap-1 rounded-full border border-amber-700/25 bg-amber-50 px-2 py-1 text-[10px] text-amber-900"><CircleHelp size={11}/> Not verified</span></div>
                <p className="mt-3 text-sm leading-5 text-[#18241f]/75">{provider.purpose}</p>
                <p className="mt-2 text-xs leading-5 text-[#18241f]/55">{provider.integrationNote}</p>
              </article>)}
            </div>
          </section>;
        })}
      </section>

      <section className="grid gap-4 border-t border-[#18241f]/15 py-8 md:grid-cols-2">
        <article className="border border-[#18241f]/15 bg-[#18241f] p-6 text-[#f4f1e9]"><ShieldCheck size={22} className="text-[#d7a34b]"/><h2 className="mt-4 font-display text-2xl">Free-first, no surprise billing</h2><p className="mt-2 text-sm leading-6 text-white/65">প্রথমে যাচাইকৃত free quota; quota শেষ হলে stop বা অন্য eligible free provider। Paid model চালানোর আগে খরচ দেখিয়ে explicit approval নিতে হবে।</p></article>
        <article className="border border-[#18241f]/15 bg-white/70 p-6"><CheckCircle2 size={22} className="text-[#963a28]"/><h2 className="mt-4 font-display text-2xl">Production readiness gate</h2><p className="mt-2 text-sm leading-6 text-[#18241f]/65">Credential presence, official terms, successful API call, timeout/retry test, cost accounting, security review, Bengali benchmark এবং user acceptance—সব পাস না করলে Live verified হবে না।</p></article>
      </section>
      <footer className="border-t border-[#18241f]/15 py-5 text-xs leading-5 text-[#18241f]/50">Directory only: এখানে provider list দেখানো হয়েছে। কোনো provider-এর বর্তমান free tier, API entitlement, account access বা production connection এই page নিজে যাচাই করে না।</footer>
    </div>
  </main>;
}
