import { SUPPORT_EMAIL } from "@shared/const";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bot, ChevronRight, HelpCircle, LockKeyhole, Search, X } from "lucide-react";
import { Link, useLocation } from "wouter";

type HelpItem = { title: string; answer: string; keywords: string; href?: string; label: string };

const helpItems: HelpItem[] = [
  {
    title: "DSAI কী?",
    answer: "DSAI বাংলা ভাষায় বিভিন্ন কাজের জন্য প্রয়োজনীয় এআই সেবা খুঁজে নিতে, প্রশ্ন করতে এবং খসড়া তৈরি করতে সাহায্য করে। গুরুত্বপূর্ণ সিদ্ধান্তের আগে পাওয়া তথ্য যাচাই করুন।",
    keywords: "what is dsai পরিচিতি platform",
    href: "/learn",
    label: "পরিচিতি",
  },
  {
    title: "কীভাবে শুরু করব?",
    answer: "আপনার প্রয়োজনের বিষয়টি বেছে নিন, প্রশ্ন বা কাজের বর্ণনা লিখুন, তারপর পাওয়া উত্তর দেখে প্রয়োজনমতো পরিবর্তন করুন।",
    keywords: "how to start ব্যবহার শুরু workspace",
    href: "/workspace",
    label: "শুরু করুন",
  },
  {
    title: "কোন তথ্য শেয়ার করা উচিত নয়?",
    answer: "পাসওয়ার্ড, OTP, ব্যাংক বা কার্ডের তথ্য এবং ব্যক্তিগত নথি চ্যাট বা সাধারণ ফর্মে লিখবেন না। DSAI কখনো আপনার পাসওয়ার্ড চাইবে না।",
    keywords: "password OTP bank card privacy নিরাপত্তা",
    href: "/privacy",
    label: "তথ্যের সুরক্ষা",
  },
  {
    title: "ছবি তৈরি করতে পারব?",
    answer: "ছবির বর্ণনা লিখে আকার বেছে নিন। প্রতিদিন সর্বোচ্চ ২টি ছবি বিনামূল্যে তৈরি করতে পারবেন।",
    keywords: "image picture ছবি তৈরি creative studio",
    href: "/creative-studio",
    label: "ছবি তৈরি",
  },
  {
    title: "ফাইল আপলোড করলে কী হবে?",
    answer: "আপলোড করা ফাইলের নিরাপত্তা যাচাই সম্পন্ন না হওয়া পর্যন্ত সেটি খোলা বা ডাউনলোড করা যাবে না।",
    keywords: "file upload document নিরাপত্তা যাচাই",
    href: "/privacy",
    label: "ফাইলের নিরাপত্তা",
  },
  {
    title: "আমার তথ্য মুছতে চাই",
    answer: "গোপনীয়তা পাতায় গিয়ে তথ্য মুছে ফেলার অনুরোধ পাঠান। অনুরোধের অবস্থা সম্পর্কে প্রয়োজনীয় নির্দেশনা সেখানে পাবেন।",
    keywords: "delete data remove account privacy তথ্য মুছুন",
    href: "/privacy",
    label: "গোপনীয়তা",
  },
  {
    title: "এআই-এর উত্তর কি সবসময় সঠিক?",
    answer: "না। এআই ভুল বা অসম্পূর্ণ তথ্য দিতে পারে। চিকিৎসা, আইন, অর্থ বা জরুরি সিদ্ধান্তের আগে নির্ভরযোগ্য উৎস ও বিশেষজ্ঞের পরামর্শ নিন।",
    keywords: "accuracy ভুল তথ্য verify যাচাই",
    href: "/learn",
    label: "সঠিক তথ্য যাচাই",
  },
  {
    title: "আরও সাহায্য কোথায় পাব?",
    answer: `নির্দেশিকা দেখুন অথবা আমাদের সঙ্গে যোগাযোগ করুন: ${SUPPORT_EMAIL}`,
    keywords: "support contact help সহায়তা যোগাযোগ",
    href: "/contact",
    label: "যোগাযোগ",
  },
];

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

