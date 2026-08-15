/*
 * DSAI design reminder: Bengali-first editorial layouts, a distinctive signal palette,
 * calm trust-building interactions, and no claims of crypto mining, guaranteed income,
 * unlimited generation, or professional replacement.
 */
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Facebook,
  Instagram,
  Linkedin,
  CircleHelp,
  FileText,
  Globe2,
  Headphones,
  LockKeyhole,
  Mail,
  Menu,
  PenLine,
  Play,
  ShieldCheck,
  Sparkles,
  Twitter,
  WalletCards,
  X,
  Youtube,
} from "lucide-react";

const heroImage = "/manus-storage/genesis-hero-editorial_d0136c82.jpg";
const accessImage = "/manus-storage/genesis-access-path_165e6c58.jpg";
const creativeImage = "/manus-storage/genesis-creative-studio_e9b3db5f.jpg";
const trustImage = "/manus-storage/genesis-trust-architecture_05b21895.jpg";
const emblem = "/manus-storage/genesis-emblem_10c5431a.png";

const socialItems = [
  { label: "Facebook", Icon: Facebook },
  { label: "Instagram", Icon: Instagram },
  { label: "LinkedIn", Icon: Linkedin },
  { label: "YouTube", Icon: Youtube },
  { label: "X", Icon: Twitter },
];

const navItems = [
  ["পথচিত্র", "#path"],
  ["কাজের ক্ষেত্র", "#workflows"],
  ["শিখুন", "#learn"],
  ["বিশ্বাস", "#trust"],
];

const workflowItems = [
  { step: "01", title: "আনুন", en: "Bring it in", body: "কথা, ছবি, স্ক্যান বা ফর্ম—যে ভাষায় স্বচ্ছন্দ, সেই ভাষাতেই শুরু করুন।", icon: FileText },
  { step: "02", title: "বুঝুন", en: "Make it clear", body: "জটিল তথ্যকে সহজ ভাষা, checklist এবং পরবর্তী পদক্ষেপে ভেঙে দিন।", icon: Globe2 },
  { step: "03", title: "যাচাই করুন", en: "Review together", body: "উচ্চ-ঝুঁকির কাজ মানব পর্যালোচনায় যায়। AI draft করে, মানুষ সিদ্ধান্ত নেয়।", icon: ShieldCheck },
  { step: "04", title: "এগিয়ে যান", en: "Move forward", body: "প্রয়োজনীয় script, draft বা action plan হাতে নিয়ে বাস্তব কাজে ফিরুন।", icon: ArrowRight },
];

const learnItems = [
  { title: "প্রথমে কী করব?", body: "পথচিত্র দেখুন, আপনার প্রয়োজনের পথ বেছে নিন, তারপর sign in করে UAA case draft বা Creative brief queue-তে দিন।", label: "START HERE" },
  { title: "DSAI কীভাবে কাজে লাগে?", body: "নোটিশ, রিপোর্ট, form বা brief-কে সহজ ভাষা, checklist এবং human-reviewed next step-এ সাজাতে ব্যবহার করুন।", label: "USE DSAI" },
  { title: "কেন DSAI বেছে নেব?", body: "বাংলা-first ব্যাখ্যা, bilingual workflow, safety boundary এবং provider না থাকলেও কাজ চালু রাখার স্বচ্ছ নকশার জন্য।", label: "WHY DSAI" },
  { title: "কোন কাজ এখনো নেই?", body: "Live image/video generation, external messaging, calendar booking, billing, OCR upload এবং automatic high-risk submission এখনো launch gate বা roadmap।", label: "KNOW THE LIMITS" },
];

