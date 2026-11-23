import { ArrowLeft, CalendarDays, ExternalLink, LockKeyhole, ShieldAlert } from "lucide-react";
import { Link } from "wouter";

const integrations = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    purpose: "Read-only event and availability discovery",
    docs: "https://developers.google.com/calendar/api",
    required: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "OAuth consent screen and read-only scopes"],
  },
  {
    id: "hubspot",
    name: "HubSpot CRM",
    purpose: "Read-only contact and company metadata",
    docs: "https://developers.hubspot.com/docs/api/overview",
    required: ["HUBSPOT_CLIENT_ID", "HUBSPOT_CLIENT_SECRET", "OAuth app and read-only CRM scopes"],
  },
];

export default function ReadOnlyPilot() {
  return <main className="read-only-pilot-page">
    <header className="read-only-pilot-topbar">
      <Link href="/agents" className="workspace-back"><ArrowLeft size={15} /> Agent operations</Link>
      <span className="eyebrow-pill"><span className="pulse-dot" />INTEGRATION READINESS</span>
      <Link href="/admin/connectors" className="quiet-button">Connector registry</Link>
    </header>
    <div className="read-only-pilot-shell">
      <section className="read-only-pilot-hero">
        <span className="learn-label">SETUBANDHAN · REAL OAUTH NOT CONFIGURED</span>
        <h1>বাস্তব সংযোগের<br /><em>আগে প্রস্তুতি যাচাই।</em></h1>
        <p>Google Calendar ও CRM-এর production OAuth adapter এখনো এই প্রকল্পে চালু হয়নি। তাই এখানে কোনো mock connection, fake progress, sample record বা সফল sync দেখানো হয় না।</p>
      </section>
      <section className="pilot-boundary">
        <ShieldAlert size={18} />
        <div><strong>বর্তমান অবস্থা: Not connected</strong><span>কোনো provider API request, token exchange, data read বা external write করা হচ্ছে না।</span></div>
      </section>
      <section className="pilot-card space-y-5">
        {integrations.map(item => <article key={item.id} className="border-b border-[#18241f]/10 pb-5 last:border-0">
          <div className="flex items-start gap-3"><CalendarDays size={20} /><div><h2>{item.name}</h2><p>{item.purpose}</p></div></div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide">Implementation prerequisites</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{item.required.map(requirement => <li key={requirement}>{requirement}</li>)}</ul>
          <a href={item.docs} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm underline underline-offset-4">Official developer documentation <ExternalLink size={13} /></a>
        </article>)}
      </section>
      <section className="pilot-boundary">
        <LockKeyhole size={18} />
        <div><strong>Production gate</strong><span>OAuth callback/state validation, encrypted token storage, scope minimization, revoke/disconnect, owner-scoped reads, audit events, outage tests and consent review must pass before this page can expose a Connect action.</span></div>
      </section>
    </div>
  </main>;
}
