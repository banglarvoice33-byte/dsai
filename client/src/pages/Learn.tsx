import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, LockKeyhole, Sparkles } from "lucide-react";

const guides = [
  {
    label: "01 / START HERE",
    title: "DSAI কী এবং কার জন্য?",
    body: "DSAI হলো Bengali-first AI Workdesk—জটিল notice, report, form বা creative brief-কে বোঝা, সাজানো এবং human-reviewed next step-এ রূপান্তর করার workspace।",
    points: ["বাংলা, Banglish ও English workflow", "UAA case draft ও Creative brief queue", "High-risk সিদ্ধান্তে মানুষই final reviewer"],
  },
  {
    label: "02 / ACCESS",
    title: "কীভাবে DSAI ব্যবহার করবেন",
    body: "প্রথমে আপনার কাজের ধরন বেছে নিন। Public Learn content পড়ুন; protected case draft বা creative request-এর জন্য sign in করুন।",
    points: ["প্রয়োজনটি এক বাক্যে লিখুন", "প্রাসঙ্গিক pathway নির্বাচন করুন", "Draft দেখে সংশোধন ও human review করুন"],
  },
  {
    label: "03 / DOCUMENTS",
    title: "নথি কীভাবে রাখবেন?",
    body: "Workspace-এ sign in করে Documents tab খুলুন। PDF, DOCX, XLSX, CSV, TXT, JSON, JPG/PNG/WebP বা ZIP—সর্বোচ্চ ১০ MiB—private storage-এ upload, list, download ও delete করতে পারবেন।",
    points: ["ফাইলের status ও retention expiry দেখুন", "Uploaded file-এর default retention ৭ দিন", "Production-এ ClamAV scanner নেই; Validated মানে antivirus-clean নয়, OCR/Q&A-ও live নয়"],
  },
  {
    label: "04 / CREATIVE",
    title: "Creative Studio-তে ছবি তৈরি",
    body: "Creative Studio-তে বাংলা, Banglish বা English prompt লিখে image generation চেষ্টা করুন। সফলভাবে সংরক্ষিত ছবির private history ও download option থাকে।",
    points: ["প্রতিদিন account-প্রতি সর্বোচ্চ ২টি সফল image", "History refresh করে আগের ছবি দেখুন ও download করুন", "Provider unavailable হলে error দেখুন; generated image নিজে review করুন"],
  },
  {
    label: "05 / LIMITS",
    title: "Super Agent ও text-to-video কি live?",
    body: "না। বর্তমান DSAI foundation UAA draft, Creative brief queue ও connector registry দেয়। 24/7 external action agent এবং text-to-video এখনো provider, consent, worker, storage, moderation ও human-review gate।",
    points: ["No automatic high-risk submission", "No guaranteed income বা mining", "Feature live বলার আগে staging proof দরকার"],
  },
  {
    label: "06 / WHY DSAI",
    title: "কেন DSAI ব্যবহার করবেন?",
    body: "যখন language friction ও workflow ambiguity আপনার সময় নষ্ট করে, DSAI সেই কাজকে structured next step-এ আনে—সীমা লুকিয়ে নয়, সীমা দেখিয়েই।",
    points: ["Bengali-first clarity", "Reviewable drafts, not blind automation", "Provider-agnostic, lawful foundation"],
  },
];

export default function Learn() {
  return (
    <main className="learn-page">
      <header className="learn-page-header">
        <Link href="/" className="learn-back"><ArrowLeft size={16} /> DSAI home</Link>
        <span className="learn-page-mark">DSAI / LEARN</span>
        <a className="learn-contact" href="mailto:info@banglarvoice24news.com">info@banglarvoice24news.com</a>
      </header>
      <section className="learn-page-hero">
        <div className="learn-page-hero-copy">
          <span className="eyebrow-pill"><span className="pulse-dot" /> বাংলা-first field guide</span>
          <h1>DSAI কীভাবে<br /><em>বাস্তবে</em> কাজে লাগে?</h1>
          <p>প্রশ্ন, ব্যবহার, সীমা এবং DSAI-এর বাস্তব workflow—সাধারণ ব্যবহারকারীর জন্য এক জায়গায় পরিষ্কার উত্তর। Technical setup-এর জন্য Developer কেন্দ্র দেখুন।</p>
          <div className="learn-page-actions"><a className="btn-primary" href="#guides">পথচিত্র দেখুন <ArrowRight size={17} /></a><Link className="btn-quiet" href="/">মূল পেজে ফিরুন</Link></div>
        </div>
        <div className="learn-page-hero-note"><LockKeyhole size={20} /><strong>Trust is a feature.</strong><span>AI draft করে। মানুষ যাচাই করে। DSAI যা live নয়, তা live বলে না।</span></div>
      </section>
      <section className="learn-page-intro" id="guides">
        <div className="learn-page-section-label"><span>01</span><p>প্রথমে যা জানা দরকার</p></div>
        <div><h2>উত্তর সহজ হলে<br /><span>কাজ শুরু করা সহজ হয়।</span></h2><p>নিচের প্রতিটি guide বাস্তব user বা operator প্রশ্নের উত্তর। আপনার প্রয়োজন অনুযায়ী শুরু করুন; capability না থাকলে DSAI তা স্পষ্টভাবে জানাবে।</p></div>
      </section>
      <section className="learn-guide-grid">
        {guides.map((guide) => <article className="learn-guide-card" key={guide.label}><span className="learn-label">{guide.label}</span><h2>{guide.title}</h2><p>{guide.body}</p><ul>{guide.points.map((point) => <li key={point}><CheckCircle2 size={15} />{point}</li>)}</ul></article>)}
      </section>
      <section className="learn-workflow-band">
        <div><span className="learn-label">DSAI / WORKFLOW</span><h2>জটিল তথ্য থেকে<br /><em>দায়িত্বশীল next step</em>।</h2></div>
        <div className="learn-workflow-steps"><div><FileText size={20} /><strong>Understand</strong><span>তথ্যকে গুছিয়ে নিন</span></div><div><Sparkles size={20} /><strong>Draft</strong><span>প্রয়োজনীয় pack তৈরি করুন</span></div><div><LockKeyhole size={20} /><strong>Review</strong><span>মানুষের অনুমোদনে এগোন</span></div></div>
      </section>
      <section className="learn-page-cta">
        <p className="learn-label">READY WHEN YOU ARE</p><h2>আপনার কাজের<br /><span>পথটি খুঁজে নিন।</span></h2>
        <div className="learn-page-actions"><Link className="btn-primary" href="/#workflows">কাজের ক্ষেত্র দেখুন <ArrowRight size={17} /></Link><Link className="btn-quiet" href="/developer">ডেভেলপার কেন্দ্র <ArrowRight size={15} /></Link></div>
      </section>
      <footer className="learn-page-footer"><span>DSAI / Bengali-first AI Workdesk</span><span>© {new Date().getFullYear()} DSAI. Honest limits, human review.</span></footer>
    </main>
  );
}
