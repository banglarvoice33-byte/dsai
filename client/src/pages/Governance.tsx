import { ArrowLeft, ArrowRight, FileCheck2, Fingerprint, Scale, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

const sections = [
  {
    title: "ব্র্যান্ড ও প্রতিষ্ঠানের পরিচয়",
    body: "DSAI হলো এই product-এর brand ও platform identity। প্রতিষ্ঠানের legal ownership, registered entity, beneficial ownership, shareholder rights, tax status এবং jurisdiction—এসব আলাদা corporate record-এর বিষয়; website copy বা AI-generated output এগুলোর legal substitute নয়। যে ব্যক্তি বা entity আইনগতভাবে DSAI পরিচালনা করে, তাকে official business record, domain account, repository access এবং provider billing account-এ consistent owner/admin হিসেবে রাখা হবে।",
  },
  {
    title: "Code ও system architecture authority",
    body: "Source code, database schema, deployment scripts, system architecture, product documentation এবং release decisions-এর authority repository access policy ও written contributor agreement দিয়ে নির্ধারিত হবে। Owner, technical administrator, deploy operator, reviewer এবং contributor-এর permission আলাদা রাখা উচিত। কোনো AI assistant বা generated patch নিজে ownership, authorship বা signing authority দাবি করে না; human owner/reviewer final approval দেন। বর্তমান package metadata-তে MIT license দেখা যাচ্ছে; তাই owner final license review না করা পর্যন্ত source-কে exclusive proprietary বলে প্রচার করা উচিত নয়।",
  },
  {
    title: "User input, work product ও AI-assisted output",
    body: "User-provided input ও customer data user/customer-এর applicable rights-এর অধীন থাকে। DSAI workflow-এ তৈরি draft, checklist বা creative brief ব্যবহার করার অধিকার contract, provider terms, third-party rights এবং applicable law-এর সঙ্গে মিলিয়ে নির্ধারণ করতে হবে। AI output সব jurisdiction-এ copyright-protected হবে—এমন নিশ্চয়তা দেওয়া যাবে না; human selection, arrangement, editing, source rights এবং provenance আলাদাভাবে review করতে হবে।",
  },
  {
    title: "Open-source ও third-party license",
    body: "DSAI-এর dependencies ও third-party assets তাদের নিজ নিজ license-এর অধীন। Release তৈরি করার আগে dependency inventory, SPDX/license notice, attribution, notice file এবং copyleft/reciprocal obligations যাচাই করতে হবে। কোনো dependency-কে শুধু package.json-এ থাকা দেখে commercial redistribution-safe ধরে নেওয়া যাবে না। User-uploaded media, font, model, stock asset, provider API এবং generated output-এর rights-ও আলাদাভাবে যাচাই করতে হবে।",
  },
  {
    title: "Terms, disclaimer ও high-risk boundary",
    body: "DSAI information preparation, structured drafting এবং human-reviewed next-step workflow-এ সহায়তা করে; এটি lawyer, doctor, accountant, government official বা investment adviser-এর বিকল্প নয়। DSAI guaranteed income, guaranteed lead conversion, guaranteed meeting, unlimited generation, legal compliance বা billion-dollar valuation promise করে না। External message, CRM write, calendar booking, payment, publication বা high-risk submission approval ছাড়া চালু করা যাবে না।",
  },
  {
    title: "Governance ও institutional controls",
    body: "Production authority বজায় রাখতে owner/admin MFA, least-privilege access, secret rotation, audit log, backup/restore drill, incident response, deletion handling, provider consent/revoke, release gate এবং rollback evidence দরকার। বর্তমান DSAI release-এ এই control contracts ও preview/admin surfaces আছে; বাস্তব VPS, corporate entity, legal review, provider consent, database backup এবং operational evidence আলাদাভাবে সম্পন্ন না হওয়া পর্যন্ত platform-কে live production verified বলা যাবে না।",
  },
];

export default function Governance() {
  return <main className="method-page">
    <header className="learn-page-header"><Link href="/" className="learn-back"><ArrowLeft size={16} /> DSAI home</Link><span className="learn-page-mark">DSAI / GOVERNANCE</span><a className="learn-contact" href="mailto:info@banglarvoice24news.com">info@banglarvoice24news.com</a></header>
    <section className="method-hero"><div><span className="eyebrow-pill"><span className="pulse-dot" />Ownership · Authority · Trust</span><h1>কে মালিক,<br /><em>কে অনুমোদন</em> দেন?</h1><p>DSAI-এর brand, code, architecture, user work, AI-assisted output এবং third-party rights এক জিনিস নয়। এই page ownership ও operational authority আলাদা করে ব্যাখ্যা করে, যাতে public promise বাস্তব control-এর সঙ্গে মেলে।</p><div className="learn-page-actions"><a className="btn-primary" href="#governance-sections">নীতি দেখুন <ArrowRight size={17} /></a><Link className="btn-quiet" href="/privacy">Privacy দেখুন</Link></div></div><aside className="method-hero-card"><Fingerprint size={22} /><span className="learn-label">NO HIDDEN AUTHORITY</span><strong>AI draft করতে পারে।<br />মানুষই অনুমোদন করেন।</strong><p>Owner, admin, contributor, provider এবং reviewer-এর authority আলাদা রাখা হয়।</p></aside></section>
    <section className="method-intro" id="governance-sections"><div className="learn-page-section-label"><span>01</span><p>প্রকাশ্য governance contract</p></div><div><h2>বিশ্বাসের আগে<br /><span>সীমানা স্পষ্ট।</span></h2><p>এই page legal advice নয়। এটি DSAI-এর public product boundary; jurisdiction-specific company formation, contract, tax, copyright, data protection এবং regulatory advice-এর জন্য qualified professional প্রয়োজন।</p></div></section>
    <section className="method-principles">{sections.map((section, index) => <article key={section.title}><span className="method-number">{String(index + 1).padStart(2, "0")}</span>{index === 0 ? <Scale size={21} /> : index === 1 ? <FileCheck2 size={21} /> : <ShieldCheck size={21} />}<h2>{section.title}</h2><p>{section.body}</p><span className="method-check"><ShieldCheck size={15} /> Public boundary</span></article>)}</section>
    <section className="method-roadmap"><div><span className="learn-label">02 / OWNER CHECKLIST</span><h2>ক্ষমতা নয় শুধু,<br /><em>প্রমাণও দরকার।</em></h2><p>একটি valuable institution-এর ভিত্তি hype নয়—নির্ভরযোগ্য workflow, rights hygiene, measurable outcomes, responsible governance এবং recoverable operations।</p></div><div className="method-roadmap-list"><div><Fingerprint size={18} /><strong>Owner</strong><span>legal ও account authority</span></div><div><FileCheck2 size={18} /><strong>Architect</strong><span>code ও release review</span></div><div><ShieldCheck size={18} /><strong>Operator</strong><span>secrets, provider ও incident control</span></div><div><Scale size={18} /><strong>Reviewer</strong><span>rights, policy ও high-risk approval</span></div></div></section>
    <section className="method-cta"><span className="learn-label">DSAI / HONEST STATUS</span><h2>ব্র্যান্ডের মূল্য<br /><em>প্রমাণে</em> বাড়ে।</h2><p>DSAI একটি billion-dollar valuation claim করছে না। Product value তৈরি হবে বাস্তব user outcome, retention, verified reliability, rights compliance, sustainable economics এবং customer trust দিয়ে—যা সময়ের সঙ্গে evidence দিয়ে মাপতে হবে।</p><div className="learn-page-actions"><Link className="btn-primary" href="/evidence">Capability evidence দেখুন <ArrowRight size={17} /></Link><Link className="btn-quiet" href="/changelog">Changelog</Link></div></section>
    <footer className="learn-page-footer"><span>DSAI / Governance & rights</span><span>Clear ownership · Human approval · No unsupported promises</span></footer>
  </main>;
}
