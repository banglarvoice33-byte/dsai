/*
 * Civic Signal design reminder: editorial split layouts, Terracotta Signal accents,
 * Bengali-first copy, calm trust-building interactions, and no claims of crypto mining,
 * guaranteed income, unlimited generation, or professional replacement.
 */
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  FileText,
  Globe2,
  Headphones,
  LockKeyhole,
  Menu,
  PenLine,
  Play,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";

const heroImage = "/manus-storage/genesis-hero-editorial_d0136c82.jpg";
const accessImage = "/manus-storage/genesis-access-path_165e6c58.jpg";
const creativeImage = "/manus-storage/genesis-creative-studio_e9b3db5f.jpg";
const trustImage = "/manus-storage/genesis-trust-architecture_05b21895.jpg";
const emblem = "/manus-storage/genesis-emblem_10c5431a.png";

const navItems = [
  ["পথচিত্র", "#path"],
  ["কাজের ক্ষেত্র", "#workflows"],
  ["অর্থনীতি", "#economics"],
  ["বিশ্বাস", "#trust"],
];

const workflowItems = [
  { step: "01", title: "আনুন", en: "Bring it in", body: "কথা, ছবি, স্ক্যান বা ফর্ম—যে ভাষায় স্বচ্ছন্দ, সেই ভাষাতেই শুরু করুন।", icon: FileText },
  { step: "02", title: "বুঝুন", en: "Make it clear", body: "জটিল তথ্যকে সহজ ভাষা, checklist এবং পরবর্তী পদক্ষেপে ভেঙে দিন।", icon: Globe2 },
  { step: "03", title: "যাচাই করুন", en: "Review together", body: "উচ্চ-ঝুঁকির কাজ মানব পর্যালোচনায় যায়। AI draft করে, মানুষ সিদ্ধান্ত নেয়।", icon: ShieldCheck },
  { step: "04", title: "এগিয়ে যান", en: "Move forward", body: "প্রয়োজনীয় script, draft বা action plan হাতে নিয়ে বাস্তব কাজে ফিরুন।", icon: ArrowRight },
];

const faqItems = [
  { q: "GENESIS কি Bitcoin mining করে?", a: "না। GENESIS-এর MVP কোনো device-based cryptocurrency mining, crypto wallet বা earnings promise দেয় না। আমাদের ফোকাস মানুষের জন্য দরকারি access workflow এবং fair-use Creative Studio।" },
  { q: "UAA কি ডাক্তার বা আইনজীবীকে বদলে দেয়?", a: "না। UAA তথ্য বোঝা, checklist, draft ও প্রস্তুতিতে সাহায্য করে। চিকিৎসা, আইন, অভিবাসন বা সরকারি submission-এর মতো উচ্চ-ঝুঁকির কাজে মানব যাচাই বাধ্যতামূলক।" },
  { q: "Creative Studio-তে unlimited generation আছে?", a: "না। প্রত্যেক পরিকল্পনায় স্পষ্ট fair-use quota, queue priority এবং resource tier থাকে। আমরা সীমা লুকাই না—কারণ নির্ভরযোগ্য সেবা বাস্তব খরচের সঙ্গে সৎ থাকা থেকেই শুরু হয়।" },
  { q: "বাংলা কি সত্যিই first-class language?", a: "হ্যাঁ। বাংলা, ইংরেজি এবং Banglish-এর জন্য native UI, voice input, transliteration, glossary lock এবং আলাদা QA মানদণ্ড রাখা হয়েছে।" },
];

function SectionEyebrow({ index, children }: { index: string; children: string }) {
  return <div className="section-eyebrow"><span>{index}</span><i />{children}</div>;
}

