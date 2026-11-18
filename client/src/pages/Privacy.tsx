import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const sections = [
  { title: "১. আমরা কী তথ্য সংগ্রহ করি", body: "আপনি অ্যাকাউন্ট খুললে আপনার ইমেইল ও প্রয়োজনীয় অ্যাকাউন্টের তথ্য নেওয়া হয়। আপনি যে প্রশ্ন, লেখা, ছবি বা নথি জমা দেন এবং যে ছবি তৈরি করেন, সেগুলোও আপনার চাওয়া সেবা দিতে প্রয়োজন অনুযায়ী সংরক্ষিত হতে পারে। নতুন সুবিধার খবর পেতে ইমেইল দিলে সেটিও যোগাযোগের জন্য রাখা হয়।" },
  { title: "২. তথ্য কেন ব্যবহার করি", body: "আপনাকে লগইন করতে, আপনার কাজ ও তৈরি ফলাফল সংরক্ষণ করতে, চাওয়া সুবিধা দিতে এবং সহায়তা করতে তথ্য ব্যবহার করা হয়। আপনার ব্যক্তিগত তথ্য বিজ্ঞাপনের জন্য বিক্রি করা হয় না।" },
  { title: "৩. এআই সেবা ব্যবহারের সময়", body: "এআই দিয়ে উত্তর বা ছবি তৈরি করতে আপনার দেওয়া লেখা বা নির্দেশনা প্রয়োজন অনুযায়ী বাইরের এআই সেবায় পাঠানো হতে পারে। সেই সেবার নিজস্ব গোপনীয়তা নীতি ও ব্যবহারের নিয়ম প্রযোজ্য হতে পারে। তাই পাসওয়ার্ড, OTP, ব্যাংক বা কার্ডের তথ্য, জাতীয় পরিচয়পত্র নম্বর কিংবা গোপন নথি জমা দেবেন না।" },
  { title: "৪. ফাইলের নিরাপত্তা", body: "আপলোড করা ফাইলের নিরাপত্তা যাচাই সম্পন্ন না হওয়া পর্যন্ত সেটি ব্যবহার বা ডাউনলোড করা যাবে না। যাচাইয়ের সুবিধা সাময়িকভাবে বন্ধ থাকলে ফাইলটি অপেক্ষায় থাকতে পারে।" },
  { title: "৫. তথ্য সংরক্ষণ ও মুছে ফেলা", body: "আপনার অ্যাকাউন্ট ও দেওয়া তথ্য সেবা চালানো, আপনার কাজ সংরক্ষণ এবং প্রয়োজনীয় সহায়তা দেওয়ার জন্য যতদিন দরকার রাখা হতে পারে। আপনি নিচের ফর্মে তথ্য মুছে ফেলার অনুরোধ পাঠাতে পারেন। পরিচয় যাচাই ও অনুরোধ পর্যালোচনার পর ব্যবস্থা নেওয়া হবে; অনুরোধ পাঠালেই তথ্য সঙ্গে সঙ্গে মুছে যায় না।" },
  { title: "৬. আপনার দায়িত্ব", body: "নিজের বা অন্য কারও অপ্রয়োজনীয় ব্যক্তিগত তথ্য দেবেন না। এআই-এর উত্তর ভুল বা অসম্পূর্ণ হতে পারে—আইন, চিকিৎসা, অর্থ বা সরকারি বিষয়ে গুরুত্বপূর্ণ সিদ্ধান্তের আগে নির্ভরযোগ্য উৎস থেকে যাচাই করুন। অন্যের ছবি, লেখা বা নথি ব্যবহারের আগে প্রয়োজনীয় অনুমতি নিন।" },
  { title: "৭. নীতি পরিবর্তন ও যোগাযোগ", body: "সেবায় পরিবর্তন বা প্রযোজ্য নিয়মের কারণে এই নীতি হালনাগাদ হতে পারে। কোনো প্রশ্ন বা তথ্য মুছে ফেলার অনুরোধের জন্য লিখুন: info@banglarvoice24news.com।" },
];

