import { ArrowLeft, ArrowRight, CheckCircle2, Cloud, Clock3, CreditCard, Handshake, LockKeyhole, Scale, Server, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";

const hostingOptions = [
  { name: "AWS Lightsail", mode: "VPS / API", note: "Simple branded VPS bundle; adapter planned." },
  { name: "DigitalOcean", mode: "Droplet / resize", note: "API-driven compute and controlled resize; adapter planned." },
  { name: "Hetzner Cloud", mode: "Project API", note: "Project-scoped tokens and lifecycle API; adapter planned." },
  { name: "Vultr", mode: "Cloud Compute", note: "Global compute choices with plan-aware resize; adapter planned." },
  { name: "Akamai / Linode", mode: "API-first cloud", note: "Instance create and resize workflows; adapter planned." },
  { name: "Google Cloud", mode: "MIG autoscale", note: "Managed instance groups for policy-based scale; adapter planned." },
  { name: "Microsoft Azure", mode: "VM Scale Sets", note: "Load-balanced VM groups and autoscale; adapter planned." },
];

const stages = [
  ["01", "Lead received", "Signed event, consent, timezone and idempotency check."],
  ["02", "First response", "Best-effort p95 target under three seconds when providers are healthy."],
  ["03", "Meeting pending", "Calendar availability is checked asynchronously; no false booking claim."],
  ["04", "Human handoff", "Exceptions, high-risk cases and provider failures route to an operator."],
];

const premiumLayers = [
  ["01", "নিরাপদ intake", "File, text, voice এবং link গ্রহণের আগে type, size, malware, retention ও consent check."],
  ["02", "Work packet", "প্রতিটি কাজকে source, assumption, draft, uncertainty এবং next action-সহ সম্পাদনাযোগ্য packet-এ রূপান্তর."],
  ["03", "Bengali intelligence", "বাংলা, Banglish ও English intent, glossary এবং domain template—translation নয়, workflow context."],
  ["04", "Evidence layer", "Source snippet, citation state, confidence এবং unsupported claim flag—উত্তরের কারণ দেখা যায়."],
  ["05", "Human governance", "Review contract, approve/request-change/reject, audit event এবং high-risk action-এ reversible gate."],
  ["06", "Team control", "Role, consent, workspace sharing, notification এবং quota visibility—privacy default রেখে collaboration."],
  ["07", "Evaluation moat", "Outcome, correction, latency, safety এবং Bengali quality signal—sensitive content বাদ দিয়ে measurable learning loop."],
];

const aiRoles = [
  ["01", "Intent router", "বাংলা, Banglish ও English request-কে সঠিক Work Packet workflow-এ পাঠায়; অস্পষ্ট হলে clarifying question করে."],
  ["02", "Packet planner", "কাজকে scope, assumptions, next action ও review boundary-তে ভাঙে; user-এর হয়ে সিদ্ধান্ত নেয় না."],
  ["03", "Evidence assistant", "Source, citation state, uncertainty এবং unsupported claim flag দৃশ্যমান করে."],
  ["04", "Bengali normalizer", "ভাষা পাল্টায়, কিন্তু user-এর meaning, glossary ও tone হারায় না."],
  ["05", "Safety gatekeeper", "Privacy, consent, risky action, file status ও policy boundary যাচাই করে; প্রয়োজনে থামে."],
  ["06", "Reviewer copilot", "মানুষের review দ্রুত করে, approve বা external submit নিজে করে না."],
  ["07", "Evaluation analyst", "Correction, latency, source coverage ও Bengali quality signal থেকে উন্নতির backlog তৈরি করে."],
];

const operatingMilestones = [
  ["০–৯০ দিন", "Prove the loop", "১০০টি consented Work Packet, source coverage, review turnaround, export/delete success এবং mobile completion মাপুন."],
  ["৯০–১৮০ দিন", "Earn the wedge", "শিক্ষার্থী ও professional—দুটি narrow workflow-এ Bengali/Banglish quality, correction rate ও retention benchmark করুন."],
  ["৬–১২ মাস", "Scale carefully", "Team governance, paid tiers, provider adapters এবং controlled automation কেবল evidence ও rollback থাকলে চালু করুন."],
];

export default function Platform() {
  return (
    <main className="min-h-screen bg-[#f2eee4] text-[#18241f]">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between border-b border-[#18241f]/15 pb-5">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#18241f]/70 transition hover:text-[#c85a3f]"><ArrowLeft className="h-4 w-4" /> মূল সাইটে ফিরুন</Link>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#c85a3f]">DSAI / Platform Readiness</span>
        </header>

        <section className="grid gap-12 py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:py-24">
          <div><p className="text-xs uppercase tracking-[0.28em] text-[#c85a3f]">Service architecture / ০১</p><h1 className="mt-5 max-w-4xl font-display text-5xl leading-[.95] sm:text-7xl">প্রথম response দ্রুত হতে পারে।<br /><em className="text-[#c85a3f]">সত্য গোপন নয়।</em></h1><p className="mt-7 max-w-2xl text-lg leading-8 text-[#18241f]/70">DSAI-এর lead-agent, hosting এবং partner architecture কীভাবে বাস্তবে চালু হবে—কোন অংশ এখন foundation, কোন অংশ provider-gated, আর কোন অংশ human approval চায়—এই page-এ তা পরিষ্কারভাবে দেখুন।</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/workspace" className="inline-flex items-center gap-2 bg-[#c85a3f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b54d35]">Workspace খুলুন <ArrowRight className="h-4 w-4" /></Link><Link href="/method" className="inline-flex items-center gap-2 border border-[#18241f]/25 px-5 py-3 text-sm font-semibold transition hover:border-[#c85a3f]">আমাদের পদ্ধতি</Link></div></div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"><article className="border border-[#18241f]/15 bg-white/45 p-5"><Clock3 className="h-5 w-5 text-[#c85a3f]" /><p className="mt-5 text-2xl font-semibold">&lt; 3 sec*</p><p className="mt-1 text-sm text-[#18241f]/60">first-response target</p></article><article className="border border-[#18241f]/15 bg-white/45 p-5"><ShieldCheck className="h-5 w-5 text-[#d7a34b]" /><p className="mt-5 text-2xl font-semibold">Human-gated</p><p className="mt-1 text-sm text-[#18241f]/60">booking নয়, status সত্য</p></article><article className="border border-[#18241f]/15 bg-white/45 p-5"><Cloud className="h-5 w-5 text-[#18241f]" /><p className="mt-5 text-2xl font-semibold">7 providers</p><p className="mt-1 text-sm text-[#18241f]/60">adapter candidates</p></article></div>
        </section>

        <section className="border-y border-[#18241f]/15 py-12"><div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-xs uppercase tracking-[0.25em] text-[#c85a3f]">Lead agent / ০২</p><h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">৩ সেকেন্ড মানে কী?</h2><p className="mt-5 text-sm leading-7 text-[#18241f]/65">এটি best-effort first acknowledgement—নিশ্চিত meeting booking নয়। Valid consent, provider health, pre-approved message এবং tenant policy না থাকলে agent থামে বা human review-তে যায়।</p></div><div className="grid gap-3 sm:grid-cols-2">{stages.map(([number, title, body]) => <article key={number} className="border border-[#18241f]/15 bg-[#18241f]/[.03] p-5"><span className="text-xs text-[#c85a3f]">{number}</span><h3 className="mt-4 font-display text-2xl">{title}</h3><p className="mt-2 text-sm leading-6 text-[#18241f]/60">{body}</p></article>)}</div></div></section>

        <section className="py-16"><div className="flex flex-col gap-4 border-b border-[#18241f]/15 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs uppercase tracking-[0.25em] text-[#c85a3f]">Hosting adapters / ০৩</p><h2 className="mt-3 font-display text-4xl sm:text-5xl">নিজস্ব VPS নয়, প্রথমে নিরাপদ control plane</h2></div><p className="max-w-md text-sm leading-6 text-[#18241f]/60">প্রতিটি provider-এর account, token, billing, backup, abuse response এবং region policy আলাদা। Console-এ status আসবে; secret browser-এ আসবে না।</p></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{hostingOptions.map(option => <article key={option.name} className="border border-[#18241f]/15 bg-white/45 p-5"><div className="flex items-start justify-between gap-4"><Server className="h-5 w-5 text-[#c85a3f]" /><span className="text-[10px] uppercase tracking-[.16em] text-[#18241f]/45">planned</span></div><h3 className="mt-7 font-display text-2xl">{option.name}</h3><p className="mt-1 text-xs uppercase tracking-[.14em] text-[#d7a34b]">{option.mode}</p><p className="mt-4 text-sm leading-6 text-[#18241f]/60">{option.note}</p></article>)}</div><div className="mt-6 flex items-start gap-3 border-l-2 border-[#d7a34b] pl-4 text-sm leading-6 text-[#18241f]/60"><LockKeyhole className="mt-1 h-4 w-4 shrink-0 text-[#c85a3f]" />Manual resize, scheduled scale এবং policy-based autoscale—সব ক্ষেত্রেই cost preview, backup confirmation, idempotency, cooldown এবং emergency stop প্রয়োজন।</div></section>

        <section className="border-t border-[#18241f]/15 py-16" aria-labelledby="premium-layers-title"><div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-start"><div><p className="text-xs uppercase tracking-[0.25em] text-[#c85a3f]">Seven-layer workdesk / ০৪</p><h2 id="premium-layers-title" className="mt-3 font-display text-4xl leading-tight sm:text-5xl">আরও গভীর service quality—একটি স্তর নয়, একটি system</h2><p className="mt-5 text-sm leading-7 text-[#18241f]/65">DSAI-এর premium advantage কেবল সুন্দর landing page নয়। Intake থেকে evaluation পর্যন্ত প্রতিটি স্তর user control, evidence এবং Bengali workflow context-কে শক্ত করে।</p><div className="mt-7 border-l-2 border-[#d7a34b] pl-4 text-sm leading-6 text-[#18241f]/65"><strong className="text-[#18241f]">Implementation decision:</strong> full WebGL নয়; accessible DOM-first interface-এর উপর restrained spatial depth। এতে premium feel থাকে, কিন্তু low-network mobile, keyboard, screen reader ও reduced-motion user বাদ পড়ে না।</div></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" style={{ perspective: "1200px" }}>{premiumLayers.map(([number, title, body], index) => <article key={number} className="group border border-[#18241f]/15 bg-white/55 p-5 shadow-[0_14px_40px_rgba(24,36,31,0.06)] transition duration-200 hover:-translate-y-1 hover:border-[#c85a3f]/55 hover:shadow-[0_18px_44px_rgba(24,36,31,0.12)] motion-reduce:transform-none" style={{ transform: `translateZ(${(6 - index) * 4}px) rotateX(${index % 2 === 0 ? 0.4 : -0.4}deg)` }}><div className="flex items-start justify-between gap-4"><span className="text-xs font-semibold tracking-[0.2em] text-[#c85a3f]">{number}</span><ShieldCheck className="h-4 w-4 text-[#d7a34b]" aria-hidden="true" /></div><h3 className="mt-6 font-display text-2xl leading-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-[#18241f]/60">{body}</p></article>)}</div></div></section>

        <section className="border-t border-[#18241f]/15 py-16" aria-labelledby="ai-roles-title"><div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-start"><div><p className="text-xs uppercase tracking-[0.25em] text-[#c85a3f]">AI operating system / ০৫</p><h2 id="ai-roles-title" className="mt-3 font-display text-4xl leading-tight sm:text-5xl">AI শুধু উত্তর দেবে না—কাজের দায়িত্ব ভাগ করবে</h2><p className="mt-5 text-sm leading-7 text-[#18241f]/65">বিশ্বমানের architecture-এর মূল্য model count-এ নয়; কোন AI role কী করতে পারবে, কোথায় থামবে এবং মানুষ কীভাবে ফল যাচাই করবে—সেই control plane-এ।</p><div className="mt-7 border-l-2 border-[#d7a34b] pl-4 text-sm leading-6 text-[#18241f]/65"><strong className="text-[#18241f]">Operating rule:</strong> প্রতিটি role-এর visible status, bounded permission, fallback এবং measurable outcome থাকবে।</div></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{aiRoles.map(([number, title, body]) => <article key={number} className="border border-[#18241f]/15 bg-white/55 p-5 transition hover:-translate-y-1 hover:border-[#c85a3f]/55 motion-reduce:transform-none"><span className="text-xs font-semibold tracking-[0.2em] text-[#c85a3f]">{number}</span><h3 className="mt-5 font-display text-2xl leading-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-[#18241f]/60">{body}</p></article>)}</div></div></section>

        <section className="grid gap-8 border-t border-[#18241f]/15 py-16 lg:grid-cols-2"><article className="border border-[#18241f]/15 bg-white/45 p-7"><Handshake className="h-6 w-6 text-[#c85a3f]" /><p className="mt-6 text-xs uppercase tracking-[.25em] text-[#c85a3f]">Partner program / ০৪</p><h2 className="mt-3 font-display text-4xl">Influencer link থেকে স্বচ্ছ attribution</h2><p className="mt-4 text-sm leading-7 text-[#18241f]/65">প্রস্তাবিত model: প্রথম ১২ মাসে net collected subscription revenue-এর ২০% partner commission—refund, chargeback, tax, fraud review, KYC/KYB এবং payout hold-এর পরে। এটি এখন proposal, live payout নয়।</p><div className="mt-6 flex items-start gap-3 text-sm leading-6 text-[#18241f]/60"><CreditCard className="mt-1 h-4 w-4 shrink-0 text-[#d7a34b]" />Referral token, immutable ledger, refund adjustment এবং approved payout batch ছাড়া commission payable হবে না।</div></article>          <article className="border border-[#18241f]/15 bg-[#18241f] p-7 text-[#f2eee4]"><Sparkles className="h-6 w-6 text-[#d7a34b]" /><p className="mt-6 text-xs uppercase tracking-[.25em] text-[#d7a34b]">Launch gates / ০৬</p><h2 className="mt-3 font-display text-4xl">আগে প্রমাণ, পরে automation</h2><ul className="mt-5 space-y-3 text-sm leading-6 text-[#f2eee4]/70"><li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#d7a34b]" />Calendar ও messaging OAuth, consent, opt-out এবং webhook verification</li><li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#d7a34b]" />Payment, refund, chargeback, KYC/KYB এবং tax review</li><li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#d7a34b]" />Hosting adapter-এর dry-run, cost ceiling, backup, rollback ও abuse process</li></ul></article>        </section>

        <section className="border-t border-[#18241f]/15 py-16" aria-labelledby="milestones-title"><div className="flex flex-col gap-4 border-b border-[#18241f]/15 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs uppercase tracking-[0.25em] text-[#c85a3f]">Research to execution / ০৭</p><h2 id="milestones-title" className="mt-3 font-display text-4xl sm:text-5xl">আলোচনা নয়, measurable proof</h2></div><p className="max-w-md text-sm leading-6 text-[#18241f]/60">প্রতিটি milestone-এর আগে evidence, consent, rollback এবং user outcome থাকতে হবে।</p></div><div className="mt-7 grid gap-3 lg:grid-cols-3">{operatingMilestones.map(([window, title, body]) => <article key={window} className="border border-[#18241f]/15 bg-white/45 p-6"><span className="text-xs font-semibold tracking-[0.18em] text-[#c85a3f]">{window}</span><h3 className="mt-5 font-display text-3xl">{title}</h3><p className="mt-3 text-sm leading-6 text-[#18241f]/60">{body}</p></article>)}</div></section>

        <footer className="border-t border-[#18241f]/15 py-6 text-xs leading-6 text-[#18241f]/55">* Three-second target is a best-effort acknowledgement SLO under configured, healthy providers—not a guaranteed meeting-booking promise. <Link href="/privacy" className="underline underline-offset-4">Privacy policy</Link> · <Link href="/evidence" className="underline underline-offset-4">Evidence ledger</Link></footer>
      </div>
    </main>
  );
}
