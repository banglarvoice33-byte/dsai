import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Download, Image as ImageIcon, Loader2, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { imageFunction, type GeneratedImage } from "@/lib/supabaseImageClient";

type ImageQuota = { used_today: number; remaining_today: number; daily_limit: 2 };

export default function CreativeStudio() {
  const { user, loading: authLoading } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [quota, setQuota] = useState<ImageQuota | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const loadImages = async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const result = await imageFunction<{ images: GeneratedImage[]; quota: ImageQuota }>({ action: "list" });
      setImages(result.images ?? []);
      setQuota(result.quota ?? null);
      setImageError(null);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "ছবির লাইব্রেরি লোড হয়নি।");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { if (user) void loadImages(); }, [user?.id]);

  const generateImage = async () => {
    setImageLoading(true);
    setImageError(null);
    try {
      await imageFunction({ action: "generate", prompt, aspectRatio });
      setPrompt("");
      await loadImages();
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "ছবি তৈরি করা যায়নি।");
      await loadImages();
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
    <header className="creative-studio-topbar">
      <Link href="/" className="workspace-back"><ArrowLeft size={15} /> DSAI</Link>
      <span className="eyebrow-pill text-[#45564a]"><Sparkles size={13} /> ছবি তৈরি</span>
      <span className="provider-badge">আপনার ছবি</span>
    </header>
    <div className="creative-studio-shell">
      <section className="creative-studio-hero">
        <span className="learn-label">ছবি তৈরি · আপনার ব্যক্তিগত সংগ্রহ</span>
        <h1>ভাবনাকে <em>দৃশ্যমান</em> করুন।</h1>
        <p>বাংলা, বাংলিশ বা ইংরেজিতে ছবির বর্ণনা লিখুন। তৈরি হওয়া ছবি দেখে পছন্দ হলে ডাউনলোড করুন।</p>
      </section>
      <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        ছবি তৈরির সুবিধা সীমিত বিনামূল্যের ব্যবহারের মধ্যে দেওয়া হয়। বর্তমান বিনামূল্যের সুবিধা ২৮ নভেম্বর ২০২৬ পর্যন্ত নির্ধারিত; এরপর যাচাইকৃত বিনামূল্যের বিকল্প না পাওয়া গেলে এটি সাময়িকভাবে বন্ধ থাকবে। কোনো paid বিকল্প স্বয়ংক্রিয়ভাবে চালু হবে না।
      </div>

      {authLoading ? <section className="creative-brief-card"><Loader2 className="animate-spin" /> অ্যাকাউন্ট যাচাই হচ্ছে…</section> : !user ? (
        <section className="creative-brief-card">
          <ShieldCheck size={28} />
          <h2 className="mt-3 text-2xl">ছবি তৈরি করতে লগইন করুন</h2>
          <p className="mt-2 text-sm leading-7 text-[#18241f]/65">লগইন করুন বা নতুন অ্যাকাউন্ট খুলুন। আপনার তৈরি ছবিগুলো আপনার ব্যক্তিগত সংগ্রহে থাকবে।</p>
          <Link href="/auth/login?returnTo=/creative-studio" className="mt-5 inline-flex rounded-xl bg-[#18241f] px-5 py-3 text-sm font-semibold text-white">লগইন / অ্যাকাউন্ট তৈরি</Link>
        </section>
      ) : (
        <>
          <section className="creative-workspace-grid">
            <div className="creative-brief-card">
              <div className="creative-card-heading"><div><span className="learn-label">ছবির বর্ণনা</span><h2>আপনার ছবি তৈরি করুন</h2></div><ImageIcon size={24} /></div>
              <label htmlFor="creative-prompt">ছবির বর্ণনা</label>
              <textarea id="creative-prompt" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="উদাহরণ: বাংলাদেশের বর্ষার নদীর ধারে নরম প্রাকৃতিক আলোয় তোলা একটি বাস্তবধর্মী ছবি…" rows={6} maxLength={4000} />
              <div className="mt-4">
                <label htmlFor="aspect-ratio">ছবির অনুপাত</label>
                <select id="aspect-ratio" value={aspectRatio} onChange={event => setAspectRatio(event.target.value)} className="mt-2 w-full rounded-xl border border-[#18241f]/15 bg-white/70 p-3">
                  <option value="1:1">১:১ বর্গাকার</option><option value="3:2">৩:২ আড়াআড়ি</option><option value="2:3">২:৩ লম্বাটে</option><option value="16:9">১৬:৯ প্রশস্ত</option><option value="9:16">৯:১৬ স্টোরি</option>
                </select>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#18241f]/60">প্রতিদিন সর্বোচ্চ ২টি ছবি তৈরি করতে পারবেন।</p>
              <Button className="primary-button mt-5" disabled={imageLoading || prompt.trim().length < 3 || (quota?.remaining_today ?? 2) < 1 || (quota?.users_today ?? 0) >= 500 && (quota?.used_today ?? 0) === 0} onClick={generateImage}>
                {imageLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> ছবি তৈরি হচ্ছে…</> : <><Sparkles className="mr-2 h-4 w-4" /> ছবি তৈরি করুন</>}
              </Button>
              {imageError && <p role="alert" className="mt-4 rounded-xl border border-[#c85a3f]/30 bg-[#f7e5dd] p-3 text-sm leading-6 text-[#7d2e20]">{imageError}</p>}
            </div>

            <aside className="creative-plan-card">
              <div className="creative-card-heading"><div><span className="learn-label">দৈনিক ব্যবহার</span><h2>আপনার আজকের সীমা</h2></div><ShieldCheck size={24} /></div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/70 p-4"><span className="text-xs text-[#18241f]/55">আপনার ব্যবহার</span><p className="mt-1 text-2xl font-semibold">{quota?.used_today ?? "—"}/2</p></div>
                <div className="rounded-xl bg-white/70 p-4"><span className="text-xs text-[#18241f]/55">আজকের অ্যাকাউন্ট</span><p className="mt-1 text-2xl font-semibold">{quota?.users_today ?? "—"}/500</p></div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#18241f]/65">আজকের সুযোগ শেষ হলে আগামীকাল আবার চেষ্টা করুন।</p>
              <p className="mt-4 text-xs leading-5 text-[#18241f]/55">শুধু সফলভাবে তৈরি হওয়া ছবিই আজকের ব্যবহারে গণনা হবে।</p>
            </aside>
          </section>

          <section className="creative-preview-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><span className="learn-label">আপনার ছবি</span><h2>আপনার তৈরি ছবিগুলো</h2><p>আপনার তৈরি ছবিগুলো এখানে দেখতে ও ডাউনলোড করতে পারবেন।</p></div>
              <Button variant="outline" onClick={() => void loadImages()} disabled={historyLoading}><RefreshCw className="mr-2 h-4 w-4" /> আবার দেখুন</Button>
            </div>
            {historyLoading ? <p className="mt-5 flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> লাইব্রেরি লোড হচ্ছে…</p> : images.length === 0 ? <p className="mt-5 text-sm text-[#18241f]/60">এখনো কোনো ছবি তৈরি হয়নি। প্রথম ছবি তৈরি করলে এখানে দেখা যাবে।</p> : <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{images.map(image => <article key={image.id} className="overflow-hidden rounded-2xl border border-[#18241f]/10 bg-white/60"><div className="aspect-square bg-[#18241f]/5">{image.preview_url ? <img src={image.preview_url} alt={image.prompt} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-sm">ছবি দেখা যাচ্ছে না</div>}</div><div className="p-3"><p className="line-clamp-2 text-sm">{image.prompt}</p><p className="mt-2 text-xs text-[#18241f]/55">{new Date(image.created_at).toLocaleString()}</p><Button variant="outline" className="mt-3 w-full" onClick={() => void downloadImage(image.id)}><Download className="mr-2 h-4 w-4" /> ডাউনলোড</Button></div></article>)}</div>}
          </section>
        </>
      )}
    </div>
  </main>;
}
