import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { BUSINESS_INDUSTRIES, BUSINESS_MARKETS, BUSINESS_STAGES, LEAD_GOALS } from "@shared/businessMarkets";

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
  const compose = trpc.lead.compose.useMutation();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consentToDraft) return;
    compose.mutate({ brief, sourceLanguage, targetCountry, targetLanguage, audience, industry, businessStage, leadGoal, offer, workingRegion, tone, channel, consentToDraft: true });
  };

  const selectMarket = (id: string) => {
    const market = BUSINESS_MARKETS.find((item) => item.id === id);
    if (!market) return;
    setMarketId(id);
    setTargetCountry(market.country);
    setTargetLanguage(market.defaultLanguage);
    setWorkingRegion(`${market.country} and surrounding area`);
  };

  return (
    <main className="page-shell lead-composer-page">
      <div className="container narrow-content">
        <Link href="/" className="back-link">← DSAI home</Link>
        <p className="eyebrow">UNIVERSAL LEAD COMPOSER / ভাষা থেকে ভাষায়</p>
        <h1>আপনার ভাষায় বলুন।<br /><em>তাদের ভাষায় পৌঁছান।</em></h1>
        <p className="lead-intro">বাংলা, Banglish, English বা অন্য যেকোনো ভাষায় brief লিখুন। দেশ, target language, audience ও tone বেছে নিলে DSAI একটি reviewable localized draft তৈরি করবে।</p>

        <form className="composer-card" onSubmit={submit} aria-describedby="composer-boundary">
          <div className="form-grid">
            <label className="field-wide">আপনার brief / What do you want to say?
              <textarea value={brief} onChange={(event) => setBrief(event.target.value)} minLength={3} maxLength={1600} required placeholder="যেমন: আমাদের নতুন community workshop সম্পর্কে Toronto-র Bengali-speaking small business owners-দের জানাতে চাই…" rows={5} />
            </label>
            <label>Source language
              <input value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value)} placeholder="auto" maxLength={80} />
            </label>
            <label>Priority market
              <select value={marketId} onChange={(event) => selectMarket(event.target.value)}>{BUSINESS_MARKETS.map((market) => <option key={market.id} value={market.id}>{market.country} · {market.defaultLanguage}</option>)}</select>
            </label>
            <label>Target country
              <input value={targetCountry} onChange={(event) => setTargetCountry(event.target.value)} required maxLength={80} placeholder="Canada" />
            </label>
            <label>Target language
              <input value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)} required maxLength={80} placeholder="English (Canada)" />
            </label>
            <label>Audience
              <input value={audience} onChange={(event) => setAudience(event.target.value)} required maxLength={160} placeholder="community members" />
            </label>
            <label>Industry
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

        {compose.isError && <div className="composer-result composer-error" role="alert">Draft তৈরি করা যায়নি। আবার চেষ্টা করুন।</div>}
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
