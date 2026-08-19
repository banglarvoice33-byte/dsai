import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, FileText, Loader2, LockKeyhole, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "warm" | "green" }) {
  return <span className={`workspace-status workspace-status-${tone}`}>{children}</span>;
}

export default function Workspace() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activePanel, setActivePanel] = useState<"overview" | "access" | "creative">("overview");
  const [accessTitle, setAccessTitle] = useState("");
  const [creativePrompt, setCreativePrompt] = useState("");
  const accessCases = trpc.access.list.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const creativeRequests = trpc.creative.list.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const accessCreate = trpc.access.create.useMutation({ onSuccess: () => { setAccessTitle(""); void accessCases.refetch(); toast.success("UAA case draft তৈরি হয়েছে।"); }, onError: error => toast.error(error.message) });
  const creativeCreate = trpc.creative.request.useMutation({ onSuccess: () => { setCreativePrompt(""); void creativeRequests.refetch(); toast.success("Creative request queue-তে যোগ হয়েছে।"); }, onError: error => toast.error(error.message) });

  if (loading) return <main className="workspace-page workspace-loading"><Loader2 className="animate-spin" /><span>আপনার workspace প্রস্তুত হচ্ছে…</span></main>;
  if (!user) return <main className="workspace-page workspace-auth"><div className="workspace-auth-card"><LockKeyhole size={25} /><span className="learn-label">DSAI / PRIVATE WORKSPACE</span><h1>আপনার কাজের<br /><em>জায়গা</em> এখানে।</h1><p>UAA case এবং Creative request দেখতে sign in করুন। কোনো external submission স্বয়ংক্রিয়ভাবে হবে না।</p><Button onClick={() => startLogin()} className="btn-primary">Sign in / create account <ArrowRight size={16} /></Button><Link href="/" className="workspace-back"><ArrowLeft size={15} /> মূল সাইটে ফিরুন</Link></div></main>;

  const cases = accessCases.data ?? [];
  const requests = creativeRequests.data ?? [];
  const total = cases.length + requests.length;
  const exportWorkspace = () => {
    const payload = { exportedAt: new Date().toISOString(), scope: "user-owned-workspace-records", accessCases: cases, creativeRequests: requests };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dsai-workspace-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("আপনার workspace export প্রস্তুত হয়েছে।");
  };

  return <main className="workspace-page"><header className="workspace-topbar"><Link href="/" className="workspace-brand"><span className="workspace-brand-mark">D</span><span>DSAI <small>WORKSPACE</small></span></Link><div className="workspace-user"><span>{user.name || user.email || "Signed in user"}</span><button onClick={() => setLocation("/privacy#deletion-request")}>Data rights</button></div></header><div className="workspace-shell"><section className="workspace-welcome"><div><span className="eyebrow-pill"><span className="pulse-dot" />Private · human-gated</span><h1>আপনার কাজের<br /><em>পরবর্তী ধাপ</em>।</h1><p>এক জায়গায় আপনার UAA draft, creative request এবং তাদের current status দেখুন।</p></div><div className="workspace-safety"><LockKeyhole size={18} /><strong>কোনো auto-submit নেই।</strong><span>AI draft করে; আপনি review করে এগোন।</span></div></section><nav className="workspace-tabs" aria-label="Workspace sections"><button className={activePanel === "overview" ? "active" : ""} onClick={() => setActivePanel("overview")}>Overview</button><button className={activePanel === "access" ? "active" : ""} onClick={() => setActivePanel("access")}>UAA cases <b>{cases.length}</b></button><button className={activePanel === "creative" ? "active" : ""} onClick={() => setActivePanel("creative")}>Creative queue <b>{requests.length}</b></button></nav>
    {activePanel === "overview" && <><section className="workspace-stats"><article><span>ALL WORK</span><strong>{total}</strong><small>আপনার saved workflow</small></article><article><span>ACCESS DRAFTS</span><strong>{cases.length}</strong><small>বুঝুন ও প্রস্তুত হন</small></article><article><span>CREATIVE REQUESTS</span><strong>{requests.length}</strong><small>ভাবুন ও তৈরি করুন</small></article></section><section className="workspace-export-bar"><div><strong>আপনার কাজ আপনার কাছে থাকুক</strong><span>শুধু আপনার workspace records-এর একটি JSON copy download করুন।</span></div><Button variant="outline" onClick={exportWorkspace} disabled={!total}><Download size={15} /> Export workspace</Button></section><section className="workspace-actions"><article><FileText size={20} /><div><h2>নতুন Access case</h2><p>Notice, form বা document-এর কাজকে একটি reviewable draft-এ আনুন।</p></div><Button onClick={() => setActivePanel("access")} className="workspace-action-button">শুরু করুন <ArrowRight size={15} /></Button></article><article><Sparkles size={20} /><div><h2>নতুন Creative request</h2><p>বাংলা বা English brief queue-তে দিন। Generation provider এখনো gated।</p></div><Button onClick={() => setActivePanel("creative")} className="workspace-action-button">Brief দিন <ArrowRight size={15} /></Button></article></section></>}
    {activePanel === "access" && <section className="workspace-panel"><div className="workspace-panel-heading"><div><span className="learn-label">UAA / ACCESS</span><h2>আপনার Access cases</h2><p>প্রতিটি case draft; কোনো government, legal বা external submission নয়।</p></div><StatusPill tone="green"><CheckCircle2 size={13} /> human review</StatusPill></div><form className="workspace-create-form" onSubmit={event => { event.preventDefault(); accessCreate.mutate({ title: accessTitle, workflow: "document", language: "bn", riskLevel: "medium" }); }}><label htmlFor="workspace-access-title">নতুন case-এর নাম</label><div><input id="workspace-access-title" required maxLength={180} value={accessTitle} onChange={event => setAccessTitle(event.target.value)} placeholder="যেমন: সরকারি ফর্ম বুঝতে চাই" /><Button type="submit" disabled={accessCreate.isPending}><Plus size={15} /> {accessCreate.isPending ? "সংরক্ষণ হচ্ছে…" : "Draft তৈরি"}</Button></div></form><div className="workspace-records">{accessCases.isLoading ? <div className="workspace-empty"><Loader2 className="animate-spin" /></div> : accessCases.isError ? <div className="workspace-empty"><h3>Cases লোড হয়নি</h3><p>আবার চেষ্টা করুন।</p><Button variant="outline" onClick={() => void accessCases.refetch()}>Retry</Button></div> : cases.length ? cases.map(item => <article className="workspace-record" key={item.id}><div className="workspace-record-icon"><FileText size={16} /></div><div><h3>{item.title}</h3><p>{new Date(item.createdAt).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" })} · {item.workflow}</p></div><StatusPill tone={item.status === "ready" ? "green" : "warm"}>{item.status}</StatusPill></article>) : <div className="workspace-empty"><FileText size={22} /><h3>এখনো কোনো Access case নেই।</h3><p>প্রথম case তৈরি করলে এটি এখানে status সহ দেখা যাবে।</p></div>}</div></section>}
    {activePanel === "creative" && <section className="workspace-panel"><div className="workspace-panel-heading"><div><span className="learn-label">CREATIVE / QUEUE</span><h2>আপনার Creative requests</h2><p>Queue status দেখা যাবে; output generation/provider connection আলাদা launch gate।</p></div><StatusPill tone="warm"><Sparkles size={13} /> provider-gated</StatusPill></div><form className="workspace-create-form" onSubmit={event => { event.preventDefault(); creativeCreate.mutate({ prompt: creativePrompt, tier: "free" }); }}><label htmlFor="workspace-creative-prompt">Creative brief</label><div><textarea id="workspace-creative-prompt" required maxLength={4000} rows={3} value={creativePrompt} onChange={event => setCreativePrompt(event.target.value)} placeholder="বাংলায় একটি editorial poster-এর ভাবনা লিখুন" /><Button type="submit" disabled={creativeCreate.isPending}><Plus size={15} /> {creativeCreate.isPending ? "Queue হচ্ছে…" : "Queue-তে দিন"}</Button></div></form><div className="workspace-records">{creativeRequests.isLoading ? <div className="workspace-empty"><Loader2 className="animate-spin" /></div> : creativeRequests.isError ? <div className="workspace-empty"><h3>Creative queue লোড হয়নি</h3><p>আবার চেষ্টা করুন।</p><Button variant="outline" onClick={() => void creativeRequests.refetch()}>Retry</Button></div> : requests.length ? requests.map(item => <article className="workspace-record" key={item.id}><div className="workspace-record-icon creative"><Sparkles size={16} /></div><div><h3>{item.prompt}</h3><p>{new Date(item.createdAt).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" })} · {item.tier}</p></div><StatusPill tone="warm">{item.status}</StatusPill></article>) : <div className="workspace-empty"><Sparkles size={22} /><h3>এখনো কোনো Creative request নেই।</h3><p>একটি brief queue-তে দিলে current request status এখানে দেখা যাবে।</p></div>}</div></section>}
  </div></main>;
}