function SignalMark({ small = false }: { small?: boolean }) {
  return <img src={emblem} alt="GENESIS emblem" className={small ? "h-8 w-8" : "h-11 w-11"} />;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [lang, setLang] = useState<"bn" | "en">("bn");

  const showComingSoon = () => toast("এই অংশটি পরবর্তী ধাপে আসছে — এখনই পরিকল্পনাটি দেখুন।");

  return (
    <div className="min-h-screen overflow-x-hidden bg-parchment text-ink">
      <div className="top-ribbon"><span>বাংলা প্রথম</span><span className="ribbon-dot" />Human-centred AI access for the real world<span className="ribbon-right">Open, fair-use, and explicit about limits.</span></div>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="GENESIS home"><SignalMark /><span>GENESIS</span></a>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <div className="header-actions">
            <button className="language-toggle" onClick={() => setLang(lang === "bn" ? "en" : "bn")} aria-label="Toggle language"><span className={lang === "bn" ? "active" : ""}>BN</span><span>/</span><span className={lang === "en" ? "active" : ""}>EN</span></button>
            <button className="header-cta" onClick={showComingSoon}>পরিকল্পনা দেখুন <ArrowRight size={15} /></button>
            <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
        {menuOpen && <div className="mobile-nav">{navItems.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}<button onClick={showComingSoon}>পরিকল্পনা দেখুন <ArrowRight size={15} /></button></div>}
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-image" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow-pill"><span className="pulse-dot" />Access · Create · Trust</div>
              <h1>AI যা আপনাকে <em>বাস্তব জগতে</em> এগিয়ে নেয়।</h1>
              <p className="hero-lead">ভাষা, ফর্ম, সৃজনশীলতা আর প্রক্রিয়ার জট খুলে—বাংলা প্রথম একটি শান্ত, স্বচ্ছ এবং মানুষের নিয়ন্ত্রণে থাকা AI platform।</p>
              <div className="hero-actions"><button className="btn-primary" onClick={() => document.getElementById("path")?.scrollIntoView({ behavior: "smooth" })}>পথচিত্র দেখুন <ArrowRight size={17} /></button><button className="btn-quiet" onClick={showComingSoon}><Play size={15} fill="currentColor" /> কীভাবে কাজ করে</button></div>
              <div className="hero-note"><LockKeyhole size={16} /><span>কোনো device mining নয়। কোনো guaranteed income নয়।<br /><b>সৎ সীমা দেখিয়েই সেবা তৈরি হয়।</b></span></div>
            </div>
            <div className="hero-visual" aria-label="GENESIS service map">
              <div className="map-caption"><span className="map-index">GENESIS / 01</span><span>একটি সিস্টেম, দুইটি পথ</span></div>
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
          <div className="container intro-layout"><div className="intro-side"><SectionEyebrow index="01">একটি প্ল্যাটফর্ম</SectionEyebrow><p>Everything you need to understand the next step.</p></div><div className="intro-main"><h2>মানুষের প্রয়োজনের পাশে <span>সৃষ্টির স্বাধীনতা।</span></h2><p>GENESIS দুটো জিনিসকে একসঙ্গে আনে—যে কাজগুলো মানুষকে বাস্তব জীবনে এগোতে সাহায্য করে, আর যে সৃষ্টিগুলো মানুষকে নিজের ভাষায় নিজেকে প্রকাশ করতে দেয়।</p><div className="intro-stamp"><span>BN</span><span>EN</span><span>AI</span><b>একসঙ্গে</b></div></div></div>
        </section>

        <section className="pathways-section" id="workflows">
          <div className="container"><div className="section-header"><div><SectionEyebrow index="02">কাজের ক্ষেত্র</SectionEyebrow><h2>দুটি পথ। <span>একই যত্ন।</span></h2></div><p>আপনার কাজের ধরন বদলালেও GENESIS-এর নীতি বদলায় না: স্পষ্টতা, মানব নিয়ন্ত্রণ এবং সৎ সীমা।</p></div>
            <div className="pathway-grid">
              <article className="pathway-card access-card"><div className="pathway-image" style={{ backgroundImage: `url(${accessImage})` }} /><div className="pathway-content"><div className="card-kicker"><span>01</span><span>UNIVERSAL ACCESS AGENT</span></div><h3>জটিল কাজকে<br /><em>সহজ পথে</em> আনুন।</h3><p>ফর্ম, নোটিশ, রিপোর্ট, আবেদন বা অন্য ভাষার তথ্য—UAA আপনাকে বুঝতে, সাজাতে এবং প্রস্তুত হতে সাহায্য করে।</p><div className="tag-row"><span>OCR + voice</span><span>বাংলা / English</span><span>Human review</span></div><button className="card-link" onClick={showComingSoon}>Access-এর পথ দেখুন <ArrowRight size={16} /></button></div></article>
              <article className="pathway-card creative-card"><div className="pathway-image" style={{ backgroundImage: `url(${creativeImage})` }} /><div className="pathway-content"><div className="card-kicker"><span>02</span><span>CREATIVE STUDIO</span></div><h3>ভাবনাকে <br /><em>দৃশ্যে</em> আনুন।</h3><p>বাংলা বা ইংরেজিতে text-to-image দিয়ে শুরু করুন। স্বচ্ছ fair-use quota, queue এবং provenance—কোনো লুকানো প্রতিশ্রুতি নয়।</p><div className="tag-row"><span>Text → image</span><span>Provenance</span><span>Fair-use</span></div><button className="card-link" onClick={showComingSoon}>Studio-এর পথ দেখুন <ArrowRight size={16} /></button></div></article>
            </div>
          </div>
        </section>

        <section className="workflow-section"><div className="container workflow-layout"><div className="workflow-heading"><SectionEyebrow index="03">কীভাবে কাজ করে</SectionEyebrow><h2>প্রতিটি<br /><span>পরবর্তী পদক্ষেপ</span><br />আরও পরিষ্কার।</h2><p>AI আপনার হয়ে সিদ্ধান্ত নেয় না। এটি আপনার সামনে পথটি স্পষ্ট করে—তারপর আপনি এগোন।</p></div><div className="workflow-list">{workflowItems.map(({ step, title, en, body, icon: Icon }, i) => <div className="workflow-row" key={step}><div className="workflow-number">{step}</div><div className="workflow-icon"><Icon size={18} /></div><div className="workflow-copy"><h3>{title} <small>{en}</small></h3><p>{body}</p></div><span className={`row-arrow ${i === 3 ? "last" : ""}`}><ArrowRight size={17} /></span></div>)}</div></div></section>

        <section className="economics-section" id="economics"><div className="container economics-layout"><div className="economics-main"><SectionEyebrow index="04">অর্থনীতি</SectionEyebrow><h2>সৃষ্টির মাধ্যমে<br /><em>অ্যাক্সেসকে</em> টিকিয়ে রাখি।</h2><p>Creative Studio-এর fair-use subscriptions, institutional packs এবং sponsored access—এই তিনটি পথ UAA-কে আরও মানুষের কাছে পৌঁছাতে সাহায্য করে। এখানে কোনো earnings promise নেই; মূল্য আসে দরকারি সেবা থেকে।</p><div className="economics-stats"><div><strong>FREE</strong><span>fair-use access</span></div><div><strong>PRO</strong><span>more creative room</span></div><div><strong>B2B</strong><span>schools & NGOs</span></div></div><button className="btn-primary" onClick={showComingSoon}>মূল্য পরিকল্পনা বুঝুন <ArrowRight size={17} /></button></div><div className="economics-visual"><div className="economics-orbit" /><div className="economics-card card-top"><WalletCards size={18} /><span>Revenue</span><strong>Creative Studio</strong></div><div className="economics-card card-bottom"><Headphones size={18} /><span>Reinvested in</span><strong>Human access</strong></div><div className="economics-line line-up" /><div className="economics-line line-down" /><div className="economics-center"><span>GENESIS</span><b>+</b></div></div></div></section>

        <section className="trust-section" id="trust"><div className="container"><div className="trust-top"><div><SectionEyebrow index="05">বিশ্বাসের স্থাপত্য</SectionEyebrow><h2>শুধু যা পারি,<br /><span>তাই বলি।</span></h2></div><p>সিস্টেমটি যেখানে অনিশ্চিত, সেখানে সেটি অনিশ্চয়তাই দেখায়। যেখানে মানুষের সিদ্ধান্ত দরকার, সেখানে মানুষই থাকে।</p></div><div className="trust-grid"><div className="trust-visual" style={{ backgroundImage: `url(${trustImage})` }}><div className="trust-overlay"><ShieldCheck size={22} /><span>Designed for<br /><b>responsible action</b></span></div></div><div className="trust-points"><div><span>01</span><div><h3>Human-in-the-loop</h3><p>উচ্চ-ঝুঁকির draft কখনো নিজে নিজে send বা submit হয় না।</p></div></div><div><span>02</span><div><h3>Memory with consent</h3><p>আপনার তথ্যের retention, export এবং forget-me পথ স্পষ্ট থাকে।</p></div></div><div><span>03</span><div><h3>Cost governor</h3><p>প্রতিটি tier-এর quota, queue এবং resource cost server-side নিয়ন্ত্রিত।</p></div></div><div><span>04</span><div><h3>Proof, not performance</h3><p>প্রতিটি creative output-এ tier disclosure ও provenance থাকে।</p></div></div></div></div></div></section>

        <section className="faq-section"><div className="container faq-layout"><div className="faq-heading"><SectionEyebrow index="06">সাধারণ প্রশ্ন</SectionEyebrow><h2>স্বচ্ছ থাকা<br /><span>জটিল নয়।</span></h2><p>প্রতিশ্রুতির আগে সীমাগুলো জানুন। এটাই GENESIS-এর শুরু।</p></div><div className="faq-list">{faqItems.map((item, i) => <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={item.q}><button onClick={() => setOpenFaq(openFaq === i ? null : i)}><span>{item.q}</span><ChevronDown size={18} /></button>{openFaq === i && <p>{item.a}</p>}</div>)}</div></div></section>

        <section className="final-cta"><div className="container final-cta-inner"><div className="final-mark"><SignalMark /></div><SectionEyebrow index="07">এখন শুরু করুন</SectionEyebrow><h2>আপনার পরবর্তী<br /><em>পদক্ষেপটি</em> কী?</h2><p>GENESIS এখনও তৈরি হচ্ছে—মানুষের বাস্তব প্রয়োজন, সৎ সীমা এবং মাপা অগ্রগতিকে সঙ্গে নিয়ে।</p><button className="btn-light" onClick={showComingSoon}>গবেষণার সঙ্গে থাকুন <ArrowRight size={17} /></button></div></section>
      </main>

      <footer className="site-footer"><div className="container footer-inner"><div className="brand footer-brand"><SignalMark small /><span>GENESIS</span></div><p>AI access for the real world.<br />বাস্তব জগতের জন্য মানুষের পাশে AI.</p><div className="footer-links"><a href="#path">Product</a><a href="#trust">Trust & safety</a><a href="#economics">Fair-use</a><button onClick={showComingSoon}>Contact</button></div><div className="footer-bottom"><span>© 2026 GENESIS Platform</span><span>Open · Bengali-first · Human-gated</span></div></div></footer>
    </div>
  );
}
