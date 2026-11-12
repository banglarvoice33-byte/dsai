import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Download, Film, Image, Loader2, Play, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { imageFunction, type GeneratedImage } from "@/lib/supabaseImageClient";
import { CREATIVE_AGENT_REGISTRY, type CreativeMode } from "@shared/creativeAgents";

const labels: Record<CreativeMode, { title: string; subtitle: string; icon: typeof Image }> = {
  "text-to-image": { title: "Text → Image", subtitle: "আপনার বর্ণনা থেকে বাস্তব ছবি", icon: Image },
  "text-to-video": { title: "Text → 1 Video", subtitle: "একটি prompt থেকে bounded motion", icon: Film },
  "image-to-video": { title: "Image → 1 Video", subtitle: "একটি source image-এর animation plan", icon: Play },
};

export default function CreativeStudio() {
  const [mode, setMode] = useState<CreativeMode>("text-to-image");
  const [prompt, setPrompt] = useState("");
  const [variationCount, setVariationCount] = useState<2 | 3>(2);
  const [durationSeconds, setDurationSeconds] = useState(5);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [sourceAssetId, setSourceAssetId] = useState("");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false);
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof trpc.creative.preview.useMutation>>["data"]>();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [generated, setGenerated] = useState<{ id: string; download_url: string; provider_cost_usd: number | null } | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [imageError, setImageError] = useState<string | null>(null);
  const previewMutation = trpc.creative.preview.useMutation({ onSuccess: setPreview });
  const agent = CREATIVE_AGENT_REGISTRY.find(item => item.mode === mode)!;
  const ModeIcon = labels[mode].icon;

  const loadImages = async () => {
    setHistoryLoading(true);
    try {
      const result = await imageFunction<{ images: GeneratedImage[] }>({ action: "list" });
      setImages(result.images ?? []);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Image history load হয়নি।");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { void loadImages(); }, []);

  const resetMode = (nextMode: CreativeMode) => {
    setMode(nextMode);
    setPreview(undefined);
    setGenerated(null);
    setSourceAssetId("");
    setRightsConfirmed(false);
    setSafetyAcknowledged(false);
    setImageError(null);
  };

  const createPreview = () => previewMutation.mutate({ mode, prompt, variationCount: mode === "text-to-image" ? variationCount : undefined, durationSeconds: mode === "text-to-image" ? undefined : durationSeconds, aspectRatio, sourceAssetId: mode === "image-to-video" ? sourceAssetId : undefined, rightsConfirmed, safetyAcknowledged });

  const generateImage = async () => {
    setImageLoading(true);
    setImageError(null);
    setGenerated(null);
    try {
      const result = await imageFunction<{ id: string; download_url: string; provider_cost_usd: number | null }>({ action: "generate", prompt, aspectRatio });
      setGenerated(result);
      await loadImages();
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "ছবি তৈরি করা যায়নি।");
    } finally {
      setImageLoading(false);
    }
  };

  const downloadImage = async (imageId: string) => {
    try {
      const result = await imageFunction<{ download_url: string }>({ action: "download", imageId });
      window.location.assign(result.download_url);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "ডাউনলোড লিংক তৈরি হয়নি।");
    }
  };

  return <main className="creative-studio-page">
    <header className="creative-studio-topbar"><Link href="/" className="workspace-back"><ArrowLeft size={15} /> DSAI Workdesk</Link><span className="eyebrow-pill text-[#45564a]"><Sparkles size={13} /> CREATIVE STUDIO</span><span className="provider-badge">SUPABASE STORAGE</span></header>
    <div className="creative-studio-shell">
      <section className="creative-studio-hero"><span className="learn-label">বাস্তব image generation · private storage · download</span><h1>ভাবনাকে <em>দৃশ্যমান</em> করুন।</h1><p>বাংলা, Banglish বা English-এ বর্ণনা লিখুন। DSAI বাস্তব AI image তৈরি করে আপনার private Supabase storage-এ রাখবে। Vercel শুধু এই studio interface দেখাবে—image processing Vercel-এ হবে না।</p></section>
      <section className="creative-mode-grid" aria-label="Creative generation modes">{(Object.keys(labels) as CreativeMode[]).map(item => { const Icon = labels[item].icon; return <button type="button" key={item} className={`creative-mode-card ${mode === item ? "active" : ""}`} onClick={() => resetMode(item)}><Icon size={20} /><strong>{labels[item].title}</strong><small>{labels[item].subtitle}</small><span>{CREATIVE_AGENT_REGISTRY.find(agentItem => agentItem.mode === item)?.name}</span></button>; })}</section>
      <section className="creative-workspace-grid">
        <div className="creative-brief-card"><div className="creative-card-heading"><div><span className="learn-label">01 / BRIEF</span><h2>{labels[mode].title}</h2></div><ModeIcon size={24} /></div><label htmlFor="creative-prompt">আপনার brief</label><textarea id="creative-prompt" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder={mode === "image-to-video" ? "উদাহরণ: ছবির মানুষটি ধীরে camera-এর দিকে তাকাবে…" : "উদাহরণ: বাংলাদেশের বর্ষার নদীর ধারে একটি cinematic documentary photograph…"} rows={6} maxLength={4000} />
          {mode === "text-to-image" && <div className="mt-4"><label htmlFor="aspect-ratio">ছবির অনুপাত</label><select id="aspect-ratio" value={aspectRatio} onChange={event => setAspectRatio(event.target.value)} className="mt-2 w-full rounded-xl border border-[#18241f]/15 bg-white/70 p-3"><option value="1:1">1:1 Square</option><option value="3:2">3:2 Landscape</option><option value="2:3">2:3 Portrait</option><option value="16:9">16:9 Wide</option><option value="9:16">9:16 Story</option></select><p className="mt-2 text-xs text-[#18241f]/60">প্রতি ইউজার দিনে সর্বোচ্চ ৩টি ছবি। প্রতি বারে ১টি 1K PNG তৈরি হবে।</p></div>}
          {mode !== "text-to-image" && <div className="mt-4 grid gap-3 sm:grid-cols-2"><label htmlFor="duration-seconds">Duration<select id="duration-seconds" value={durationSeconds} onChange={event => setDurationSeconds(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-[#18241f]/15 bg-white/70 p-3"><option value={5}>৫ সেকেন্ড</option><option value={10}>১০ সেকেন্ড</option><option value={15}>১৫ সেকেন্ড</option><option value={30}>৩০ সেকেন্ড</option></select></label><label htmlFor="aspect-ratio-video">Aspect ratio<select id="aspect-ratio-video" value={aspectRatio} onChange={event => setAspectRatio(event.target.value)} className="mt-2 w-full rounded-xl border border-[#18241f]/15 bg-white/70 p-3"><option value="16:9">16:9 landscape</option><option value="9:16">9:16 portrait</option><option value="1:1">1:1 square</option></select></label></div>}
          {mode === "image-to-video" && <div className="mt-4"><label htmlFor="source-asset">Source image reference</label><input id="source-asset" value={sourceAssetId} onChange={event => setSourceAssetId(event.target.value)} placeholder="আপনার approved image asset ID দিন" className="mt-2 w-full rounded-xl border border-[#18241f]/15 bg-white/70 p-3" /></div>}
          <div className="creative-checks"><label><Checkbox checked={rightsConfirmed} onCheckedChange={value => setRightsConfirmed(value === true)} /> source / reference-এর অধিকার আমার আছে</label><label><Checkbox checked={safetyAcknowledged} onCheckedChange={value => setSafetyAcknowledged(value === true)} /> safety ও human review gate বুঝেছি</label></div>
          {mode === "text-to-image" ? <Button className="primary-button" disabled={imageLoading || prompt.trim().length < 3} onClick={generateImage}>{imageLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> ছবি তৈরি হচ্ছে…</> : <><Sparkles className="mr-2 h-4 w-4" /> বাস্তব ছবি তৈরি করুন</>}</Button> : <Button className="primary-button" disabled={previewMutation.isPending || prompt.trim().length < 3} onClick={createPreview}>{previewMutation.isPending ? "Preview তৈরি হচ্ছে…" : "Preview plan তৈরি করুন"}</Button>}
          {imageError && <p role="alert" className="mt-4 rounded-xl border border-[#c85a3f]/30 bg-[#f7e5dd] p-3 text-sm leading-6 text-[#7d2e20]">{imageError}</p>}
        </div>
        <div className="creative-plan-card"><div className="creative-card-heading"><div><span className="learn-label">02 / AGENT PLAN</span><h2>{agent.name}</h2></div><ShieldCheck size={24} /></div><p>{agent.outcome}</p><div className="creative-agent-list">{agent.supportAgents.map(support => <div key={support.id}><CheckCircle2 size={14} /><span><strong>{support.id}</strong><small>{support.role}</small></span></div>)}</div><div className="creative-gate-note"><strong>Human gate</strong><span>{agent.humanGate}</span></div></div>
      </section>

      {generated && <section className="creative-preview-card preview-ready" aria-live="polite"><div><span className="learn-label">03 / GENERATED IMAGE</span><h2>আপনার ছবি তৈরি হয়েছে</h2><p>ছবিটি private Supabase Storage-এ সংরক্ষিত। ডাউনলোড লিংক অল্প সময়ের জন্য বৈধ।</p></div><div className="creative-preview-actions"><Button onClick={() => void downloadImage(generated.id)}><Download className="mr-2 h-4 w-4" /> Download PNG</Button></div></section>}

      {preview && <section className={`creative-preview-card ${preview.status}`} aria-live="polite"><div><span className="learn-label">03 / REVIEWABLE PLAN</span><h2>{preview.status === "preview-ready" ? "Plan ready — provider output এখনও নয়" : "Plan blocked — আগে gap পূরণ করুন"}</h2><p>{preview.blockedReasons.length ? `Blocked: ${preview.blockedReasons.join(", ")}` : `${preview.mode === "text-to-video" ? "১টি text-to-video" : "১টি image-to-video"} · ${preview.durationSeconds}s · ${preview.aspectRatio}`}</p></div><div className="creative-preview-actions"><span>{preview.providerMode}</span><Button variant="outline" disabled>Human approve & continue</Button></div>{preview.outputPlan?.length ? <div className="mt-4 grid gap-2 sm:grid-cols-3">{preview.outputPlan.map(plan => <div key={plan.position} className="rounded-xl bg-white/60 p-3 text-sm"><strong>Output {plan.position}</strong><span className="mt-1 block text-xs text-[#18241f]/60">{plan.direction}</span></div>)}</div> : null}</section>}

      <section className="creative-preview-card"><div className="flex flex-wrap items-center justify-between gap-3"><div><span className="learn-label">04 / MY IMAGE LIBRARY</span><h2>আপনার তৈরি ছবিগুলো</h2><p>শুধু আপনার guest session-এর ছবিগুলো এখানে দেখা যাবে।</p></div><Button variant="outline" onClick={() => void loadImages()} disabled={historyLoading}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button></div>
        {historyLoading ? <p className="mt-5 flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Library লোড হচ্ছে…</p> : images.length === 0 ? <p className="mt-5 text-sm text-[#18241f]/60">এখনো কোনো ছবি তৈরি হয়নি। প্রথম ছবিটি তৈরি করলে এখানে দেখা যাবে।</p> : <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{images.map(image => <article key={image.id} className="overflow-hidden rounded-2xl border border-[#18241f]/10 bg-white/60"><div className="aspect-square bg-[#18241f]/5">{image.preview_url ? <img src={image.preview_url} alt={image.prompt} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-sm">Preview unavailable</div>}</div><div className="p-3"><p className="line-clamp-2 text-sm">{image.prompt}</p><p className="mt-2 text-xs text-[#18241f]/55">{new Date(image.created_at).toLocaleString()}</p><Button variant="outline" className="mt-3 w-full" onClick={() => void downloadImage(image.id)}><Download className="mr-2 h-4 w-4" /> Download</Button></div></article>)}</div>}
      </section>
    </div>
  </main>;
}
