import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { BUSINESS_INDUSTRIES, BUSINESS_MARKETS, BUSINESS_STAGES, LEAD_GOALS } from "@shared/businessMarkets";
import { buildLeadExportRows } from "@shared/leadExport";
import { LEAD_DRAFT_STORAGE_KEY, type SavedLeadDraft, parseSavedLeadDrafts, removeLeadDraft, saveLeadDraft, serializeSavedLeadDrafts } from "@shared/leadDraftStorage";
import type { LocalizedLeadDraft } from "@shared/multilingualLead";
import ContractAcknowledgmentPanel from "@/components/ContractAcknowledgmentPanel";

type Tone = "professional" | "warm" | "concise" | "community";
type Channel = "email" | "sms" | "social-dm" | "phone-script";

const countryLabelsBn: Record<string, string> = {
  "United States": "যুক্তরাষ্ট্র", Canada: "কানাডা", "United Kingdom": "যুক্তরাজ্য", Australia: "অস্ট্রেলিয়া", "New Zealand": "নিউজিল্যান্ড",
  Germany: "জার্মানি", France: "ফ্রান্স", Italy: "ইতালি", Spain: "স্পেন", Portugal: "পর্তুগাল", Netherlands: "নেদারল্যান্ডস",
  Belgium: "বেলজিয়াম", Switzerland: "সুইজারল্যান্ড", Sweden: "সুইডেন", Norway: "নরওয়ে", Denmark: "ডেনমার্ক", Ireland: "আয়ারল্যান্ড",
  Poland: "পোল্যান্ড", Austria: "অস্ট্রিয়া", Japan: "জাপান", "South Korea": "দক্ষিণ কোরিয়া", China: "চীন", Singapore: "সিঙ্গাপুর",
  Malaysia: "মালয়েশিয়া", "United Arab Emirates": "সংযুক্ত আরব আমিরাত", "Saudi Arabia": "সৌদি আরব", Qatar: "কাতার", Kuwait: "কুয়েত",
  India: "ভারত", Bangladesh: "বাংলাদেশ", Pakistan: "পাকিস্তান", "Sri Lanka": "শ্রীলঙ্কা", "South Africa": "দক্ষিণ আফ্রিকা",
  Nigeria: "নাইজেরিয়া", Kenya: "কেনিয়া", Brazil: "ব্রাজিল", Mexico: "মেক্সিকো", Türkiye: "তুরস্ক", Indonesia: "ইন্দোনেশিয়া", Philippines: "ফিলিপাইন",
};
const languageLabelsBn: Record<string, string> = {
  "English (US)": "ইংরেজি (যুক্তরাষ্ট্র)", "English (Canada)": "ইংরেজি (কানাডা)", "English (UK)": "ইংরেজি (যুক্তরাজ্য)",
  "English (Australia)": "ইংরেজি (অস্ট্রেলিয়া)", "English (New Zealand)": "ইংরেজি (নিউজিল্যান্ড)", "English (Ireland)": "ইংরেজি (আয়ারল্যান্ড)", German: "জার্মান",
  French: "ফরাসি", Italian: "ইতালীয়", "Spanish (Spain)": "স্প্যানিশ (স্পেন)", "Portuguese (Portugal)": "পর্তুগিজ (পর্তুগাল)",
  Dutch: "ডাচ", "Dutch or French": "ডাচ অথবা ফরাসি", "German, French or Italian": "জার্মান, ফরাসি অথবা ইতালীয়",
  Swedish: "সুইডিশ", Norwegian: "নরওয়েজীয়", Danish: "ড্যানিশ", Polish: "পোলিশ", Japanese: "জাপানি", Korean: "কোরীয়",
  "Simplified Chinese": "সরলীকৃত চীনা", "English (Singapore)": "ইংরেজি (সিঙ্গাপুর)", "Malay or English": "মালয় অথবা ইংরেজি",
  "Arabic or English": "আরবি অথবা ইংরেজি", Arabic: "আরবি", "English or Hindi": "ইংরেজি অথবা হিন্দি", Bengali: "বাংলা",
  "Urdu or English": "উর্দু অথবা ইংরেজি", "Sinhala, Tamil or English": "সিংহলি, তামিল অথবা ইংরেজি", English: "ইংরেজি",
  "English or Swahili": "ইংরেজি অথবা সোয়াহিলি", "Portuguese (Brazil)": "পর্তুগিজ (ব্রাজিল)", "Spanish (Mexico)": "স্প্যানিশ (মেক্সিকো)",
  Turkish: "তুর্কি", Indonesian: "ইন্দোনেশীয়", "English or Filipino": "ইংরেজি অথবা ফিলিপিনো",
};
const regionLabelsBn: Record<string, string> = {
  "North America": "উত্তর আমেরিকা", Europe: "ইউরোপ", Oceania: "ওশেনিয়া", Asia: "এশিয়া", "Middle East": "মধ্যপ্রাচ্য",
  "South Asia": "দক্ষিণ এশিয়া", Africa: "আফ্রিকা", "Latin America": "লাতিন আমেরিকা", "Europe/Asia": "ইউরোপ ও এশিয়া",
};
const industryLabelsBn: Record<string, string> = {
  Education: "শিক্ষা", Technology: "প্রযুক্তি", Healthcare: "স্বাস্থ্যসেবা", "Professional services": "পেশাগত সেবা",
  Retail: "খুচরা ব্যবসা", Hospitality: "আতিথেয়তা", Finance: "অর্থ ও আর্থিক সেবা", "Real estate": "আবাসন ও সম্পত্তি",
  Nonprofit: "অলাভজনক প্রতিষ্ঠান", Other: "অন্যান্য",
};
const stageLabelsBn: Record<string, string> = {
  "New idea": "নতুন ধারণা", "Early business": "প্রাথমিক পর্যায়ের ব্যবসা", "Growing business": "বর্ধনশীল ব্যবসা",
  "Established organization": "প্রতিষ্ঠিত প্রতিষ্ঠান", "Enterprise team": "বৃহৎ প্রতিষ্ঠানের দল",
};
const goalLabelsBn: Record<string, string> = {
  Introduction: "পরিচিতি", Partnership: "অংশীদারত্ব", "Sales conversation": "বিক্রয় আলোচনা",
  "Service inquiry": "সেবা সম্পর্কে অনুসন্ধান", "Event invitation": "অনুষ্ঠানের আমন্ত্রণ", Recruitment: "নিয়োগ",
};


