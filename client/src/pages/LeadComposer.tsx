import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { BUSINESS_INDUSTRIES, BUSINESS_MARKETS, BUSINESS_STAGES, LEAD_GOALS } from "@shared/businessMarkets";
import { buildLeadExportRows } from "@shared/leadExport";
import { filterBusinessMarkets } from "@shared/businessMarketSearch";
import { LEAD_DRAFT_STORAGE_KEY, type SavedLeadDraft, parseSavedLeadDrafts, removeLeadDraft, saveLeadDraft, serializeSavedLeadDrafts } from "@shared/leadDraftStorage";
import type { LocalizedLeadDraft } from "@shared/multilingualLead";

type Tone = "professional" | "warm" | "concise" | "community";
type Channel = "email" | "sms" | "social-dm" | "phone-script";

const tones: Array<{ value: Tone; label: string }> = [
  { value: "professional", label: "Professional / পেশাদার" },
  { value: "warm", label: "Warm / আন্তরিক" },
  { value: "concise", label: "Concise / সংক্ষিপ্ত" },
  { value: "community", label: "Community / কমিউনিটি" },
];

const channels: Array<{ value: Channel; label: string }> = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "social-dm", label: "Social DM" },
  { value: "phone-script", label: "Phone script" },
];

export default function LeadComposer() {
  const [brief, setBrief] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [marketId, setMarketId] = useState("ca");
  const [targetCountry, setTargetCountry] = useState("Canada");
  const [targetLanguage, setTargetLanguage] = useState("English (Canada)");
  const [audience, setAudience] = useState("community members");
  const [industry, setIndustry] = useState("Education");
  const [businessStage, setBusinessStage] = useState("Growing business");
  const [leadGoal, setLeadGoal] = useState("Introduction");
  const [offer, setOffer] = useState("");
  const [workingRegion, setWorkingRegion] = useState("Toronto and surrounding area");
  const [tone, setTone] = useState<Tone>("professional");
  const [channel, setChannel] = useState<Channel>("email");
  const [consentToDraft, setConsentToDraft] = useState(false);
  const [marketQuery, setMarketQuery] = useState("");
  const [marketRegion, setMarketRegion] = useState("all");
  const [marketsReady, setMarketsReady] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<SavedLeadDraft[]>([]);
  const [savedPreview, setSavedPreview] = useState<LocalizedLeadDraft | null>(null);
  const compose = trpc.lead.compose.useMutation();
  const auth = trpc.auth.me.useQuery();
  const crmLeads = trpc.lead.list.useQuery({ limit: 50 }, { enabled: Boolean(auth.data) });
  const saveLead = trpc.lead.save.useMutation();
  const updateLead = trpc.lead.update.useMutation();

  useEffect(() => {
    const timer = window.setTimeout(() => setMarketsReady(true), 160);
    setSavedDrafts(parseSavedLeadDrafts(window.localStorage.getItem(LEAD_DRAFT_STORAGE_KEY)));
    return () => window.clearTimeout(timer);
  }, []);

  const filteredMarkets = useMemo(() => {
    const query = marketQuery.trim().toLocaleLowerCase();
    return filterBusinessMarkets(BUSINESS_MARKETS, query, marketRegion);
  }, [marketQuery, marketRegion]);
  const marketRegions = useMemo(() => Array.from(new Set(BUSINESS_MARKETS.map((market) => market.region))), []);

  const selectMarket = (id: string) => {
    const market = BUSINESS_MARKETS.find((item) => item.id === id);
    if (!market) return;
    setMarketId(id);
    setTargetCountry(market.country);
    setTargetLanguage(market.defaultLanguage);
    setWorkingRegion(`${market.country} and surrounding area`);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consentToDraft) return;
    setSavedPreview(null);
    compose.mutate({ brief, sourceLanguage, targetCountry, targetLanguage, audience, industry, businessStage, leadGoal, offer, workingRegion, tone, channel, consentToDraft: true });
  };

  const preview: LocalizedLeadDraft = compose.data?.draft ?? savedPreview ?? {
    detectedSourceLanguage: sourceLanguage,
    targetLanguage,
    subject: brief ? `${leadGoal}: ${offer || "আপনার প্রস্তাব"}` : "আপনার localized lead preview এখানে দেখা যাবে",
    greeting: brief ? `Hello ${audience || "there"},` : "Target language ও business context পূরণ করুন।",
    body: brief || "Brief লিখলে আপনার draft-এর একটি live preview এখানে দেখা যাবে।",
    callToAction: offer || "একটি ছোট, স্পষ্ট next step যোগ করুন।",
    optOutLine: "আপনি আর এই ধরনের যোগাযোগ না চাইলে জানাতে পারেন।",
    qualityNote: "এটি একটি editable draft preview; local language, legal এবং consent review প্রয়োজন হতে পারে।",
  };

  const applySavedDraft = (saved: SavedLeadDraft) => {
    setMarketId(saved.marketId);
    setTargetCountry(saved.targetCountry);
    setTargetLanguage(saved.targetLanguage);
    setIndustry(saved.industry);
    setBusinessStage(saved.businessStage);
    setLeadGoal(saved.leadGoal);
    setAudience(saved.audience);
    setWorkingRegion(saved.workingRegion);
    setTone(saved.tone as Tone);
    setChannel(saved.channel as Channel);
    setSourceLanguage(saved.sourceLanguage);
    setBrief(saved.brief);
    setOffer(saved.offer);
    setConsentToDraft(true);
    setSavedPreview(saved.draft);
  };

  const saveCurrentDraft = () => {
    if (!brief || !consentToDraft) return;
    const saved: SavedLeadDraft = { id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}`, savedAt: new Date().toISOString(), marketId, targetCountry, targetLanguage, industry, businessStage, leadGoal, audience, workingRegion, tone, channel, sourceLanguage, brief, offer, draft: preview };
    const next = saveLeadDraft(savedDrafts, saved);
    setSavedDrafts(next);
    window.localStorage.setItem(LEAD_DRAFT_STORAGE_KEY, serializeSavedLeadDrafts(next));
  };

  const deleteSavedDraft = (id: string) => {
    const next = removeLeadDraft(savedDrafts, id);
    setSavedDrafts(next);
    window.localStorage.setItem(LEAD_DRAFT_STORAGE_KEY, serializeSavedLeadDrafts(next));
  };

  const exportExcel = async () => {
    setIsExporting(true);
    try {
      const XLSX = await import("xlsx");
      const rows = buildLeadExportRows({ marketId, targetCountry, targetLanguage, industry, businessStage, leadGoal, audience, workingRegion, tone, channel, sourceLanguage, brief, subject: preview.subject, greeting: preview.greeting, body: preview.body, callToAction: preview.callToAction, optOutLine: preview.optOutLine, qualityNote: preview.qualityNote });
      const sheet = XLSX.utils.aoa_to_sheet(rows);
      sheet["!cols"] = [{ wch: 24 }, { wch: 90 }];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, "Lead draft");
      XLSX.writeFile(workbook, `dsai-lead-draft-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="page-shell lead-composer-page">
      <div className="container narrow-content">
        <Link href="/" className="back-link">← DSAI home</Link>
        <p className="eyebrow">UNIVERSAL LEAD COMPOSER / ভাষা থেকে ভাষায়</p>
        <h1>আপনার ভাষায় বলুন।<br /><em>তাদের ভাষায় পৌঁছান।</em></h1>
        <p className="lead-intro">যেকোনো ভাষায় brief লিখুন। ৪০টি market-এর মধ্যে খুঁজে নিন, business context দিন, এবং final করার আগে localized draft preview দেখুন।</p>

        <form className="composer-card" onSubmit={submit} aria-describedby="composer-boundary">
          <div className="form-grid">
            <label className="field-wide">আপনার brief / What do you want to say?
              <textarea value={brief} onChange={(event) => setBrief(event.target.value)} minLength={3} maxLength={1600} required placeholder="যেমন: আমাদের নতুন community workshop সম্পর্কে Toronto-র Bengali-speaking small business owners-দের জানাতে চাই…" rows={5} />
            </label>
            <label>Source language
              <input value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value)} placeholder="auto" maxLength={80} />
            </label>
            <div className="field-stack field-wide">
              <label htmlFor="market-search">Market search / দেশ বা ভাষা খুঁজুন</label>
              <input id="market-search" value={marketQuery} onChange={(event) => setMarketQuery(event.target.value)} placeholder="Canada, English, Europe, EUR…" aria-controls="market-results" />
              <div className="filter-row"><select aria-label="Filter markets by region" value={marketRegion} onChange={(event) => setMarketRegion(event.target.value)}><option value="all">সব region</option>{marketRegions.map((region) => <option key={region} value={region}>{region}</option>)}</select><span className="filter-count">{filteredMarkets.length} / {BUSINESS_MARKETS.length} markets</span></div>
              {!marketsReady ? <div className="market-skeleton" aria-label="Markets loading"><span /><span /><span /></div> : <div id="market-results" className="market-results" role="listbox" aria-label="Selectable business markets">{filteredMarkets.length ? filteredMarkets.map((market) => <button className={`market-option${market.id === marketId ? " is-selected" : ""}`} type="button" role="option" aria-selected={market.id === marketId} key={market.id} onClick={() => selectMarket(market.id)}><span>{market.country}</span><small>{market.defaultLanguage} · {market.region}</small></button>) : <p className="market-empty">এই filter-এ কোনো market পাওয়া যায়নি। অন্য country, language বা region দিয়ে চেষ্টা করুন।</p>}</div>}
            </div>
            <label>Target country
              <input value={targetCountry} onChange={(event) => setTargetCountry(event.target.value)} required maxLength={80} placeholder="Canada" />
            </label>
            <label>Target language
              <input value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)} required maxLength={80} placeholder="English (Canada)" />
            </label>
            <label>Audience
              <input value={audience} onChange={(event) => setAudience(event.target.value)} required maxLength={160} placeholder="community members" />
            </label>
            <label>Business type / Industry
              <select value={industry} onChange={(event) => setIndustry(event.target.value)}>{BUSINESS_INDUSTRIES.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            </label>
            <label>Business stage
              <select value={businessStage} onChange={(event) => setBusinessStage(event.target.value)}>{BUSINESS_STAGES.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            </label>
            <label>Lead goal
              <select value={leadGoal} onChange={(event) => setLeadGoal(event.target.value)}>{LEAD_GOALS.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            </label>
            <label>Working region
              <input value={workingRegion} onChange={(event) => setWorkingRegion(event.target.value)} required maxLength={160} placeholder="Toronto and surrounding area" />
            </label>
            <label className="field-wide">Offer or value proposition
              <input value={offer} onChange={(event) => setOffer(event.target.value)} required maxLength={500} placeholder="What useful outcome are you offering?" />
            </label>
            <label>Tone
              <select value={tone} onChange={(event) => setTone(event.target.value as Tone)}>{tones.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
            </label>
            <label>Draft channel
              <select value={channel} onChange={(event) => setChannel(event.target.value as Channel)}>{channels.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
            </label>
          </div>
          <label className="consent-row"><input type="checkbox" checked={consentToDraft} onChange={(event) => setConsentToDraft(event.target.checked)} required /> I understand this creates a draft only; no message will be sent.</label>
          <button className="btn-primary composer-submit" type="submit" disabled={compose.isPending || !consentToDraft}>{compose.isPending ? "Draft তৈরি হচ্ছে…" : "Localized draft তৈরি করুন →"}</button>
          <p id="composer-boundary" className="form-boundary">Human review required · No automatic send · Recipient opt-out is included · Sensitive or discriminatory targeting is not supported.</p>
        </form>

        <section className="composer-result live-preview" aria-live="polite" aria-label="Live lead preview">
          <div className="result-meta"><span>LIVE PREVIEW / FINAL CHECK</span><span>{targetLanguage} · {targetCountry}</span></div>
          <h2>{preview.subject}</h2>
          <p className="draft-greeting">{preview.greeting}</p>
          <p className="draft-body">{preview.body}</p>
          <p><strong>Next step:</strong> {preview.callToAction}</p>
          <p><strong>Opt-out:</strong> {preview.optOutLine}</p>
          <small>{preview.qualityNote}</small>
          <div className="preview-actions"><button className="btn-primary" type="button" onClick={saveCurrentDraft} disabled={!brief || !consentToDraft}>এই draft সংরক্ষণ করুন</button><button className="btn-primary" type="button" disabled={!auth.data || saveLead.isPending || !brief || !consentToDraft} onClick={() => saveLead.mutate({ title: preview.subject || "Untitled lead draft", source: "lead-composer", country: targetCountry, language: targetLanguage, industry, notes: brief, sourceEvidence: "User-provided brief; no external discovery or verification performed.", draftSubject: preview.subject, draftBody: [preview.greeting, preview.body, preview.callToAction, preview.optOutLine].join("\n\n") }, { onSuccess: () => crmLeads.refetch() })}>{saveLead.isPending ? "সংরক্ষণ হচ্ছে…" : "CRM Workdesk-এ সংরক্ষণ"}</button><button className="btn-primary" type="button" onClick={exportExcel} disabled={!brief || !consentToDraft || isExporting}><span>{isExporting ? "Excel প্রস্তুত হচ্ছে…" : "Excel export (.xlsx)"}</span></button><span className="result-lock">Draft only · Review before use · No outbound send</span></div>
        </section>

        {savedDrafts.length > 0 && <section className="composer-result saved-drafts" aria-label="Saved lead drafts"><div className="result-meta"><span>SAVED WORK / LOCAL ONLY</span><span>{savedDrafts.length} / 12 drafts</span></div><p className="form-boundary">এই draft-গুলো শুধু আপনার browser-এ সংরক্ষিত। কোনো server বা recipient-এর কাছে পাঠানো হয়নি।</p><div className="saved-draft-list">{savedDrafts.map(saved => <article className="saved-draft-item" key={saved.id}><div><strong>{saved.draft.subject}</strong><small>{saved.targetLanguage} · {saved.targetCountry} · {new Date(saved.savedAt).toLocaleDateString()}</small></div><div className="preview-actions"><button className="btn-primary" type="button" onClick={() => applySavedDraft(saved)}>আবার খুলুন</button><button className="btn-secondary" type="button" onClick={() => deleteSavedDraft(saved.id)}>মুছুন</button></div></article>)}</div></section>}
        <section className="composer-result saved-drafts" aria-label="Persistent lead CRM">
          <div className="result-meta"><span>DSAI CRM WORKDESK / SERVER-SAVED</span><span>{crmLeads.data?.length ?? 0} leads</span></div>
          {!auth.data ? <p className="form-boundary">নিজের স্থায়ী CRM ব্যবহার করতে <Link href="/auth/login">লগইন করুন</Link>। Local draft আগের মতোই browser-এ থাকবে।</p> : crmLeads.isLoading ? <p>আপনার lead records লোড হচ্ছে…</p> : crmLeads.isError ? <p role="alert">CRM data লোড করা যায়নি। পরে আবার চেষ্টা করুন।</p> : crmLeads.data?.length ? <div className="saved-draft-list">{crmLeads.data.map(lead => <article className="saved-draft-item" key={lead.id}><div><strong>{lead.title}</strong><small>{lead.country || "—"} · {lead.language || "—"} · {new Date(lead.createdAt).toLocaleDateString()}</small><small>Contact consent: {lead.consentStatus} · Source: {lead.source}</small></div><div className="preview-actions"><select aria-label={`Update status for ${lead.title}`} value={lead.status} disabled={updateLead.isPending} onChange={event => updateLead.mutate({ id: lead.id, status: event.target.value as "new" | "qualified" | "contacted" | "interested" | "converted" | "lost" }, { onSuccess: () => crmLeads.refetch() })}><option value="new">New</option><option value="qualified">Qualified</option><option value="contacted">Contacted</option><option value="interested">Interested</option><option value="converted">Converted</option><option value="lost">Lost</option></select></div></article>)}</div> : <p className="form-boundary">এখনো কোনো server-saved lead নেই। Draft তৈরি করে CRM Workdesk-এ সংরক্ষণ করুন।</p>}
          <p className="form-boundary">এই CRM-এ draft সংরক্ষণ করলেই কাউকে contact করা হয় না। Contact consent আলাদাভাবে যাচাই ও নথিভুক্ত করতে হবে।</p>
          {saveLead.isError && <p role="alert">খসড়া সংরক্ষণ করা যায়নি। আবার লগইন করে চেষ্টা করুন।</p>}
          {updateLead.isError && <p role="alert">Lead status update হয়নি। আবার চেষ্টা করুন।</p>}
        </section>
        {compose.isError && <div className="composer-result composer-error" role="alert">Draft তৈরি করা যায়নি। আবার চেষ্টা করুন। Safe preview রাখা হয়েছে; আবার চেষ্টা করুন।</div>}
        {compose.data && <section className="composer-result" aria-live="polite">
          <div className="result-meta"><span>{compose.data.source === "ai" ? "AI-assisted draft" : "Safe fallback draft"}</span><span>{compose.data.language} · {compose.data.country}</span></div>
          <h2>{compose.data.draft.subject}</h2>
          <p className="draft-greeting">{compose.data.draft.greeting}</p>
          <p className="draft-body">{compose.data.draft.body}</p>
          <p><strong>Next step:</strong> {compose.data.draft.callToAction}</p>
          <p><strong>Opt-out:</strong> {compose.data.draft.optOutLine}</p>
          <small>{compose.data.draft.qualityNote}</small>
          <div className="result-lock">No outbound send occurred. Review, edit, and obtain appropriate recipient consent before using this draft.</div>
        </section>}
      </div>
    </main>
  );
}
