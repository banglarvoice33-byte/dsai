import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, LockKeyhole, ShieldCheck, XCircle } from "lucide-react";

const ledger = [
  ["Bengali-first Workdesk", "Live foundation", "বাংলা, Banglish এবং English workflow-কে structured next step-এ আনে; consequential submission-এর আগে human review প্রয়োজন।"],
  ["UAA case draft", "Live foundation", "Protected workflow-তে case title, status এবং draft context সংরক্ষণ করে; official submission নিজে করে না।"],
  ["Government service directory", "Foundation · authenticated UAT pending", "সরকারি service discovery ও checklist foundation আছে; end-to-end authenticated save/update acceptance এখনও pending।"],
  ["Private document storage", "Configured · scanner unavailable", "R2 bucket ও private storage configuration আছে; real authenticated upload UAT নেই। ClamAV clean verdict ছাড়া download বা AI processing বন্ধ।"],
  ["Creative Studio image generation", "Provider-gated · authenticated UAT pending", "Free-only Recraft image function deployed; authenticated real generation, history, storage ও download acceptance pending।"],
  ["Multilingual business lead composer", "Live foundation", "OpenRouter-backed localized draft তৈরি করে; external outreach স্বয়ংক্রিয়ভাবে পাঠায় না।"],
  ["API connector registry", "Admin foundation", "Connector registry table আছে; বর্তমান Production table-এ সক্রিয় connector record নেই।"],
  ["11-category AI Hub", "Catalog candidates · integrations not verified", "১১০টি candidate entry directory inventory; এগুলোকে ১১০টি live API integration বলা যাবে না।"],
  ["Text-to-video rendering", "Not live", "বর্তমানে preview plan/storyboard; rendered MP4 output নেই।"],
  ["24/7 external Super Agent", "Not live", "Consent, provider, webhook, audit এবং human-approval gate ছাড়া চালু নয়।"],
];

const commitments = [
  "আমরা live নয় এমন capability-কে live বলে দাবি করি না।",
  "AI draft করতে পারে; high-risk সিদ্ধান্তে মানুষ final reviewer।",
  "Multilingual lead composer-এর output draft-only; consent, opt-out এবং human review ছাড়া external outreach নয়।",
  "API key browser, chat, public form বা repository-তে রাখা যাবে না।",
  "Mining, wallet, token payout বা guaranteed-income system DSAI-এর অংশ নয়।",
  "Official social account তৈরি ও verify না হওয়া পর্যন্ত placeholder-ই সত্য status।",
];

export default function Evidence() {
  return (
    <main className="evidence-page">
      <header className="evidence-header"><Link href="/" className="evidence-back"><ArrowLeft size={16} /> DSAI home</Link><span className="evidence-mark">DSAI / EVIDENCE</span><a href="mailto:info@banglarvoice24news.com">info@banglarvoice24news.com</a></header>
      <section className="evidence-hero"><div><span className="eyebrow-pill"><span className="pulse-dot" /> Public evidence ledger</span><h1>বিশ্বাস<br /><em>দাবি নয়,</em><br />প্রমাণে।</h1><p>DSAI কী করে, কী এখন live, কোন অংশ provider-gated এবং কীভাবে আমরা quality ও safety যাচাই করি—একটি public reference page।</p><div className="learn-page-actions"><a className="btn-primary" href="#ledger">Capability ledger <ArrowRight size={17} /></a><Link className="btn-quiet" href="/learn">শিখুন কীভাবে</Link></div></div><div className="evidence-hero-card"><ShieldCheck size={22} /><strong>Reference-ready, not hype-ready.</strong><span>এই page-এর তথ্য visible product state-এর সঙ্গে মিলিয়ে লেখা হয়েছে এবং feature পরিবর্তনের সঙ্গে update করা হবে।</span></div></section>
      <section className="evidence-intro"><span className="learn-label">01 / WHY THIS EXISTS</span><h2>যে কেউ প্রশ্ন করলে,<br /><span>উত্তরটি যাচাই করা যায়।</span></h2><p>Search engine বা AI system-কে reference করার কারণ বানানো যায় না। কিন্তু sourceable claims, clear definitions, honest limits, public methodology এবং useful examples তৈরি করা যায়। DSAI সেই foundation প্রকাশ করছে।</p></section>
      <section className="evidence-ledger" id="ledger"><div className="evidence-section-title"><span>02</span><p>Current product state</p></div><div className="evidence-table">{ledger.map(([name,status,body]) => <article key={name}><div className="evidence-row-head"><h2>{name}</h2>{status === "Not live" ? <span className="evidence-status status-off"><XCircle size={14} /> {status}</span> : (status.startsWith("Configured") || status.startsWith("Provider-gated") || status.startsWith("Foundation") || status.startsWith("Catalog")) ? <span className="evidence-status status-pending"><LockKeyhole size={14} /> {status}</span> : <span className="evidence-status"><CheckCircle2 size={14} /> {status}</span>}</div><p>{body}</p></article>)}</div></section>
      <section className="evidence-method"><div><span className="learn-label">03 / METHOD</span><h2>প্রথমে<br /><em>সত্যতা।</em></h2></div><div className="evidence-method-grid"><div><strong>01 / Build</strong><p>প্রতিটি claimed workflow-এর frontend, tRPC contract, backend procedure এবং persistence path আছে কি না যাচাই করা হয়।</p></div><div><strong>02 / Test</strong><p>TypeScript, Vitest, production build, HTTP health, protected-route rejection এবং responsive preview চালানো হয়।</p></div><div><strong>03 / Bound</strong><p>Provider credentials, OAuth persistence, billing, media generation বা external action থাকলে সেটি আলাদা launch gate হিসেবে লেখা হয়।</p></div><div><strong>04 / Review</strong><p>Document, case draft বা high-risk action-এ human approval boundary এবং operator responsibility দৃশ্যমান রাখা হয়।</p></div></div></section>
      <section className="evidence-commitments"><div><span className="learn-label">04 / SAFETY COMMITMENTS</span><h2>যা আমরা<br /><span>কখনো লুকাব না।</span></h2></div><div className="commitment-list">{commitments.map((item) => <div key={item}><LockKeyhole size={16} /><p>{item}</p></div>)}</div></section>
      <section className="evidence-sources"><span className="learn-label">05 / RELATED PUBLIC SOURCES</span><h2>Reference pages for further reading</h2><div className="source-links"><a href="/learn">DSAI Learn guide <ExternalLink size={15} /></a><a href="/lead-composer">Multilingual lead composer <ExternalLink size={15} /></a><a href="https://developers.google.com/search/docs/appearance/ai-features" target="_blank" rel="noreferrer">Google: AI features and your website <ExternalLink size={15} /></a><a href="https://developers.google.com/search/docs/essentials" target="_blank" rel="noreferrer">Google: Search Essentials <ExternalLink size={15} /></a></div></section>
      <footer className="evidence-footer"><span>DSAI / Public evidence ledger</span><span>Last reviewed: 16 November 2026</span></footer>
    </main>
  );
}