const tones: Array<{ value: Tone; label: string }> = [
  { value: "professional", label: "পেশাদার" },
  { value: "warm", label: "আন্তরিক" },
  { value: "concise", label: "সংক্ষিপ্ত" },
  { value: "community", label: "সম্প্রদায়ভিত্তিক" },
];

const channels: Array<{ value: Channel; label: string }> = [
  { value: "email", label: "ইমেইল" },
  { value: "sms", label: "এসএমএস" },
  { value: "social-dm", label: "সামাজিক মাধ্যমে ব্যক্তিগত বার্তা" },
  { value: "phone-script", label: "ফোনে কথা বলার খসড়া" },
];

export default function LeadComposer() {
  const [brief, setBrief] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("স্বয়ংক্রিয়");
  const [marketId, setMarketId] = useState("bd");
  const [targetCountry, setTargetCountry] = useState("বাংলাদেশ");
  const [targetLanguage, setTargetLanguage] = useState("বাংলা");
  const [audience, setAudience] = useState("কমিউনিটির সদস্য");
  const [industry, setIndustry] = useState("Education");
  const [businessStage, setBusinessStage] = useState("Growing business");
  const [leadGoal, setLeadGoal] = useState("Introduction");
  const [offer, setOffer] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [workingRegion, setWorkingRegion] = useState("বাংলাদেশ");
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
    return BUSINESS_MARKETS.filter((market) => [market.country, countryLabelsBn[market.country], market.region, regionLabelsBn[market.region], market.defaultLanguage, languageLabelsBn[market.defaultLanguage], market.locale, market.currency].some((value) => value?.toLocaleLowerCase().includes(query)) && (marketRegion === "all" || market.region === marketRegion));
  }, [marketQuery, marketRegion]);
  const marketRegions = useMemo(() => Array.from(new Set(BUSINESS_MARKETS.map((market) => market.region))), []);

  const selectMarket = (id: string) => {
    const market = BUSINESS_MARKETS.find((item) => item.id === id);
    if (!market) return;
    setMarketId(id);
    setTargetCountry(countryLabelsBn[market.country] ?? market.country);
    setTargetLanguage(languageLabelsBn[market.defaultLanguage] ?? market.defaultLanguage);
    setWorkingRegion(`${countryLabelsBn[market.country] ?? market.country} ও আশপাশের এলাকা`);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consentToDraft || !auth.data) return;
    setSavedPreview(null);
    compose.reset();
    compose.mutate({ requestId: crypto.randomUUID(), brief, sourceLanguage, targetCountry, targetLanguage, audience, industry, businessStage, leadGoal, offer, workingRegion, tone, channel, consentToDraft: true });
  };

  const preview: LocalizedLeadDraft | null = savedPreview ?? (compose.data?.source === "ai" ? compose.data.draft : null);

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
    if (!preview || !brief || !consentToDraft) return;
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
    if (!preview) return;
    setIsExporting(true);
    try {
      const XLSX = await import("xlsx");
      const rows = buildLeadExportRows({ marketId, targetCountry, targetLanguage, industry, businessStage, leadGoal, audience, workingRegion, tone, channel, sourceLanguage, brief, subject: preview.subject, greeting: preview.greeting, body: preview.body, callToAction: preview.callToAction, optOutLine: preview.optOutLine, qualityNote: preview.qualityNote });
      const sheet = XLSX.utils.aoa_to_sheet(rows);
      sheet["!cols"] = [{ wch: 24 }, { wch: 90 }];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, "গ্রাহক খসড়া");
      XLSX.writeFile(workbook, `dsai-lead-draft-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="page-shell lead-composer-page">
      <div className="container narrow-content">
        <Link href="/" className="back-link">← DSAI-এর মূল পাতা</Link>
        <p className="eyebrow">বাংলা নির্দেশনা থেকে গ্রাহক-উপযোগী খসড়া</p>
        <h1>আপনার ভাষায় বলুন।<br /><em>গ্রাহকের ভাষায় পৌঁছান।</em></h1>
        <p className="lead-intro">বাংলায় আপনার প্রয়োজন লিখুন। লক্ষ্য দেশ, গ্রাহক, ব্যবসার ধরন ও প্রস্তাব বেছে নিন। ব্যবহারের আগে তৈরি হওয়া বার্তার খসড়া যাচাই করুন।</p>

        <form className="composer-card" onSubmit={submit} aria-describedby="composer-boundary">
          <div className="form-grid">
            <label className="field-wide">আপনি কী বলতে চান?
              <textarea value={brief} onChange={(event) => setBrief(event.target.value)} minLength={3} maxLength={1600} required placeholder="যেমন: ঢাকার ক্ষুদ্র ব্যবসায়ীদের জন্য আমাদের নতুন প্রশিক্ষণ কর্মশালার কথা জানাতে চাই…" rows={5} />
            </label>
            <label>মূল ভাষা
              <input value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value)} placeholder="স্বয়ংক্রিয়ভাবে শনাক্ত" maxLength={80} />
            </label>
            <div className="field-stack field-wide">
              <label htmlFor="market-search">দেশ বা ভাষা খুঁজুন</label>
              <input id="market-search" value={marketQuery} onChange={(event) => setMarketQuery(event.target.value)} placeholder="বাংলাদেশ, বাংলা, ভারত, ইউরোপ…" aria-controls="market-results" />
              <div className="filter-row"><select aria-label="অঞ্চল অনুযায়ী দেশ বাছাই" value={marketRegion} onChange={(event) => setMarketRegion(event.target.value)}><option value="all">সব অঞ্চল</option>{marketRegions.map((region) => <option key={region} value={region}>{regionLabelsBn[region] ?? region}</option>)}</select><span className="filter-count">{filteredMarkets.length} / {BUSINESS_MARKETS.length} দেশ</span></div>
              {!marketsReady ? <div className="market-skeleton" aria-label="দেশের তালিকা লোড হচ্ছে"><span /><span /><span /></div> : <div id="market-results" className="market-results" role="listbox" aria-label="ব্যবসার জন্য দেশ বাছাই">{filteredMarkets.length ? filteredMarkets.map((market) => <button className={`market-option${market.id === marketId ? " is-selected" : ""}`} type="button" role="option" aria-selected={market.id === marketId} key={market.id} onClick={() => selectMarket(market.id)}><span>{countryLabelsBn[market.country] ?? market.country}</span><small>{languageLabelsBn[market.defaultLanguage] ?? market.defaultLanguage} · {regionLabelsBn[market.region] ?? market.region}</small></button>) : <p className="market-empty">এই অনুসন্ধানে কোনো দেশ পাওয়া যায়নি। অন্য দেশ, ভাষা বা অঞ্চল দিয়ে খুঁজুন।</p>}</div>}
            </div>
            <label>লক্ষ্য দেশ
              <input value={targetCountry} onChange={(event) => setTargetCountry(event.target.value)} required maxLength={80} placeholder="বাংলাদেশ" />
            </label>
            <label>লক্ষ্য ভাষা
              <input value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)} required maxLength={80} placeholder="বাংলা" />
            </label>
            <label>গ্রাহক বা লক্ষ্যগোষ্ঠী
              <input value={audience} onChange={(event) => setAudience(event.target.value)} required maxLength={160} placeholder="কমিউনিটির সদস্য" />
            </label>
            <label>ব্যবসার ধরন
              <select value={industry} onChange={(event) => setIndustry(event.target.value)}>{BUSINESS_INDUSTRIES.map((item) => <option key={item} value={item}>{industryLabelsBn[item] ?? item}</option>)}</select>
            </label>
            <label>ব্যবসার বর্তমান অবস্থা
              <select value={businessStage} onChange={(event) => setBusinessStage(event.target.value)}>{BUSINESS_STAGES.map((item) => <option key={item} value={item}>{stageLabelsBn[item] ?? item}</option>)}</select>
            </label>
            <label>যোগাযোগের উদ্দেশ্য
              <select value={leadGoal} onChange={(event) => setLeadGoal(event.target.value)}>{LEAD_GOALS.map((item) => <option key={item} value={item}>{goalLabelsBn[item] ?? item}</option>)}</select>
            </label>
            <label>কাজের এলাকা
              <input value={workingRegion} onChange={(event) => setWorkingRegion(event.target.value)} required maxLength={160} placeholder="বাংলাদেশ ও আশপাশের এলাকা" />
            </label>
            <label className="field-wide">আপনার প্রস্তাব বা সুবিধা
              <input value={offer} onChange={(event) => setOffer(event.target.value)} required maxLength={500} placeholder="গ্রাহক আপনার কাছ থেকে কী সুবিধা পাবেন?" />
            </label>
            <div className="field-wide form-grid">
              <label>Lead-এর যোগাযোগের নাম
                <input value={contactName} onChange={(event) => setContactName(event.target.value)} maxLength={160} placeholder="ব্যক্তির নাম" />
              </label>
              <label>প্রতিষ্ঠান
                <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} maxLength={180} placeholder="প্রতিষ্ঠানের নাম (ঐচ্ছিক)" />
              </label>
              <label>ইমেইল
                <input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} maxLength={320} placeholder="name@example.com" />
              </label>
              <label>ফোন
                <input type="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} maxLength={40} placeholder="+8801XXXXXXXXX" />
              </label>
              <p className="form-boundary field-wide">সার্ভারে Lead হিসেবে সংরক্ষণ করতে যোগাযোগের নাম এবং বৈধ ইমেইল অথবা ফোন নম্বর প্রয়োজন। AI খসড়া তৈরি করতে এই তথ্য প্রয়োজন নেই।</p>
            </div>
            <label>বার্তার ধরন
              <select value={tone} onChange={(event) => setTone(event.target.value as Tone)}>{tones.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
            </label>
            <label>বার্তা তৈরির ধরন
              <select value={channel} onChange={(event) => setChannel(event.target.value as Channel)}>{channels.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
            </label>
          </div>
          <label className="consent-row"><input type="checkbox" checked={consentToDraft} onChange={(event) => setConsentToDraft(event.target.checked)} required /> আমি বুঝেছি, এখানে শুধু বার্তার খসড়া তৈরি হবে; কাউকে বার্তা পাঠানো হবে না।</label>
          <button className="btn-primary composer-submit" type="submit" disabled={compose.isPending || !consentToDraft || !auth.data}>{compose.isPending ? "খসড়া তৈরি হচ্ছে…" : "বাংলায় নির্দেশনা দিয়ে খসড়া তৈরি করুন →"}</button>
          {!auth.data && <p className="form-boundary">দৈনিক AI সীমা ও আপনার ব্যবহারের হিসাব সঠিকভাবে রাখতে আগে <Link href="/auth/login">প্রবেশ করুন</Link>।</p>}
          <p id="composer-boundary" className="form-boundary">ব্যবহারের আগে মানুষের যাচাই প্রয়োজন · স্বয়ংক্রিয়ভাবে বার্তা পাঠানো হয় না · যোগাযোগ বন্ধের অনুরোধের ভাষা যুক্ত থাকে।</p>
        </form>

        {preview ? <section className="composer-result live-preview" aria-live="polite" aria-label="AI তৈরি করা খসড়া">
          <div className="result-meta"><span>AI তৈরি করা খসড়া · মানব যাচাই প্রয়োজন</span><span>{targetLanguage} · {targetCountry}</span></div>
          <h2>{preview.subject}</h2>
          <p className="draft-greeting">{preview.greeting}</p>
          <p className="draft-body">{preview.body}</p>
          <p><strong>পরবর্তী পদক্ষেপ:</strong> {preview.callToAction}</p>
          <p><strong>যোগাযোগ বন্ধের অনুরোধ:</strong> {preview.optOutLine}</p>
          <small>{preview.qualityNote}</small>
          <div className="preview-actions"><button className="btn-primary" type="button" onClick={saveCurrentDraft} disabled={!brief || !consentToDraft}>এই খসড়া সংরক্ষণ করুন</button><button className="btn-primary" type="button" disabled={!auth.data || saveLead.isPending || !brief || !consentToDraft || !contactName.trim() || (!contactEmail.trim() && !contactPhone.trim())} onClick={() => saveLead.mutate({ requestId: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : undefined, title: preview.subject, company: companyName.trim() || undefined, contactName: contactName.trim(), email: contactEmail.trim() || undefined, phone: contactPhone.trim() || undefined, source: "lead-composer", country: targetCountry, language: targetLanguage, industry, notes: brief, sourceEvidence: "ব্যবহারকারীর দেওয়া বিবরণ; বাইরের উৎস থেকে যাচাই করা হয়নি।", draftSubject: preview.subject, draftBody: [preview.greeting, preview.body, preview.callToAction, preview.optOutLine].join("\n\n") }, { onSuccess: () => crmLeads.refetch() })}>{saveLead.isPending ? "সংরক্ষণ হচ্ছে…" : "গ্রাহক ব্যবস্থাপনায় সংরক্ষণ"}</button><button className="btn-primary" type="button" onClick={exportExcel} disabled={!brief || !consentToDraft || isExporting}><span>{isExporting ? "এক্সেল ফাইল তৈরি হচ্ছে…" : "এক্সেল ফাইলে নিন (.xlsx)"}</span></button><span className="result-lock">শুধু খসড়া · ব্যবহারের আগে যাচাই করুন · কোনো বার্তা পাঠানো হয়নি</span></div>
        </section> : <section className="composer-result live-preview" aria-live="polite" aria-label="AI খসড়ার অবস্থা">
          <div className="result-meta"><span>AI খসড়া</span><span>{targetLanguage} · {targetCountry}</span></div>
          <p>{compose.data?.source === "unavailable" ? compose.data.message : compose.isError ? "AI সেবা থেকে উত্তর পাওয়া যায়নি। কোনো নমুনা খসড়া তৈরি করা হয়নি। পরে আবার চেষ্টা করুন।" : "এখনো কোনো AI খসড়া তৈরি হয়নি। আপনার বিবরণ জমা দিলে AI সেবা সফল হলে তবেই খসড়া দেখানো হবে।"}</p>
        </section>}

        <ContractAcknowledgmentPanel draftTitle={preview?.subject} draftBody={preview ? [preview.greeting, preview.body, preview.callToAction, preview.optOutLine].join("\\n\\n") : ""} />\n\n        {savedDrafts.length > 0 && <section className="composer-result saved-drafts" aria-label="সংরক্ষিত খসড়া"><div className="result-meta"><span>এই ডিভাইসে সংরক্ষিত খসড়া</span><span>{savedDrafts.length} / 12 খসড়া</span></div><p className="form-boundary">এই খসড়াগুলো শুধু আপনার ব্রাউজারে সংরক্ষিত। সার্ভার বা কোনো গ্রাহকের কাছে পাঠানো হয়নি।</p><div className="saved-draft-list">{savedDrafts.map(saved => <article className="saved-draft-item" key={saved.id}><div><strong>{saved.draft.subject}</strong><small>{saved.targetLanguage} · {saved.targetCountry} · {new Date(saved.savedAt).toLocaleDateString("bn-BD")}</small></div><div className="preview-actions"><button className="btn-primary" type="button" onClick={() => applySavedDraft(saved)}>আবার খুলুন</button><button className="btn-secondary" type="button" onClick={() => deleteSavedDraft(saved.id)}>মুছুন</button></div></article>)}</div></section>}
        <section className="composer-result saved-drafts" aria-label="স্থায়ী গ্রাহক ব্যবস্থাপনা">
          <div className="result-meta"><span>DSAI গ্রাহক ব্যবস্থাপনা / সার্ভারে সংরক্ষিত</span><span>{crmLeads.data?.length ?? 0} টি</span></div>
          {!auth.data ? <p className="form-boundary">স্থায়ী গ্রাহক তালিকা ব্যবহার করতে <Link href="/auth/login">প্রবেশ করুন</Link>। স্থানীয় খসড়া এই ব্রাউজারেই থাকবে।</p> : crmLeads.isLoading ? <p>আপনার গ্রাহক তালিকা আনা হচ্ছে…</p> : crmLeads.isError ? <p role="alert">গ্রাহক তালিকা আনা যায়নি। পরে আবার চেষ্টা করুন।</p> : crmLeads.data?.length ? <div className="saved-draft-list">{crmLeads.data.map(lead => <article className="saved-draft-item" key={lead.id}><div><strong>{lead.title}</strong><small>{lead.country || "—"} · {lead.language || "—"} · {new Date(lead.createdAt).toLocaleDateString("bn-BD")}</small><small>যোগাযোগের সম্মতি: {lead.consentStatus === "granted" ? "দেওয়া হয়েছে" : lead.consentStatus === "withdrawn" ? "প্রত্যাহার করা হয়েছে" : lead.consentStatus === "not_required" ? "প্রযোজ্য নয়" : "এখনো নিশ্চিত নয়"} · উৎস: {lead.source === "lead-composer" ? "খসড়া তৈরির ফর্ম" : "ব্যবহারকারীর দেওয়া তথ্য"}</small></div><div className="preview-actions"><select aria-label={`গ্রাহকের অবস্থা হালনাগাদ করুন: ${lead.title}`} value={lead.status} disabled={updateLead.isPending} onChange={event => updateLead.mutate({ id: lead.id, status: event.target.value as "new" | "qualified" | "contacted" | "interested" | "converted" | "lost" }, { onSuccess: () => crmLeads.refetch() })}><option value="new">নতুন</option><option value="qualified">যাচাই করা হয়েছে</option><option value="contacted">যোগাযোগ করা হয়েছে</option><option value="interested">আগ্রহী</option><option value="converted">গ্রাহক হয়েছেন</option><option value="lost">আর এগোয়নি</option></select></div></article>)}</div> : <p className="form-boundary">এখনো কোনো সার্ভারে সংরক্ষিত গ্রাহক নেই। খসড়া তৈরি করে গ্রাহক ব্যবস্থাপনায় সংরক্ষণ করুন।</p>}
          <p className="form-boundary">এখানে খসড়া সংরক্ষণ করলেই কাউকে যোগাযোগ করা হয় না। যোগাযোগের সম্মতি আলাদাভাবে যাচাই ও নথিভুক্ত করতে হবে।</p>
          {saveLead.isError && <p role="alert">{saveLead.error?.message || "Lead সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।"}</p>}
          {updateLead.isError && <p role="alert">গ্রাহকের অবস্থা হালনাগাদ হয়নি। আবার চেষ্টা করুন।</p>}
        </section>
        {compose.isError && <div className="composer-result composer-error" role="alert">AI সেবা থেকে যাচাইযোগ্য উত্তর পাওয়া যায়নি। কোনো নমুনা খসড়া দেখানো হয়নি। পরে আবার চেষ্টা করুন।</div>}
      </div>
    </main>
  );
}
