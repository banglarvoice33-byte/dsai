import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bot, ChevronRight, Globe2, HelpCircle, LockKeyhole, Search, X } from "lucide-react";
import { Link, useLocation } from "wouter";

type HelpItem = { title: string; answer: string; keywords: string; href?: string; label: string };

const helpItems: HelpItem[] = [
  { title: "DSAI কীভাবে ব্যবহার করব?", answer: "প্রয়োজনের পথ বেছে নিন, প্রশ্ন বা brief লিখুন, তারপর draft ও next step review করুন। UAA এবং Creative queue-তে human review ছাড়া high-risk action submit হয় না।", keywords: "how use dsai ব্যবহার শুরু workspace", href: "/workspace", label: "ওয়ার্কস্পেস" },
  { title: "কোন তথ্য শেয়ার করা উচিত নয়?", answer: "পাসওয়ার্ড, OTP, ব্যাংক-সংক্রান্ত তথ্য বা ব্যক্তিগত নথি chat বা public form-এ দেবেন না। DSAI কখনো আপনার পাসওয়ার্ড চাইবে না।", keywords: "password OTP bank privacy নিরাপত্তা", href: "/privacy", label: "তথ্যের সুরক্ষা" },
  { title: "৩ সেকেন্ডের agent কি live?", answer: "না। `/platform`-এ দেখানোটি configured provider-এর best-effort first-response target; calendar booking, messaging ও CRM adapter এখনো credentials, consent, webhook এবং staging gate-এর অপেক্ষায়।", keywords: "three second lead agent meeting booking 3 sec", href: "/platform", label: "Platform readiness" },
  { title: "Affiliate link কি live?", answer: "না। DSAI-তে এখন কোনো active affiliate URL বা payout system যুক্ত নেই। Partner program proposal আছে, কিন্তু payment connector, attribution ledger, refund/chargeback, KYC/KYB এবং disclosure review সম্পন্ন না হওয়া পর্যন্ত commission payable নয়।", keywords: "affiliate partner influencer referral commission link", href: "/platform", label: "Partner status" },
  { title: "ডেটা মুছব কীভাবে?", answer: "Privacy page-এ deletion request form ব্যবহার করুন। Scope ও identity confirmation দিলে operator review করে retention policy অনুযায়ী প্রক্রিয়া সম্পন্ন করবে।", keywords: "delete data privacy retention ডেটা মুছুন", href: "/privacy", label: "গোপনীয়তা" },
  { title: "সাহায্য না পেলে কী করব?", answer: "প্রথমে relevant Learn বা Evidence page দেখুন। উচ্চ-ঝুঁকির বিষয় হলে নিজে automated submission করবেন না; operator বা qualified professional-এর review নিন। যোগাযোগ: info@banglarvoice24news.com", keywords: "support contact help operator human review", href: "/evidence", label: "Human support" },
  { title: "DSAI কী?", answer: "DSAI হলো Bengali-first AI Workdesk—যেখানে জটিল brief, তথ্য, draft এবং পরবর্তী কাজকে reviewable Work Packet-এ সাজানো হয়। এটি সাধারণ chatbot-এর বিকল্প দাবি করে না; এর শক্তি হলো evidence, human approval, privacy-aware trace এবং সীমা স্পষ্ট রাখা।", keywords: "what is dsai about company platform ai workdesk বাংলা", href: "/learn", label: "DSAI পরিচিতি" },
  { title: "উদ্যোক্তা বা shareholder কেন আগ্রহী হবেন?", answer: "আগ্রহের ভিত্তি হওয়া উচিত যাচাইযোগ্য evidence: Bengali workflow quality, repeatable customer outcomes, retention, unit economics, provider costs, safety incidents এবং release-gate history। DSAI কোনো guaranteed return বা future valuation প্রতিশ্রুতি দেয় না।", keywords: "founder entrepreneur shareholder investor value business future সম্ভাবনা", href: "/evidence", label: "Value evidence" },
  { title: "Text-to-image বা video কি এখন live?", answer: "Creative Studio-তে text-to-image, text-to-video এবং image-to-video-এর preview-first planning, safety, rights, cost এবং provider-gate আছে। Real provider generation চালু বলতে sandbox credentials, quota, asset rights, output storage এবং human review gate verified হওয়া প্রয়োজন।", keywords: "text to image text to video image to video creative studio generation live", href: "/creative-studio", label: "Creative Studio" },
  { title: "CRM বা Calendar কী করতে পারে?", answer: "Read-only pilot discovery ও sync simulation আছে। Create, edit, send, invite, delete বা customer-data export defaultভাবে করা হয় না। Real provider use-এর আগে OAuth consent, least-privilege scope, callback verification, revoke test এবং preview-first approval প্রয়োজন।", keywords: "crm calendar integration sync read only oauth", href: "/integration-pilot", label: "Provider pilot" },
  { title: "ফাইল দিলে নিরাপত্তা কীভাবে থাকে?", answer: "Secure intake-এর নীতি হলো metadata-first handling, quarantine, malware verdict, retention policy, deletion tombstone, redacted traces এবং operator audit। বাস্তব scanner বা storage provider না থাকলে system blocked/preview state দেখাবে; clean verdict বানিয়ে দেখাবে না।", keywords: "file upload security malware scan retention deletion document", href: "/privacy", label: "Privacy & secure intake" },
];

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

