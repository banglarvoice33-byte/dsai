import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Image, Film, Play, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { CREATIVE_AGENT_REGISTRY, type CreativeMode } from "@shared/creativeAgents";

const labels: Record<CreativeMode, { title: string; subtitle: string; icon: typeof Image }> = {
  "text-to-image": { title: "Text → Image", subtitle: "বাংলা brief থেকে স্থির ভিজ্যুয়াল", icon: Image },
  "text-to-video": { title: "Text → Video", subtitle: "storyboard থেকে bounded motion", icon: Film },
  "image-to-video": { title: "Image → Video", subtitle: "নিজস্ব asset-এর নিরাপদ animation", icon: Play },
};

export default function CreativeStudio() {
  const [mode, setMode] = useState<CreativeMode>("text-to-image");
  const [prompt, setPrompt] = useState("");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false);
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof trpc.creative.preview.useMutation>>["data"]>();
  const previewMutation = trpc.creative.preview.useMutation({ onSuccess: setPreview });
  const agent = CREATIVE_AGENT_REGISTRY.find(item => item.mode === mode)!;
  const ModeIcon = labels[mode].icon;

  return <main className="creative-studio-page">
    <header className="creative-studio-topbar"><Link href="/" className="workspace-back"><ArrowLeft size={15} /> DSAI Workdesk</Link><span className="eyebrow-pill"><Sparkles size={13} /> CREATIVE STUDIO</span><span className="provider-badge">PROVIDER-GATED</span></header>
    <div className="creative-studio-shell">
      <section className="creative-studio-hero"><span className="learn-label">স্বতন্ত্র agent · preview-first · human-gated</span><h1>ভাবনাকে <em>দৃশ্যমান</em> করুন।</h1><p>প্রতিটি মাধ্যমের জন্য আলাদা lead agent, সহযোগী quality ও safety agent, এবং provider output-এর আগে স্বচ্ছ preview। এখনই কোনো generated asset দাবি করা হচ্ছে না—প্রথমে brief, rights, safety ও cost যাচাই হবে।</p></section>
      <section className="creative-mode-grid" aria-label="Creative generation modes">{(Object.keys(labels) as CreativeMode[]).map(item => { const Icon = labels[item].icon; return <button type="button" key={item} className={`creative-mode-card ${mode === item ? "active" : ""}`} onClick={() => { setMode(item); setPreview(undefined); }}><Icon size={20} /><strong>{labels[item].title}</strong><small>{labels[item].subtitle}</small><span>{CREATIVE_AGENT_REGISTRY.find(agentItem => agentItem.mode === item)?.name}</span></button>; })}</section>
      <section className="creative-workspace-grid">
        <div className="creative-brief-card"><div className="creative-card-heading"><div><span className="learn-label">01 / BRIEF</span><h2>{labels[mode].title}</h2></div><ModeIcon size={24} /></div><label htmlFor="creative-prompt">আপনার brief</label><textarea id="creative-prompt" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="উদাহরণ: বর্ষার নদীর ধারে একটি শান্ত, documentary-style দৃশ্য…" rows={7} maxLength={4000} /><div className="creative-checks"><label><Checkbox checked={rightsConfirmed} onCheckedChange={value => setRightsConfirmed(value === true)} /> source / reference-এর অধিকার আমার আছে</label><label><Checkbox checked={safetyAcknowledged} onCheckedChange={value => setSafetyAcknowledged(value === true)} /> safety ও human review gate বুঝেছি</label></div><Button className="primary-button" disabled={previewMutation.isPending || prompt.trim().length < 3} onClick={() => previewMutation.mutate({ mode, prompt, rightsConfirmed, safetyAcknowledged, durationSeconds: mode === "text-to-image" ? undefined : 5 })}>{previewMutation.isPending ? "Preview তৈরি হচ্ছে…" : "Preview plan তৈরি করুন"}</Button></div>
        <div className="creative-plan-card"><div className="creative-card-heading"><div><span className="learn-label">02 / AGENT PLAN</span><h2>{agent.name}</h2></div><ShieldCheck size={24} /></div><p>{agent.outcome}</p><div className="creative-agent-list">{agent.supportAgents.map(support => <div key={support.id}><CheckCircle2 size={14} /><span><strong>{support.id}</strong><small>{support.role}</small></span></div>)}</div><div className="creative-gate-note"><strong>Human gate</strong><span>{agent.humanGate}</span></div></div>
      </section>
      {preview && <section className={`creative-preview-card ${preview.status}`} aria-live="polite"><div><span className="learn-label">03 / REVIEWABLE PLAN</span><h2>{preview.status === "preview-ready" ? "Plan ready — provider output এখনও নয়" : "Plan blocked — আগে gap পূরণ করুন"}</h2><p>{preview.blockedReasons.length ? `Blocked: ${preview.blockedReasons.join(", ")}` : `Estimated budget: ${preview.estimatedCredits} credits · ${preview.durationSeconds ? `${preview.durationSeconds}s` : "single image"}`}</p></div><div className="creative-preview-actions"><span>{preview.providerMode}</span><Button variant="outline" disabled={preview.status !== "preview-ready"}>Human approve & continue</Button></div></section>}
    </div>
  </main>;
}