const faqItems = [
  { q: "DSAI কি Bitcoin mining করে?", a: "না। DSAI-এর MVP কোনো device-based cryptocurrency mining, crypto wallet বা earnings promise দেয় না। আমাদের ফোকাস মানুষের জন্য দরকারি access workflow এবং fair-use Creative Studio।" },
  { q: "UAA কি ডাক্তার বা আইনজীবীকে বদলে দেয়?", a: "না। UAA তথ্য বোঝা, checklist, draft ও প্রস্তুতিতে সাহায্য করে। চিকিৎসা, আইন, অভিবাসন বা সরকারি submission-এর মতো উচ্চ-ঝুঁকির কাজে মানব যাচাই বাধ্যতামূলক।" },
  { q: "Creative Studio কি এখনই ছবি তৈরি করে?", a: "এখনকার preview-তে Creative Studio request queue-তে creative brief সংরক্ষণ করে। External image-generation provider, live quota, billing এবং output provenance এখনও আলাদা launch gate—তাই এগুলোকে চালু বলে দাবি করা হচ্ছে না।" },
  { q: "বাংলা কি সত্যিই first-class language?", a: "বর্তমান preview-তে Bengali-first UI, bilingual copy এবং BN/EN toggle আছে। Voice input, transliteration, glossary lock এবং পূর্ণ ভাষা-QA pipeline এখনও roadmap-এর অংশ—এগুলোকে সম্পূর্ণ চালু বলে দাবি করা হচ্ছে না।" },
];

function SectionEyebrow({ index, children }: { index: string; children: string }) {
  return <div className="section-eyebrow"><span>{index}</span><i />{children}</div>;
}

