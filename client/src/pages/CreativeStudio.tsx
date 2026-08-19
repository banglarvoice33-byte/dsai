import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Film, Image, Play, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { CREATIVE_AGENT_REGISTRY, type CreativeMode } from "@shared/creativeAgents";

const labels: Record<CreativeMode, { title: string; subtitle: string; icon: typeof Image }> = {
  "text-to-image": { title: "Text → 2–3 Images", subtitle: "একটি brief থেকে variation set", icon: Image },
  "text-to-video": { title: "Text → 1 Video", subtitle: "একটি prompt থেকে bounded motion", icon: Film },
  "image-to-video": { title: "Image → 1 Video", subtitle: "একটি source image-এর animation plan", icon: Play },
};

export default function CreativeStudio() {
  const [mode, setMode] = useState<CreativeMode>("text-to-image");
  const [prompt, setPrompt] = useState("");
  const [variationCount, setVariationCount] = useState<2 | 3>(2);
  const [durationSeconds, setDurationSeconds] = useState(5);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [sourceAssetId, setSourceAssetId] = useState("");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false);
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof trpc.creative.preview.useMutation>>["data"]>();
  const previewMutation = trpc.creative.preview.useMutation({ onSuccess: setPreview });
  const agent = CREATIVE_AGENT_REGISTRY.find(item => item.mode === mode)!;
  const ModeIcon = labels[mode].icon;

  const resetMode = (nextMode: CreativeMode) => {
    setMode(nextMode);
    setPreview(undefined);
    setSourceAssetId("");
    setRightsConfirmed(false);
    setSafetyAcknowledged(false);
  };

  const createPreview = () => previewMutation.mutate({ mode, prompt, variationCount: mode === "text-to-image" ? variationCount : undefined, durationSeconds: mode === "text-to-image" ? undefined : durationSeconds, aspectRatio, sourceAssetId: mode === "image-to-video" ? sourceAssetId : undefined, rightsConfirmed, safetyAcknowledged });

  return <main className="creative-studio-page">
    <header className="creative-studio-topbar"><Link href="/" className="workspace-back"><ArrowLeft size={15} /> DSAI Workdesk</Link><span className="eyebrow-pill"><Sparkles size={13} /> CREATIVE STUDIO</span><span className="provider-badge">PROVIDER-GATED</span></header>
    <div className="creative-studio-shell">
      <section className="creative-studio-hero"><span className="learn-label">স্বতন্ত্র agent · preview-first · human-gated</span><h1>ভাবনাকে <em>দৃশ্যমান</em> করুন।</h1><p>একটি text brief থেকে ২–৩টি image variation plan, একটি text-to-video plan অথবা একটি source image থেকে একটি image-to-video plan তৈরি করুন। এখনকার ফলাফল reviewable plan; provider rendering, storage, quota ও export এখনো gated।</p></section>
      <section className="creative-mode-grid" aria-label="Creative generation modes">{(Object.keys(labels) as CreativeMode[]).map(item => { const Icon = labels[item].icon; return <button type="button" key={item} className={`creative-mode-card ${mode === item ? "active" : ""}`} onClick={() => resetMode(item)}><Icon size={20} /><strong>{labels[item].title}</strong><small>{labels[item].subtitle}</small><span>{CREATIVE_AGENT_REGISTRY.find(agentItem => agentItem.mode === item)?.name}</span></button>; })}</section>
      <section className="creative-workspace-grid">
        <div className="creative-brief-card"><div className="creative-card-heading"><div><span className="learn-label">01 / BRIEF</span><h2>{labels[mode].title}</h2></div><ModeIcon size={24} /></div><label htmlFor="creative-prompt">আপনার brief</label><textarea id="creative-prompt" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder={mode === "image-to-video" ? "উদাহরণ: ছবির মানুষটি ধীরে camera-এর দিকে তাকাবে…" : "উদাহরণ: বর্ষার নদীর ধারে একটি শান্ত documentary-style দৃশ্য…"} rows={6} maxLength={4000} />
          {mode === "text-to-image" && <div className="mt-4"><label htmlFor="variation-count">কতটি image variation?</label><select id="variation-count" value={variationCount} onChange={event => setVariationCount(Number(event.target.value) as 2 | 3)} className="mt-2 w-full rounded-xl border border-[#18241f]/15 bg-white/70 p-3"><option value={2}>২টি variation</option><option value={3}>৩টি variation</option></select></div>}
          {mode !== "text-to-image" && <div className="mt-4 grid gap-3 sm:grid-cols-2"><label htmlFor="duration-seconds">Duration<select id="duration-seconds" value={durationSeconds} onChange={event => setDurationSeconds(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-[#18241f]/15 bg-white/70 p-3"><option value={5}>৫ সেকেন্ড</option><option value={10}>১০ সেকেন্ড</option><option value={15}>১৫ সেকেন্ড</option><option value={30}>৩০ সেকেন্ড</option></select></label><label htmlFor="aspect-ratio">Aspect ratio<select id="aspect-ratio" value={aspectRatio} onChange={event => setAspectRatio(event.target.value)} className="mt-2 w-full rounded-xl border border-[#18241f]/15 bg-white/70 p-3"><option value="16:9">16:9 landscape</option><option value="9:16">9:16 portrait</option><option value="1:1">1:1 square</option></select></label></div>}
          {mode === "image-to-video" && <div className="mt-4"><label htmlFor="source-asset">Source image reference</label><input id="source-asset" value={sourceAssetId} onChange={event => setSourceAssetId(event.target.value)} placeholder="আপনার approved image asset ID দিন" className="mt-2 w-full rounded-xl border border-[#18241f]/15 bg-white/70 p-3" /><p className="mt-2 text-xs leading-5 text-[#18241f]/60">এখনো file upload নয়—এটি preview contract পরীক্ষা করার reference field। Secure upload/storage provider gate চালু হলে file picker যুক্ত হবে।</p></div>}
          <div className="creative-checks"><label><Checkbox checked={rightsConfirmed} onCheckedChange={value => setRightsConfirmed(value === true)} /> source / reference-এর অধিকার আমার আছে</label><label><Checkbox checked={safetyAcknowledged} onCheckedChange={value => setSafetyAcknowledged(value === true)} /> safety ও human review gate বুঝেছি</label></div><Button className="primary-button" disabled={previewMutation.isPending || prompt.trim().length < 3} onClick={createPreview}>{previewMutation.isPending ? "Preview তৈরি হচ্ছে…" : "Preview plan তৈরি করুন"}</Button></div>
        <div className="creative-plan-card"><div className="creative-card-heading"><div><span className="learn-label">02 / AGENT PLAN</span><h2>{agent.name}</h2></div><ShieldCheck size={24} /></div><p>{agent.outcome}</p><div className="creative-agent-list">{agent.supportAgents.map(support => <div key={support.id}><CheckCircle2 size={14} /><span><strong>{support.id}</strong><small>{support.role}</small></span></div>)}</div><div className="creative-gate-note"><strong>Human gate</strong><span>{agent.humanGate}</span></div></div>
      </section>
      {preview && <section className={`creative-preview-card ${preview.status}`} aria-live="polite"><div><span className="learn-label">03 / REVIEWABLE PLAN</span><h2>{preview.status === "preview-ready" ? "Plan ready — provider output এখনও নয়" : "Plan blocked — আগে gap পূরণ করুন"}</h2><p>{preview.blockedReasons.length ? `Blocked: ${preview.blockedReasons.join(", ")}` : mode === "text-to-image" ? `${preview.variationCount}টি image variation · ${preview.aspectRatio}` : `${preview.mode === "text-to-video" ? "১টি text-to-video" : "১টি image-to-video"} · ${preview.durationSeconds}s · ${preview.aspectRatio}`}</p></div><div className="creative-preview-actions"><span>{preview.providerMode}</span><Button variant="outline" disabled={preview.status !== "preview-ready"}>Human approve & continue</Button></div>{preview.outputPlan?.length ? <div className="mt-4 grid gap-2 sm:grid-cols-3">{preview.outputPlan.map(plan => <div key={plan.position} className="rounded-xl bg-white/60 p-3 text-sm"><strong>Output {plan.position}</strong><span className="mt-1 block text-xs text-[#18241f]/60">{plan.direction}</span></div>)}</div> : null}</section>}
    </div>
  </main>;
}
