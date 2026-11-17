import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, LockKeyhole, Sparkles } from "lucide-react";

const guides = [
  {
    label: "০১ / শুরু করুন",
    title: "DSAI কী?",
    body: "DSAI বাংলা ভাষায় প্রশ্ন করতে, প্রয়োজনীয় তথ্য বুঝতে, লেখার খসড়া তৈরি করতে এবং কাজ গুছিয়ে নিতে সাহায্য করে।",
    points: ["নিজের ভাষায় প্রশ্ন লিখুন", "প্রয়োজন অনুযায়ী সেবা বেছে নিন", "উত্তর দেখে প্রয়োজনমতো পরিবর্তন করুন"],
  },
  {
    label: "০২ / ব্যবহার",
    title: "কীভাবে শুরু করবেন?",
    body: "আপনার প্রয়োজনের বিষয়টি বেছে নিন। প্রশ্ন বা কাজের বর্ণনা লিখে পাওয়া উত্তর দেখে পরবর্তী পদক্ষেপ ঠিক করুন।",
    points: ["প্রয়োজনটি সহজ ভাষায় লিখুন", "উত্তর বা খসড়া মনোযোগ দিয়ে পড়ুন", "গুরুত্বপূর্ণ তথ্য যাচাই করুন"],
  },
  {
    label: "০৩ / নথি",
    title: "ফাইল ব্যবহারে কী মনে রাখবেন?",
    body: "আপলোড করা ফাইলের নিরাপত্তা যাচাই সম্পন্ন না হওয়া পর্যন্ত সেটি খোলা বা ডাউনলোড করা যাবে না।",
    points: ["শুধু প্রয়োজনীয় নথি দিন", "পাসওয়ার্ড বা গোপন তথ্য দেবেন না", "যাচাই শেষ হওয়ার নির্দেশনা অনুসরণ করুন"],
  },
  {
    label: "০৪ / ছবি",
    title: "ছবি কীভাবে তৈরি করবেন?",
    body: "ছবির বর্ণনা লিখে আকার বেছে নিন। প্রতিদিন সর্বোচ্চ ২টি ছবি বিনামূল্যে তৈরি করতে পারবেন।",
    points: ["কী দেখতে চান তা লিখুন", "ছবির আকার বেছে নিন", "তৈরি ছবিটি দেখে সংরক্ষণ করুন"],
  },
  {
    label: "০৫ / যাচাই",
    title: "গুরুত্বপূর্ণ তথ্য কীভাবে যাচাই করবেন?",
    body: "এআই ভুল বা অসম্পূর্ণ তথ্য দিতে পারে। আইন, চিকিৎসা, অর্থ বা সরকারি বিষয়ে সিদ্ধান্ত নেওয়ার আগে নির্ভরযোগ্য উৎস মিলিয়ে নিন।",
    points: ["তথ্যের উৎস দেখুন", "প্রয়োজনে বিশেষজ্ঞের পরামর্শ নিন", "চূড়ান্ত সিদ্ধান্ত নিজে নিন"],
  },
  {
    label: "০৬ / নিরাপত্তা",
    title: "কোন তথ্য দেবেন না?",
    body: "পাসওয়ার্ড, OTP, ব্যাংক বা কার্ডের তথ্য, জাতীয় পরিচয়পত্র নম্বর এবং গোপন নথি চ্যাটে বা সাধারণ ফর্মে দেবেন না।",
    points: ["নিজের তথ্যের যত্ন নিন", "অন্যের ব্যক্তিগত তথ্য শেয়ার করবেন না", "অন্যের লেখা বা ছবি ব্যবহারের আগে অনুমতি নিন"],
  },
];

export default function Learn() {
  return (
    <main className="learn-page">
      <header className="learn-page-header">
        <Link href="/" className="learn-back"><ArrowLeft size={16} /> হোমে ফিরুন</Link>
        <span className="learn-page-mark">DSAI / নির্দেশিকা</span>
        <a className="learn-contact" href="mailto:info@banglarvoice24news.com">যোগাযোগ</a>
      </header>
      <section className="learn-page-hero">
        <div className="learn-page-hero-copy">
          <span className="eyebrow-pill"><span className="pulse-dot" /> সহজ ব্যবহার নির্দেশিকা</span>
          <h1>DSAI কীভাবে<br /><em>কাজে লাগে?</em></h1>
          <p>প্রশ্ন করা থেকে ফলাফল ব্যবহার পর্যন্ত প্রয়োজনীয় নির্দেশনা সহজ বাংলায় দেখুন।</p>
          <div className="learn-page-actions"><a className="btn-primary" href="#guides">নির্দেশিকা দেখুন <ArrowRight size={17} /></a><Link className="btn-quiet" href="/">মূল পেজে ফিরুন</Link></div>
        </div>
        <div className="learn-page-hero-note"><LockKeyhole size={20} /><strong>সিদ্ধান্ত আপনার।</strong><span>এআই সাহায্য করে; গুরুত্বপূর্ণ তথ্য যাচাই করে নিজের সিদ্ধান্ত নিন।</span></div>
      </section>
      <section className="learn-page-intro" id="guides">
        <div className="learn-page-section-label"><span>০১</span><p>প্রথমে যা জানা দরকার</p></div>
        <div><h2>সহজ নির্দেশনা<br /><span>কাজ শুরু করতে সাহায্য করে।</span></h2><p>আপনার প্রয়োজন অনুযায়ী নিচের বিষয়গুলো দেখুন।</p></div>
      </section>
      <section className="learn-guide-grid">
        {guides.map(guide => <article className="learn-guide-card" key={guide.label}><span className="learn-label">{guide.label}</span><h2>{guide.title}</h2><p>{guide.body}</p><ul>{guide.points.map(point => <li key={point}><CheckCircle2 size={15} />{point}</li>)}</ul></article>)}
      </section>
      <section className="learn-workflow-band">
        <div><span className="learn-label">সহজ তিন ধাপ</span><h2>বুঝুন,<br /><em>তৈরি করুন, যাচাই করুন।</em></h2></div>
        <div className="learn-workflow-steps"><div><FileText size={20} /><strong>বুঝুন</strong><span>প্রয়োজনীয় তথ্য গুছিয়ে নিন</span></div><div><Sparkles size={20} /><strong>তৈরি করুন</strong><span>উত্তর বা খসড়া তৈরি করুন</span></div><div><LockKeyhole size={20} /><strong>যাচাই করুন</strong><span>নিজে দেখে সিদ্ধান্ত নিন</span></div></div>
      </section>
      <section className="learn-page-cta">
        <p className="learn-label">এখন শুরু করুন</p><h2>আপনার কাজের<br /><span>পরবর্তী ধাপ বেছে নিন।</span></h2>
        <div className="learn-page-actions"><Link className="btn-primary" href="/workspace">কাজ শুরু করুন <ArrowRight size={17} /></Link><Link className="btn-quiet" href="/ai-hub">এআই সেবা খুঁজুন <ArrowRight size={15} /></Link></div>
      </section>
      <footer className="learn-page-footer"><span>DSAI / সহজ বাংলা নির্দেশিকা</span><span>স্বচ্ছ ব্যবহার · সচেতন সিদ্ধান্ত · নিরাপদ সহায়তা</span></footer>
    </main>
  );
}
