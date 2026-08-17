import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, Code2, KeyRound, ServerCog, ShieldCheck } from "lucide-react";

const developerGuides = [
  {
    label: "01 / API SAFETY",
    title: "API key কোথায় রাখবেন?",
    body: "সাধারণ user-এর API key লাগে না। Provider connector বা Manus Built-in API চালু হলে key server-side secret manager বা protected .env.production-এ রাখুন।",
    points: ["Browser, chat বা public form-এ নয়", "Git repository বা screenshot-এ নয়", "প্রকাশ পেলে revoke ও rotate করুন"],
    icon: KeyRound,
  },
  {
    label: "02 / DEPLOYMENT",
    title: "এক কমান্ডে DSAI deploy",
    body: "VPS-এ protected production environment তৈরি করার পর deploy script dependency, build, port allocation, restart এবং health check চালায়।",
    points: ["node scripts/setup-vps-env.mjs", "node scripts/validate-production-env.mjs .env.production", "bash deploy-genesis.sh"],
    icon: ServerCog,
  },
  {
    label: "03 / AUTH & OAUTH",
    title: "OAuth ও callback কীভাবে কাজ করে?",
    body: "Login flow same-origin returnTo sanitization, one-time state/nonce এবং server session cookie ব্যবহার করে। External OAuth callback domain ও TLS ঠিকভাবে configured থাকতে হবে।",
    points: ["HTTPS callback domain প্রয়োজন", "External path redirect গ্রহণ করা হয় না", "Admin access role verification-এর পরে"],
    icon: ShieldCheck,
  },
  {
    label: "04 / CONNECTORS",
    title: "Provider connector কখন চালু করবেন?",
    body: "Admin connector registry secret value দেখায় না। Credential উপস্থিত, provider health check, consent, staging এবং human approval যাচাই না হওয়া পর্যন্ত safe fallback বজায় থাকে।",
    points: ["Manus Built-in API", "Twilio, Google Calendar, Cal.com, CRM", "Media worker আলাদা launch gate"],
    icon: Code2,
  },
];

export default function Developer() {
  return (
    <main className="learn-page developer-page">
      <header className="learn-page-header">
        <Link href="/" className="learn-back"><ArrowLeft size={16} /> DSAI home</Link>
        <span className="learn-page-mark">DSAI / DEVELOPER</span>
        <a className="learn-contact" href="mailto:info@banglarvoice24news.com">info@banglarvoice24news.com</a>
      </header>
      <section className="learn-page-hero">
        <div className="learn-page-hero-copy">
          <span className="eyebrow-pill"><span className="pulse-dot" /> technical field guide</span>
          <h1>DSAI <em>ডেভেলপার</em><br />কেন্দ্র।</h1>
          <p>API, deployment, OAuth, connector এবং production readiness-এর technical উত্তর—সাধারণ ব্যবহারকারীর Learn page থেকে আলাদা, পরিষ্কার এবং action-ready।</p>
          <div className="learn-page-actions"><a className="btn-primary" href="#developer-guides">Developer guides <ArrowRight size={17} /></a><Link className="btn-quiet" href="/learn">সাধারণ DSAI শিখুন</Link></div>
        </div>
        <div className="learn-page-hero-note"><ShieldCheck size={20} /><strong>Secrets stay server-side.</strong><span>এই পেজে কোনো credential value চাওয়া বা দেখানো হয় না।</span></div>
      </section>
      <section className="learn-page-intro" id="developer-guides">
        <div className="learn-page-section-label"><span>DEV</span><p>Technical পথচিত্র</p></div>
        <div><h2>Build, connect,<br /><span>verify—তারপর চালু করুন।</span></h2><p>Developer content implementation boundary ও current readiness স্পষ্ট রাখে। কোনো provider বা feature live না হলে এখানে তা live বলা হবে না।</p></div>
      </section>
      <section className="learn-guide-grid developer-guide-grid">
        {developerGuides.map(({ icon: Icon, ...guide }) => <article className="learn-guide-card" key={guide.label}><Icon className="mb-5 h-5 w-5 text-[#c85a3f]" /><span className="learn-label">{guide.label}</span><h2>{guide.title}</h2><p>{guide.body}</p><ul>{guide.points.map(point => <li key={point}><CheckCircle2 size={15} />{point}</li>)}</ul></article>)}
      </section>
      <section className="learn-workflow-band">
        <div><span className="learn-label">DSAI / OPERATOR ROUTES</span><h2>প্রয়োজনীয় console<br /><em>সঠিক gate-এর পরে</em>।</h2></div>
        <div className="learn-workflow-steps"><Link to="/platform"><ServerCog size={20} /><strong>Platform</strong><span>Provider readiness</span></Link><Link to="/admin/connectors"><KeyRound size={20} /><strong>Connectors</strong><span>Admin-only registry</span></Link><Link to="/evidence"><ShieldCheck size={20} /><strong>Evidence</strong><span>Live বনাম roadmap</span></Link></div>
      </section>
      <section className="learn-page-cta">
        <p className="learn-label">TECHNICAL NEXT STEP</p><h2>আপনার implementation<br /><span>সঠিক জায়গা থেকে শুরু করুন।</span></h2>
        <div className="learn-page-actions"><Link className="btn-primary" href="/platform">Platform readiness <ArrowRight size={17} /></Link><Link className="btn-quiet" href="/learn">User Learn page</Link></div>
      </section>
      <footer className="learn-page-footer"><span>DSAI / Developer field guide</span><span>Secrets stay private · Human review where it matters</span></footer>
    </main>
  );
}
