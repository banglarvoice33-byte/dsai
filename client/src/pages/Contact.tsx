import { CONTACT_EMAIL } from "@shared/contact";
import { Link } from "wouter";
import { ArrowLeft, Info, Mail } from "lucide-react";

export default function Contact() {
  return (
    <main className="policy-page">
      <header className="policy-header">
        <Link href="/" className="policy-back"><ArrowLeft size={16} /> হোমে ফিরুন</Link>
        <span>DSAI / যোগাযোগ</span>
        <Link href="/about">DSAI সম্পর্কে</Link>
      </header>
      <section className="policy-hero">
        <Info size={28} />
        <p className="learn-label">যোগাযোগের তথ্য</p>
        <h1>আমাদের সঙ্গে<br /><em>যোগাযোগ করুন।</em></h1>
        <p className="policy-lead">প্রশ্ন, মতামত বা সহায়তার জন্য নিচের ইমেইল ঠিকানায় লিখুন।</p>
      </section>
      <section className="policy-body">
        <aside className="policy-side-card">
          <p className="learn-label">ইমেইল</p>
          <p>সরাসরি ইমেইল পাঠাতে নিচের ঠিকানাটি ব্যবহার করুন।</p>
        </aside>
        <div className="policy-sections">
          <section className="policy-contact">
            <Mail size={22} aria-hidden="true" />
            <div>
              <h2>ইমেইলে যোগাযোগ</h2>
              <p><a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline underline-offset-4">{CONTACT_EMAIL}</a></p>
              <p className="mt-2">DSAI সম্পর্কে জানতে <Link href="/about">পরিচিতি পৃষ্ঠা</Link> এবং সেবার নির্দেশনার জন্য <Link href="/learn">শিখুন পৃষ্ঠা</Link> দেখুন।</p>
            </div>
          </section>
        </div>
      </section>
      <footer className="policy-footer"><Link href="/">DSAI</Link><Link href="/about">পরিচিতি</Link><Link href="/privacy">গোপনীয়তা</Link></footer>
    </main>
  );
}
