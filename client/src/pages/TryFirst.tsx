import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, TimerReset } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const suggestions = [
  "একটি সরকারি ফর্ম বুঝে checklist বানাতে চাই",
  "আমার ছোট ব্যবসার জন্য বাংলা প্রচার brief তৈরি করতে চাই",
  "একটি রিপোর্টকে সহজ ভাষায় next step-এ ভাঙতে চাই",
];

export default function TryFirst() {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState<"bn" | "en">("bn");
  const preview = trpc.guestDemo.preview.useMutation();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt.trim() || preview.isPending) return;
    preview.mutate({ prompt, language });
  };

  const result = preview.data;

  return (
    <main className="min-h-screen bg-[#f2eee4] text-[#18241f]">
      <header className="border-b border-[#18241f]/10 bg-[#f2eee4]/90 px-5 py-5 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="font-display text-2xl tracking-[0.12em]">DSAI</Link>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/learn" className="rounded-full px-3 py-2 hover:bg-white/60">কীভাবে কাজ করে</Link>
            <Link href="/auth/login?returnTo=/workspace" className="rounded-full bg-[#963a28] px-4 py-2 font-semibold text-white hover:bg-[#7e3023]">Sign in</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:py-24">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#963a28]">DSAI / TRY FIRST</p>
          <h1 className="max-w-xl font-display text-5xl leading-[0.98] sm:text-7xl">কাগজপত্র নয়।<br /><em>আগে অনুভব করুন।</em></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#18241f]/70">Facebook বা অন্য জায়গা থেকে প্রথমবার এসেছেন? কোনো document, payment বা account ছাড়াই একটি ছোট Bengali-first work plan তৈরি করে দেখুন। এটি একটি local preview—কোনো provider call, file upload বা external action হয় না।</p>
          <div className="mt-8 grid gap-3 text-sm text-[#18241f]/75">
            <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 text-[#963a28]" /><span>প্রথমে basic workflow বুঝে নিন</span></div>
            <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-[#963a28]" /><span>কোনো API key, password বা sensitive data দেবেন না</span></div>
            <div className="flex items-start gap-3"><TimerReset className="mt-0.5 h-5 w-5 text-[#963a28]" /><span>প্রতি ১০ মিনিটে সর্বোচ্চ ৫টি guest preview</span></div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#18241f]/12 bg-white/75 p-5 shadow-[0_24px_70px_rgba(24,36,31,0.12)] sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#963a28]">LOCAL PREVIEW</p><h2 className="mt-2 font-display text-3xl">আপনার কাজটি লিখুন</h2></div>
            <Sparkles className="h-6 w-6 text-[#d7a34b]" />
          </div>
          <form onSubmit={submit}>
            <label htmlFor="try-first-prompt" className="text-sm font-semibold">আপনি কী করতে চান?</label>
            <textarea id="try-first-prompt" value={prompt} onChange={event => setPrompt(event.target.value.slice(0, 800))} placeholder="যেমন: আমার একটি সরকারি ফর্ম বুঝে checklist বানাতে হবে…" className="mt-3 min-h-36 w-full resize-y rounded-2xl border border-[#18241f]/15 bg-[#f9f7f1] p-4 leading-7 outline-none transition focus:border-[#c85a3f] focus:ring-2 focus:ring-[#c85a3f]/20" maxLength={800} />
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#18241f]/80"><span>{prompt.length}/৮০০</span><select aria-label="ভাষা" value={language} onChange={event => setLanguage(event.target.value as "bn" | "en")} className="rounded-lg border border-[#18241f]/15 bg-transparent px-2 py-1"><option value="bn">বাংলা</option><option value="en">English</option></select></div>
            <div className="mt-4 flex flex-wrap gap-2">{suggestions.map(item => <button key={item} type="button" onClick={() => setPrompt(item)} className="rounded-full border border-[#18241f]/15 px-3 py-2 text-left text-xs leading-5 hover:border-[#c85a3f] hover:text-[#963a28]">{item}</button>)}</div>
            <Button type="submit" disabled={!prompt.trim() || preview.isPending} className="mt-6 w-full bg-[#963a28] py-6 text-base hover:bg-[#7e3023]">{preview.isPending ? "Preview তৈরি হচ্ছে…" : "আমার preview দেখান"}<ArrowRight className="ml-2 h-4 w-4" /></Button>
          </form>

          {preview.error && <div role="alert" className="mt-6 rounded-2xl border border-red-700/20 bg-red-50 p-4 text-sm leading-6 text-red-900">Preview তৈরি করা যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।</div>}
          {result && <section aria-live="polite" className={`mt-6 rounded-2xl border p-5 ${result.status === "ready" ? "border-[#2f6653]/20 bg-[#edf5ef]" : "border-[#d7a34b]/35 bg-[#fff8e5]"}`}>
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#963a28]">{result.providerMode}</p><h3 className="mt-2 font-display text-2xl">{result.title}</h3></div><span className="rounded-full bg-white/70 px-3 py-1 text-xs">আরও {result.remaining}টি</span></div>
            <p className="mt-3 leading-7 text-[#18241f]/75">{result.summary}</p>
            {result.draft && <div className="mt-4 whitespace-pre-line rounded-xl bg-white/70 p-4 text-sm leading-7">{result.draft}</div>}
            {result.checklist.length > 0 && <div className="mt-4"><p className="text-sm font-semibold">পরবর্তী checklist</p><ol className="mt-2 space-y-2 text-sm leading-6">{result.checklist.map((item, index) => <li key={item}><span className="mr-2 text-[#963a28]">0{index + 1}</span>{item}</li>)}</ol></div>}
            {result.warnings.map(warning => <p key={warning} className="mt-4 border-l-2 border-[#d7a34b] pl-3 text-xs leading-6 text-[#18241f]/65">{warning}</p>)}
            {result.status === "ready" && <div className="mt-5 flex flex-col gap-2 sm:flex-row"><Link href="/auth/login?returnTo=/workspace" className="inline-flex items-center justify-center rounded-xl bg-[#18241f] px-4 py-3 text-sm font-semibold text-white">Workdesk-এ চালিয়ে যান <ArrowRight className="ml-2 h-4 w-4" /></Link><Link href="/scholarship" className="inline-flex items-center justify-center rounded-xl border border-[#18241f]/20 px-4 py-3 text-sm font-semibold">Student pilot দেখুন</Link></div>}
          </section>}
        </div>
      </section>

      <section className="border-t border-[#18241f]/10 bg-[#18241f] px-5 py-10 text-[#f2eee4] sm:px-8"><div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-[#d7a34b]">WHAT HAPPENS NEXT</p><p className="mt-2 max-w-2xl leading-7 text-[#f2eee4]/70">পছন্দ হলে sign in করে আপনার নিজের Workdesk খুলুন। Student Pro pilot-এর জন্য আলাদা eligibility ও manual review আছে—Try First ব্যবহার করতে তার প্রয়োজন নেই।</p></div><Link href="/scholarship" className="inline-flex items-center whitespace-nowrap rounded-xl bg-[#d7a34b] px-4 py-3 font-semibold text-[#18241f]">প্রথম ১০০ শিক্ষার্থী <ArrowRight className="ml-2 h-4 w-4" /></Link></div></section>
    </main>
  );
}