export default function KnowledgeHelp() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<"bn" | "en">("bn");
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

  const toggleOpen = () => { setOpen(value => !value); setSelected(null); };

  return <>
    {!searchVisibleOnMobile && <button type="button" onClick={toggleOpen} aria-expanded={open} aria-controls="dsai-knowledge-help" aria-label={language === "bn" ? "DSAI জ্ঞান সহায়তা খুলুন" : "Open DSAI knowledge help"} className="knowledge-help-trigger fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#963a28] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(24,36,31,.22)] transition hover:bg-[#7e3023] focus:outline-none focus:ring-2 focus:ring-[#d7a34b] focus:ring-offset-2"><Bot className="h-4 w-4" /> {language === "bn" ? "সহায়তা" : "Help"}</button>}
    {open && <section id="dsai-knowledge-help" role="dialog" aria-modal="false" aria-labelledby="dsai-help-title" className="fixed bottom-20 right-5 z-50 flex max-h-[min(680px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden border border-[#18241f]/15 bg-[#f2eee4] text-[#18241f] shadow-[0_22px_70px_rgba(24,36,31,.28)]"><header className="flex items-start justify-between gap-4 border-b border-[#18241f]/15 bg-[#18241f] p-4 text-[#f2eee4]"><div><p className="text-[10px] uppercase tracking-[.22em] text-[#d7a34b]">DSAI / Knowledge Help</p><h2 id="dsai-help-title" className="mt-1 font-display text-2xl">দ্রুত উত্তর, নিরাপদ পথ</h2></div><button type="button" onClick={toggleOpen} aria-label={language === "bn" ? "সহায়তা বন্ধ করুন" : "Close help"} className="rounded-full p-1 text-[#f2eee4]/70 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button></header><div className="flex items-center justify-between gap-2 border-b border-[#18241f]/15 px-4 py-3"><label className="flex min-w-0 flex-1 items-center gap-2 border border-[#18241f]/15 bg-white/50 px-3 py-2"><Search className="h-4 w-4 shrink-0 text-[#963a28]" /><input value={query} onChange={event => { setQuery(event.target.value); setSelected(null); }} placeholder={language === "bn" ? "বাংলা, Banglish বা English-এ খুঁজুন" : "Search in Bengali, Banglish, or English"} aria-label={language === "bn" ? "সহায়তা খুঁজুন" : "Search help"} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#18241f]/45" /></label><button type="button" onClick={() => setLanguage(value => value === "bn" ? "en" : "bn")} aria-label="Toggle help language" className="inline-flex shrink-0 items-center gap-1 border border-[#18241f]/20 px-2 py-2 text-[10px] font-semibold"><Globe2 className="h-3.5 w-3.5" /> {language === "bn" ? "EN" : "BN"}</button></div><div className="overflow-y-auto p-3">{selected ? <div><button type="button" onClick={() => setSelected(null)} className="mb-4 inline-flex items-center gap-1 text-xs text-[#963a28]"><ArrowRight className="h-3 w-3 rotate-180" /> সব topic</button><p className="text-[10px] uppercase tracking-[.18em] text-[#963a28]">{selected.label}</p><h3 className="mt-2 font-display text-2xl">{selected.title}</h3><p className="mt-3 text-sm leading-7 text-[#18241f]/70">{selected.answer}</p>{selected.href && <Link href={selected.href} onClick={() => setOpen(false)} className="mt-5 inline-flex items-center gap-2 bg-[#963a28] px-4 py-2 text-sm font-semibold text-white">আরও দেখুন <ArrowRight className="h-4 w-4" /></Link>}</div> : <>{results.length === 0 ? <div className="px-3 py-8 text-center"><HelpCircle className="mx-auto h-6 w-6 text-[#963a28]" /><p className="mt-3 text-sm font-semibold">এই প্রশ্নের public answer এখনো নেই।</p><p className="mt-2 text-xs leading-5 text-[#18241f]/60">Learn, Evidence বা human support route দেখুন।</p><Link href="/learn" onClick={() => setOpen(false)} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#963a28]">Learn page খুলুন <ArrowRight className="h-3 w-3" /></Link></div> : <div className="space-y-2">{results.map(item => <button key={item.title} type="button" onClick={() => setSelected(item)} className="group flex w-full items-start gap-3 border border-[#18241f]/10 bg-white/45 p-3 text-left transition hover:border-[#c85a3f]/50 hover:bg-white/75"><HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#963a28]" /><span className="min-w-0"><span className="block text-sm font-semibold">{item.title}</span><span className="mt-1 block text-xs leading-5 text-[#18241f]/55">{item.label}</span></span><ChevronRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-[#18241f]/35 transition group-hover:translate-x-0.5" /></button>)}</div>}</>}</div><footer className="border-t border-[#18241f]/15 px-4 py-3 text-[10px] leading-5 text-[#18241f]/55"><LockKeyhole className="mr-1 inline h-3 w-3 text-[#963a28]" /> এই সহায়তা সাধারণ তথ্য দেয়। পাসওয়ার্ড, OTP বা ব্যক্তিগত নথি এখানে দেবেন না; আইন, চিকিৎসা বা অর্থের বিষয়ে বিশেষজ্ঞের পরামর্শ নিন।</footer></section>}
  </>;
}