function SignalMark({ small = false }: { small?: boolean }) {
  return <img src={emblem} alt="DSAI emblem" className={small ? "h-8 w-8" : "h-11 w-11"} />;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const waitlistJoin = trpc.waitlist.join.useMutation();
  const accessCreate = trpc.access.create.useMutation();
  const creativeRequest = trpc.creative.request.useMutation();
  const accessCases = trpc.access.list.useQuery(undefined, { enabled: isAuthenticated });
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistInterest, setWaitlistInterest] = useState<"access" | "creative" | "both">("both");
  const [showAccessForm, setShowAccessForm] = useState(false);
  const [showCreativeForm, setShowCreativeForm] = useState(false);
  const [accessTitle, setAccessTitle] = useState("");
  const [creativePrompt, setCreativePrompt] = useState("");

  const showComingSoon = () => toast("এই অংশটি পরবর্তী ধাপে আসছে — এখনই পরিকল্পনাটি দেখুন।");
  const submitWaitlist = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    waitlistJoin.mutate({ email: waitlistEmail, interest: waitlistInterest, language: lang }, {
      onSuccess: () => { setWaitlistEmail(""); toast("আপনার আগ্রহ সংরক্ষণ করা হয়েছে। DSAI চালু হলে জানানো হবে।"); },
      onError: (error) => toast(error.message || "সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।"),
    });
  };
  const openAccessFlow = () => isAuthenticated ? setShowAccessForm(true) : startLogin();
  const openCreativeFlow = () => isAuthenticated ? setShowCreativeForm(true) : startLogin();
  const submitAccess = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    accessCreate.mutate({ title: accessTitle, workflow: "document", language: lang, riskLevel: "medium" }, {
      onSuccess: () => { setAccessTitle(""); setShowAccessForm(false); toast("UAA case draft তৈরি হয়েছে।"); accessCases.refetch(); },
      onError: (error) => toast(error.message || "UAA case তৈরি করা যায়নি।"),
    });
  };
  const submitCreative = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    creativeRequest.mutate({ prompt: creativePrompt, tier: "free" }, {
      onSuccess: () => { setCreativePrompt(""); setShowCreativeForm(false); toast("Creative request queue-তে যোগ হয়েছে।"); },
      onError: (error) => toast(error.message || "Creative request সংরক্ষণ করা যায়নি।"),
    });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-parchment text-ink">
      <div className="top-ribbon"><span>বাংলা প্রথম</span><span className="ribbon-dot" />Human-centred AI access for the real world<span className="ribbon-right">Open, fair-use, and explicit about limits.</span></div>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="DSAI home"><SignalMark /><span>DSAI</span></a>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <div className="header-actions">
            <button className="language-toggle" onClick={() => setLang(lang === "bn" ? "en" : "bn")} aria-label="Toggle language"><span className={lang === "bn" ? "active" : ""}>BN</span><span>/</span><span className={lang === "en" ? "active" : ""}>EN</span></button>
            <button className="header-cta" onClick={() => document.getElementById("join")?.scrollIntoView({ behavior: "smooth" })}>পরিকল্পনা দেখুন <ArrowRight size={15} /></button>
            <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
        {menuOpen && <div className="mobile-nav">{navItems.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}<button onClick={() => document.getElementById("join")?.scrollIntoView({ behavior: "smooth" })}>পরিকল্পনা দেখুন <ArrowRight size={15} /></button></div>}
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-image" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow-pill"><span className="pulse-dot" />Access · Create · Trust</div>
              <h1>জটিল তথ্য থেকে<br />দায়িত্বশীল কাজের<br /><em>পরবর্তী ধাপ</em>।</h1>
              <p className="hero-lead">বাংলা, Banglish এবং English-এ জটিল তথ্যকে checklist, draft এবং human-reviewed action pack-এ রূপান্তর করার Workdesk।</p>
              <div className="hero-actions"><button className="btn-primary" onClick={() => document.getElementById("path")?.scrollIntoView({ behavior: "smooth" })}>পথচিত্র দেখুন <ArrowRight size={17} /></button><button className="btn-quiet" onClick={() => document.getElementById("workflow")?.scrollIntoView({ behavior: "smooth" })}><Play size={15} fill="currentColor" /> কীভাবে কাজ করে</button></div>
              <div className="hero-note"><LockKeyhole size={16} /><span>কোনো device mining নয়। কোনো guaranteed income নয়।<br /><b>সৎ সীমা দেখিয়েই সেবা তৈরি হয়।</b></span></div>
            </div>
            <div className="hero-visual" aria-label="DSAI service map">
              <div className="map-caption"><span className="map-index">DSAI / 01</span><span>একটি সিস্টেম, দুইটি পথ</span></div>
              <div className="map-orbit orbit-one" /><div className="map-orbit orbit-two" />
              <div className="map-node node-origin"><span className="node-kicker">আপনার প্রয়োজন</span><strong>এক জায়গা থেকে<br />শুরু করুন</strong><span className="node-mark">↗</span></div>
              <div className="map-branch branch-access" /><div className="map-branch branch-create" />
              <div className="map-node node-access"><span className="node-kicker">01 / ACCESS</span><strong>বুঝুন<br />ও প্রস্তুত হন</strong><FileText size={19} /></div>
              <div className="map-node node-create"><span className="node-kicker">02 / CREATE</span><strong>ভাবুন<br />ও তৈরি করুন</strong><Sparkles size={19} /></div>
              <div className="map-footer"><span className="mini-line" />Human review when it matters</div>
            </div>
          </div>
          <div className="hero-bottom-label"><span>Scroll to explore</span><span className="scroll-arrow">↓</span></div>
        </section>

        <section className="intro-section" id="path">
          <div className="container intro-layout"><div className="intro-side"><SectionEyebrow index="01">একটি প্ল্যাটফর্ম</SectionEyebrow><p>Everything you need to understand the next step.</p></div><div className="intro-main"><h2>মানুষের প্রয়োজনের পাশে <span>সৃষ্টির স্বাধীনতা।</span></h2><p>DSAI দুটো জিনিসকে একসঙ্গে আনে—যে কাজগুলো মানুষকে বাস্তব জীবনে এগোতে সাহায্য করে, আর যে সৃষ্টিগুলো মানুষকে নিজের ভাষায় নিজেকে প্রকাশ করতে দেয়।</p><div className="intro-stamp"><span>BN</span><span>EN</span><span>AI</span><b>একসঙ্গে</b></div></div></div>
        </section>

        <section className="learn-section" id="learn"><div className="container learn-layout"><div className="learn-heading"><SectionEyebrow index="02A">DSAI শিখুন</SectionEyebrow><h2>প্রশ্ন থাকলে<br /><span>পথও থাকে।</span></h2><p>Google, ChatGPT বা বন্ধুর কাছ থেকে “DSAI কী?” শুনে এলে—এই চারটি উত্তর দিয়ে শুরু করুন।</p></div><div className="learn-grid">{learnItems.map((item) => <article className="learn-card" key={item.label}><span className="learn-label">{item.label}</span><h3>{item.title}</h3><p>{item.body}</p><a href="#join">নিজের পথে যান <ArrowRight size={15} /></a></article>)}</div></div></section>

        <section className="pathways-section" id="workflows">
          <div className="container"><div className="section-header"><div><SectionEyebrow index="02">কাজের ক্ষেত্র</SectionEyebrow><h2>দুটি পথ। <span>একই যত্ন।</span></h2></div><p>আপনার কাজের ধরন বদলালেও DSAI-এর নীতি বদলায় না: স্পষ্টতা, মানব নিয়ন্ত্রণ এবং সৎ সীমা।</p></div>
            <div className="pathway-grid">
              <article className="pathway-card access-card"><div className="pathway-image" style={{ backgroundImage: `url(${accessImage})` }} /><div className="pathway-content"><div className="card-kicker"><span>01</span><span>UNIVERSAL ACCESS AGENT</span></div><h3>জটিল কাজকে<br /><em>সহজ পথে</em> আনুন।</h3><p>ফর্ম, নোটিশ, রিপোর্ট, আবেদন বা অন্য ভাষার তথ্য—UAA আপনাকে বুঝতে, সাজাতে এবং প্রস্তুত হতে সাহায্য করে।</p><div className="tag-row"><span>Document intake</span><span>বাংলা / English</span><span>Human review</span></div><button className="card-link" onClick={openAccessFlow}>Access-এর পথ দেখুন <ArrowRight size={16} /></button></div></article>
              <article className="pathway-card creative-card"><div className="pathway-image" style={{ backgroundImage: `url(${creativeImage})` }} /><div className="pathway-content"><div className="card-kicker"><span>02</span><span>CREATIVE STUDIO</span></div><h3>ভাবনাকে <br /><em>দৃশ্যে</em> আনুন।</h3><p>বাংলা বা ইংরেজিতে creative brief দিয়ে শুরু করুন। বর্তমান preview request queue, fair-use policy ও provider boundary স্পষ্ট করে; live image generation এখনো আলাদা integration gate।</p><div className="tag-row"><span>Creative brief</span><span>Provider-ready</span><span>Fair-use policy</span></div><button className="card-link" onClick={openCreativeFlow}>Studio-এর পথ দেখুন <ArrowRight size={16} /></button></div></article>
            </div>
          </div>
        </section>
        {(showAccessForm || showCreativeForm) && <section className="flow-console"><div className="container flow-console-inner"><div><SectionEyebrow index="LIVE">আপনার workspace</SectionEyebrow><h2>{showAccessForm ? "UAA case-এর প্রথম খসড়া" : "Creative request-এর শুরু"}</h2><p>{showAccessForm ? "আপনার প্রয়োজনের একটি সংক্ষিপ্ত নাম দিন। এটি draft হিসেবে সংরক্ষিত থাকবে—কোনো external submission হবে না।" : "একটি ছোট prompt লিখুন। এটি fair-use queue-তে request হিসেবে সংরক্ষিত হবে; output generation এখনো আলাদা ধাপ।"}</p>{showAccessForm ? <form className="inline-flow-form" onSubmit={submitAccess}><label htmlFor="access-title">Case title</label><input id="access-title" required value={accessTitle} onChange={(event) => setAccessTitle(event.target.value)} placeholder="যেমন: সরকারি ফর্ম বুঝতে চাই" /><div className="form-actions"><button className="btn-primary" type="submit" disabled={accessCreate.isPending}>{accessCreate.isPending ? "সংরক্ষণ হচ্ছে…" : "Draft সংরক্ষণ করুন"}</button><button className="btn-quiet" type="button" onClick={() => setShowAccessForm(false)}>বন্ধ করুন</button></div></form> : <form className="inline-flow-form" onSubmit={submitCreative}><label htmlFor="creative-prompt">Creative prompt</label><textarea id="creative-prompt" required value={creativePrompt} onChange={(event) => setCreativePrompt(event.target.value)} placeholder="বাংলায় একটি editorial poster-এর ভাবনা লিখুন" rows={4} /><div className="form-actions"><button className="btn-primary" type="submit" disabled={creativeRequest.isPending}>{creativeRequest.isPending ? "Queue হচ্ছে…" : "Queue-তে দিন"}</button><button className="btn-quiet" type="button" onClick={() => setShowCreativeForm(false)}>বন্ধ করুন</button></div></form>}</div><aside className="flow-status"><span className="status-label">আপনার UAA cases</span>{!isAuthenticated ? <><strong className="status-text">Sign in required</strong><small>আপনার ব্যক্তিগত case দেখতে sign in করুন।</small></> : accessCases.isLoading ? <strong className="status-text">লোড হচ্ছে…</strong> : accessCases.isError ? <><strong className="status-text">লোড হয়নি</strong><small>আবার চেষ্টা করুন।</small></> : accessCases.data?.length ? <div className="case-list">{accessCases.data.map((item) => <div className="case-list-item" key={item.id}><strong>{item.title}</strong><span>{item.status} · {new Date(item.createdAt).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" })}</span></div>)}</div> : <><strong className="status-text">এখনও কোনো case নেই</strong><small>প্রথম draft তৈরি করতে Access-এর পথ বেছে নিন।</small></>}<small>human-gated · no auto-submit</small></aside></div></section>}

        <section className="workflow-section" id="workflow"><div className="container workflow-layout"><div className="workflow-heading"><SectionEyebrow index="03">কীভাবে কাজ করে</SectionEyebrow><h2>প্রতিটি<br /><span>পরবর্তী পদক্ষেপ</span><br />আরও পরিষ্কার।</h2><p>AI আপনার হয়ে সিদ্ধান্ত নেয় না। এটি আপনার সামনে পথটি স্পষ্ট করে—তারপর আপনি এগোন।</p></div><div className="workflow-list">{workflowItems.map(({ step, title, en, body, icon: Icon }, i) => <div className="workflow-row" key={step}><div className="workflow-number">{step}</div><div className="workflow-icon"><Icon size={18} /></div><div className="workflow-copy"><h3>{title} <small>{en}</small></h3><p>{body}</p></div><span className={`row-arrow ${i === 3 ? "last" : ""}`}><ArrowRight size={17} /></span></div>)}</div></div></section>

        <section className="economics-section" id="economics"><div className="container economics-layout"><div className="economics-main"><SectionEyebrow index="04">অর্থনীতি</SectionEyebrow><h2>সৃষ্টির মাধ্যমে<br /><em>অ্যাক্সেসকে</em> টিকিয়ে রাখি।</h2><p>Creative Studio-এর পরিকল্পিত fair-use subscriptions, institutional packs এবং sponsored access—এই সম্ভাব্য পথগুলো UAA-কে আরও মানুষের কাছে পৌঁছাতে সাহায্য করতে পারে। বর্তমান preview-তে billing বা sponsored access চালু নেই; মূল্য আসে দরকারি সেবা থেকে।</p><div className="economics-stats"><div><strong>FREE</strong><span>planned access tier</span></div><div><strong>PRO</strong><span>planned creative tier</span></div><div><strong>B2B</strong><span>planned institution tier</span></div></div><button className="btn-primary" onClick={showComingSoon}>মূল্য পরিকল্পনা বুঝুন <ArrowRight size={17} /></button></div><div className="economics-visual"><div className="economics-orbit" /><div className="economics-card card-top"><WalletCards size={18} /><span>Revenue</span><strong>Creative Studio</strong></div><div className="economics-card card-bottom"><Headphones size={18} /><span>Reinvested in</span><strong>Human access</strong></div><div className="economics-line line-up" /><div className="economics-line line-down" /><div className="economics-center"><span>DSAI</span><b>+</b></div></div></div></section>

        <section className="trust-section" id="trust"><div className="container"><div className="trust-top"><div><SectionEyebrow index="05">বিশ্বাসের স্থাপত্য</SectionEyebrow><h2>শুধু যা পারি,<br /><span>তাই বলি।</span></h2></div><p>সিস্টেমটি যেখানে অনিশ্চিত, সেখানে সেটি অনিশ্চয়তাই দেখায়। যেখানে মানুষের সিদ্ধান্ত দরকার, সেখানে মানুষই থাকে।</p></div><div className="trust-grid"><div className="trust-visual" style={{ backgroundImage: `url(${trustImage})` }}><div className="trust-overlay"><ShieldCheck size={22} /><span>Designed for<br /><b>responsible action</b></span></div></div><div className="trust-points"><div><span>01</span><div><h3>Human-in-the-loop</h3><p>উচ্চ-ঝুঁকির draft কখনো নিজে নিজে send বা submit হয় না।</p></div></div><div><span>02</span><div><h3>Memory with consent</h3><p>Retention, export এবং forget-me policy নকশার অংশ; বর্তমান preview-তে full document storage বা self-service deletion flow এখনো চালু হয়নি।</p></div></div><div><span>03</span><div><h3>Cost governor</h3><p>Quota, queue এবং resource cost-এর policy নকশা করা হয়েছে; live billing ও provider-backed quota এখনো চালু হয়নি।</p></div></div><div><span>04</span><div><h3>Proof, not performance</h3><p>Creative output provenance-এর নীতি নির্ধারিত; বর্তমান preview-তে output generation/provider সংযুক্ত না থাকায় live provenance record তৈরি হচ্ছে না।</p></div></div></div></div></div></section>

        <section className="faq-section"><div className="container faq-layout"><div className="faq-heading"><SectionEyebrow index="06">সাধারণ প্রশ্ন</SectionEyebrow><h2>স্বচ্ছ থাকা<br /><span>জটিল নয়।</span></h2><p>প্রতিশ্রুতির আগে সীমাগুলো জানুন। এটাই DSAI-এর শুরু।</p></div><div className="faq-list">{faqItems.map((item, i) => <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={item.q}><button onClick={() => setOpenFaq(openFaq === i ? null : i)}><span>{item.q}</span><ChevronDown size={18} /></button>{openFaq === i && <p>{item.a}</p>}</div>)}</div></div></section>

        <section className="final-cta" id="join"><div className="container final-cta-inner"><div className="final-mark"><SignalMark /></div><SectionEyebrow index="07">এখন শুরু করুন</SectionEyebrow><h2>আপনার পরবর্তী<br /><em>পদক্ষেপটি</em> কী?</h2><p>DSAI এখনও তৈরি হচ্ছে—মানুষের বাস্তব প্রয়োজন, সৎ সীমা এবং মাপা অগ্রগতিকে সঙ্গে নিয়ে। আপনার আগ্রহ সংরক্ষণ করুন অথবা ব্যক্তিগত workflow শুরু করতে sign in করুন।</p><div className="contact-note"><a href="mailto:info@banglarvoice24news.com"><Mail size={16} /> info@banglarvoice24news.com</a><span>Controlled test domain: dsai@banglarvoice24news.com</span></div><form className="waitlist-form" onSubmit={submitWaitlist}><label htmlFor="waitlist-email">আপনার email</label><div className="waitlist-fields"><input id="waitlist-email" type="email" required value={waitlistEmail} onChange={(event) => setWaitlistEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /><select value={waitlistInterest} onChange={(event) => setWaitlistInterest(event.target.value as typeof waitlistInterest)} aria-label="আপনার আগ্রহ"><option value="both">Access + Creative</option><option value="access">Universal Access</option><option value="creative">Creative Studio</option></select><button className="btn-light" type="submit" disabled={waitlistJoin.isPending}>{waitlistJoin.isPending ? "সংরক্ষণ হচ্ছে…" : "গবেষণার সঙ্গে থাকুন"} <ArrowRight size={17} /></button></div></form><div className="launch-actions"><span>নতুন বা returning user?</span><button className="btn-quiet light-quiet" type="button" onClick={() => isAuthenticated ? toast("আপনি ইতিমধ্যে signed in আছেন।") : startLogin()}>Sign in / create account <ArrowRight size={15} /></button></div></div></section>
      </main>

      <footer className="site-footer"><div className="container footer-inner"><div className="brand footer-brand"><SignalMark small /><span>DSAI</span></div><p>বাংলা-first AI Workdesk for real-world clarity.<br />বাস্তব কাজের জন্য মানুষের পাশে দায়িত্বশীল AI.</p><p className="social-note">Official social channels are not published yet.<br /><a href="mailto:info@banglarvoice24news.com">যোগাযোগ: info@banglarvoice24news.com</a></p><div className="social-placeholders" aria-label="DSAI social channels">{socialItems.map(({ label, Icon }) => <span className="social-placeholder" key={label}><button type="button" onClick={() => toast(`${label}: Coming soon — official account এখনও প্রকাশিত হয়নি।`)} aria-label={`${label} official account coming soon`}><Icon size={15} aria-hidden="true" /></button><span role="tooltip">Coming soon</span></span>)}</div><div className="footer-links"><a href="#path">Product</a><a href="#trust">Trust & safety</a><a href="#economics">Fair-use</a><a href="mailto:info@banglarvoice24news.com"><Mail size={14} /> Contact</a></div><div className="footer-bottom"><span>© 2026 DSAI Platform</span><span>Open · Bengali-first · Human-gated · DSAI</span></div></div></footer>
    </div>
  );
}
