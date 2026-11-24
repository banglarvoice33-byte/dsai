import { Link } from "wouter";
import { ArrowLeft, Mail } from "lucide-react";

const CONTACT_EMAIL = "banglarvoice33@gmail.com";

export default function Contact() {
  return (
    <main className="policy-page">
      <header className="policy-header">
        <Link href="/" className="policy-back"><ArrowLeft size={16} /> হোমে ফিরুন</Link>
        <span>DSAI / যোগাযোগ</span>
        <Link href="/about">DSAI সম্পর্কে</Link>
      </header>
      <section className="policy-hero">
        <Mail size={28} aria-hidden="true" />
        <p className="learn-label">যোগাযোগের তথ্য</p>
        <h1>আমাদের সঙ্গে<br /><em>যোগাযোগ করুন।</em></h1>
        <p className="policy-lead">DSAI সম্পর্কে প্রশ্ন, মতামত বা সহায়তার প্রয়োজন হলে ইমেইল করুন।</p>
      </section>
      <section className="policy-body">
        <aside className="policy-side-card">
          <p className="learn-label">ইমেইল</p>
          <a className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>
            <Mail size={16} aria-hidden="true" /> {CONTACT_EMAIL}
          </a>
        </aside>
        <div className="policy-sections">
          <section className="policy-contact">
            <Mail size={22} aria-hidden="true" />
            <div>
              <h2>ইমেইলে যোগাযোগ</h2>
              <p>আপনার বার্তা পাঠাতে নিচের ঠিকানাটি ব্যবহার করুন।</p>
              <a className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </div>
          </section>
        </div>
      </section>
      <footer className="policy-footer"><Link href="/">DSAI</Link><Link href="/about">পরিচিতি</Link><Link href="/privacy">গোপনীয়তা</Link></footer>
    </main>
  );
}