export default function Privacy() {
  const [email, setEmail] = useState("");
  const [scope, setScope] = useState<"account" | "all_data" | "question">("account");
  const [details, setDetails] = useState("");
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const deletion = trpc.privacy.requestDeletion.useMutation({
    onSuccess: () => {
      toast.success("আপনার অনুরোধ গ্রহণ করা হয়েছে। পরিচয় যাচাইয়ের পর প্রয়োজনীয় ব্যবস্থা নেওয়া হবে।");
      setEmail(""); setDetails(""); setIdentityConfirmed(false);
    },
    onError: () => toast.error("অনুরোধ পাঠানো যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।"),
  });
  const submitDeletion = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    deletion.mutate({ email, scope, details: details || undefined, identityConfirmed: true });
  };

  return <main className="policy-page">
    <header className="policy-header">
      <Link href="/" className="policy-back"><ArrowLeft size={16} /> হোমে ফিরুন</Link>
      <span>DSAI / গোপনীয়তা</span>
      <a href="mailto:info@banglarvoice24news.com">যোগাযোগ</a>
    </header>
    <section className="policy-hero">
      <ShieldCheck size={28} />
      <p className="learn-label">আপনার তথ্যের সুরক্ষা</p>
      <h1>আপনার তথ্যের<br /><em>যত্ন</em> আমাদের দায়িত্ব।</h1>
      <p className="policy-lead">DSAI-তে কী তথ্য নেওয়া হয়, কেন ব্যবহার করা হয় এবং কীভাবে মুছে ফেলার অনুরোধ করবেন—এই পাতায় সহজ ভাষায় জানুন।</p>
      <div className="policy-meta">সর্বশেষ হালনাগাদ: ১৭ নভেম্বর ২০২৬</div>
    </section>
    <section className="policy-body">
      <aside className="policy-side-card">
        <p className="learn-label">DSAI / গোপনীয়তা</p>
        <p>আপনার তথ্য সম্পর্কে সচেতন সিদ্ধান্ত নিন।</p>
        <Link href="/governance">নিরাপদ ব্যবহারের নিয়ম দেখুন →</Link>
      </aside>
      <div className="policy-sections">
        {sections.map(section => <section key={section.title}><h2>{section.title}</h2><p>{section.body}</p></section>)}
        <section className="deletion-request-card" id="deletion-request">
          <div className="deletion-request-heading">
            <div><p className="learn-label">আপনার তথ্যের অধিকার</p><h2>তথ্য মুছে ফেলার অনুরোধ</h2><p>আপনার অ্যাকাউন্টের ইমেইল দিয়ে অনুরোধ পাঠান। পরিচয় যাচাই ও পর্যালোচনার পর আমরা ব্যবস্থা নেব; ফর্ম পাঠালেই তথ্য সঙ্গে সঙ্গে মুছে যায় না।</p></div>
            <ShieldCheck size={24} />
          </div>
          <form className="deletion-request-form" onSubmit={submitDeletion}>
            <label>ইমেইল ঠিকানা<input type="email" required maxLength={320} value={email} onChange={event => setEmail(event.target.value)} placeholder="আপনার ইমেইল ঠিকানা" autoComplete="email" /></label>
            <label>অনুরোধের ধরন<select value={scope} onChange={event => setScope(event.target.value as typeof scope)}><option value="account">আমার অ্যাকাউন্টের তথ্য</option><option value="all_data">আমার সব তথ্য</option><option value="question">গোপনীয়তা বিষয়ে প্রশ্ন</option></select></label>
            <label>অতিরিক্ত তথ্য (ঐচ্ছিক)<textarea maxLength={2000} value={details} onChange={event => setDetails(event.target.value)} placeholder="কোন তথ্য বা অ্যাকাউন্ট নিয়ে অনুরোধ করছেন? পাসওয়ার্ড, OTP বা গোপন নথি লিখবেন না।" rows={4} /></label>
            <label className="deletion-confirm"><input type="checkbox" required checked={identityConfirmed} onChange={event => setIdentityConfirmed(event.target.checked)} /> আমি এই ইমেইল বা অ্যাকাউন্টের মালিক। প্রয়োজনে পরিচয় যাচাইয়ের জন্য আমার সঙ্গে যোগাযোগ করা যেতে পারে—এটি বুঝেছি।</label>
            <button className="btn-primary" type="submit" disabled={deletion.isPending}>{deletion.isPending ? <><Loader2 className="animate-spin" size={16} /> অনুরোধ পাঠানো হচ্ছে…</> : <><CheckCircle2 size={16} /> অনুরোধ পাঠান</>}</button>
          </form>
          <p className="deletion-request-note"><Mail size={14} /> ফর্ম কাজ না করলে <a href="mailto:info@banglarvoice24news.com">info@banglarvoice24news.com</a>-এ লিখুন। পাসওয়ার্ড, OTP বা গোপন নথি পাঠাবেন না।</p>
        </section>
        <section className="policy-contact"><Mail size={18} /><div><h2>প্রশ্ন বা অনুরোধ আছে?</h2><p>লিখুন: <a href="mailto:info@banglarvoice24news.com">info@banglarvoice24news.com</a></p></div></section>
      </div>
    </section>
    <footer className="policy-footer"><span>DSAI / আপনার তথ্যের সুরক্ষা</span><span>স্বচ্ছ ব্যবহার · সচেতন সিদ্ধান্ত · নিরাপদ সহায়তা</span></footer>
  </main>;
}