export default function KnowledgeHelp() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<HelpItem | null>(null);
  const [searchVisibleOnMobile, setSearchVisibleOnMobile] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia("(min-width: 761px)").matches) {
      const target = document.getElementById("dsai-home-search");
      if (!target) {
        setSearchVisibleOnMobile(false);
        return;
      }
      const observer = new IntersectionObserver(([entry]) => setSearchVisibleOnMobile(Boolean(entry?.isIntersecting)), { threshold: 0.01 });
      observer.observe(target);
      return () => observer.disconnect();
    }
    setSearchVisibleOnMobile(false);
  }, [location]);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return helpItems.slice(0, 4);
    return helpItems.filter(item => normalize(`${item.title} ${item.answer} ${item.keywords}`).includes(q));
  }, [query]);

  const toggleOpen = () => {
    setOpen(value => !value);
    setSelected(null);
  };

  return <>
    {!searchVisibleOnMobile && <button type="button" onClick={toggleOpen} aria-expanded={open} aria-controls="dsai-knowledge-help" aria-label="সহায়তা খুলুন" className="knowledge-help-trigger fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#963a28] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(24,36,31,.22)] transition hover:bg-[#7e3023] focus:outline-none focus:ring-2 focus:ring-[#d7a34b] focus:ring-offset-2"><Bot className="h-4 w-4" /> সহায়তা</button>}
    {open && <section id="dsai-knowledge-help" role="dialog" aria-modal="false" aria-labelledby="dsai-help-title" className="fixed bottom-20 right-5 z-50 flex max-h-[min(680px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden border border-[#18241f]/15 bg-[#f2eee4] text-[#18241f] shadow-[0_22px_70px_rgba(24,36,31,.28)]">
      <header className="flex items-start justify-between gap-4 border-b border-[#18241f]/15 bg-[#18241f] p-4 text-[#f2eee4]">
        <div><p className="text-[10px] uppercase tracking-[.22em] text-[#d7a34b]">DSAI / সহায়তা</p><h2 id="dsai-help-title" className="mt-1 font-display text-2xl">দ্রুত উত্তর</h2></div>
        <button type="button" onClick={toggleOpen} aria-label="সহায়তা বন্ধ করুন" className="rounded-full p-1 text-[#f2eee4]/70 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
      </header>
      <div className="border-b border-[#18241f]/15 px-4 py-3">
        <label className="flex min-w-0 items-center gap-2 border border-[#18241f]/15 bg-white/50 px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-[#963a28]" />
          <input value={query} onChange={event => { setQuery(event.target.value); setSelected(null); }} placeholder="বাংলা, বাংলিশ বা ইংরেজিতে খুঁজুন" aria-label="সহায়তা খুঁজুন" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#18241f]/45" />
        </label>
      </div>
      <div className="overflow-y-auto p-3">
        {selected ? <div>
          <button type="button" onClick={() => setSelected(null)} className="mb-4 inline-flex items-center gap-1 text-xs text-[#963a28]"><ArrowRight className="h-3 w-3 rotate-180" /> সব বিষয়</button>
          <p className="text-[10px] uppercase tracking-[.18em] text-[#963a28]">{selected.label}</p>
          <h3 className="mt-2 font-display text-2xl">{selected.title}</h3>
          <p className="mt-3 text-sm leading-7 text-[#18241f]/70">{selected.answer}</p>
          {selected.href && <Link href={selected.href} onClick={() => setOpen(false)} className="mt-5 inline-flex items-center gap-2 bg-[#963a28] px-4 py-2 text-sm font-semibold text-white">আরও দেখুন <ArrowRight className="h-4 w-4" /></Link>}
        </div> : results.length === 0 ? <div className="px-3 py-8 text-center">
          <HelpCircle className="mx-auto h-6 w-6 text-[#963a28]" />
          <p className="mt-3 text-sm font-semibold">এই প্রশ্নের উত্তর পাওয়া যায়নি।</p>
          <p className="mt-2 text-xs leading-5 text-[#18241f]/60">অন্যভাবে লিখে খুঁজুন অথবা নির্দেশিকা দেখুন।</p>
          <Link href="/learn" onClick={() => setOpen(false)} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#963a28]">নির্দেশিকা খুলুন <ArrowRight className="h-3 w-3" /></Link>
        </div> : <div className="space-y-2">
          {results.map(item => <button key={item.title} type="button" onClick={() => setSelected(item)} className="group flex w-full items-start gap-3 border border-[#18241f]/10 bg-white/45 p-3 text-left transition hover:border-[#c85a3f]/50 hover:bg-white/75">
            <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#963a28]" />
            <span className="min-w-0"><span className="block text-sm font-semibold">{item.title}</span><span className="mt-1 block text-xs leading-5 text-[#18241f]/55">{item.label}</span></span>
            <ChevronRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-[#18241f]/35 transition group-hover:translate-x-0.5" />
          </button>)}
        </div>}
      </div>
      <footer className="border-t border-[#18241f]/15 px-4 py-3 text-[10px] leading-5 text-[#18241f]/55"><LockKeyhole className="mr-1 inline h-3 w-3 text-[#963a28]" /> পাসওয়ার্ড, OTP বা ব্যক্তিগত নথি এখানে লিখবেন না। গুরুত্বপূর্ণ বিষয়ে বিশেষজ্ঞের পরামর্শ নিন।</footer>
    </section>}
  </>;
}
