import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  Download,
  LockKeyhole,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

type EvidenceStatus = "not-run" | "pending" | "reported-pass" | "reported-fail";
type GateEvidence = {
  id: string;
  label: string;
  category: string;
  description: string;
  status: EvidenceStatus;
  fingerprint: string;
  endpoint: string;
  note: string;
  checkedAt: string;
};

const STORAGE_KEY = "dsai-remote-gate-evidence-v1";
const SENSITIVE_PATTERN = /(password|passwd|secret|token|api[_ -]?key|private[_ -]?key|database[_ -]?url|ssh|cookie|authorization|credential)/i;

const gateDefinitions = [
  ["play", "Play release signing", "Google Play", "Public certificate fingerprint and release-track evidence only."],
  ["edge", "VPS / public edge", "VPS · DNS · TLS · Nginx · systemd", "Public URL response, certificate date, and service status; never paste shell secrets."],
  ["oauth", "OAuth callback", "Authentication", "Final-domain login and callback result without cookies or authorization headers."],
  ["data", "Database readiness", "Runtime data", "Machine-readable readiness result only; never include a connection string."],
  ["provider", "Provider activation", "External providers", "Sandbox/provider status only; no API keys, tokens, or private responses."],
  ["backup", "Backup / restore drill", "Continuity", "Drill timestamp and outcome; no backup archive or database export."],
  ["device", "Physical-device test", "Android / mobile", "Device model, app version, and observed result; no personal data."],
] as const;

function emptyEvidence(): GateEvidence[] {
  return gateDefinitions.map(([id, label, category, description]) => ({
    id,
    label,
    category,
    description,
    status: "not-run",
    fingerprint: "",
    endpoint: "",
    note: "",
    checkedAt: "",
  }));
}

function safeInitialEvidence(): GateEvidence[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return emptyEvidence();
    const parsed = JSON.parse(stored) as GateEvidence[];
    return parsed.length === gateDefinitions.length ? parsed : emptyEvidence();
  } catch {
    return emptyEvidence();
  }
}

function statusLabel(status: EvidenceStatus) {
  if (status === "reported-pass") return "Operator reported pass";
  if (status === "reported-fail") return "Operator reported fail";
  if (status === "pending") return "Pending evidence";
  return "Not checked";
}

function statusClass(status: EvidenceStatus) {
  if (status === "reported-pass") return "border-emerald-700/25 bg-emerald-50 text-emerald-800";
  if (status === "reported-fail") return "border-[#c85a3f]/35 bg-[#f7e5dd] text-[#a23e2b]";
  if (status === "pending") return "border-amber-700/25 bg-amber-50 text-amber-800";
  return "border-[#18241f]/15 bg-[#18241f]/5 text-[#18241f]/60";
}

function containsSensitiveText(value: string) {
  return SENSITIVE_PATTERN.test(value);
}

export default function AdminGateEvidence() {
  const { user, loading } = useAuth();
  const [evidence, setEvidence] = useState<GateEvidence[]>(safeInitialEvidence);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(evidence));
  }, [evidence]);

  const counts = useMemo(() => ({
    reported: evidence.filter((item) => item.status === "reported-pass" || item.status === "reported-fail").length,
    pass: evidence.filter((item) => item.status === "reported-pass").length,
    pending: evidence.filter((item) => item.status === "pending").length,
  }), [evidence]);

  const updateItem = (id: string, patch: Partial<GateEvidence>) => {
    const candidate = { ...evidence.find((item) => item.id === id), ...patch } as GateEvidence;
    const combined = `${candidate.fingerprint} ${candidate.endpoint} ${candidate.note}`;
    if (containsSensitiveText(combined)) {
      setNotice("Sensitive-looking text blocked. Keep passwords, tokens, URLs with credentials, cookies, and private keys outside this console.");
      return;
    }
    setNotice("");
    setEvidence((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const markChecked = (id: string, status: EvidenceStatus) => {
    updateItem(id, { status, checkedAt: new Date().toISOString() });
  };

  const exportHandoff = () => {
    const payload = {
      product: "DSAI",
      type: "operator-reported-remote-gate-evidence",
      generatedAt: new Date().toISOString(),
      warning: "This export is operator-reported evidence, not server-verified production readiness.",
      gates: evidence.map(({ id, label, category, status, fingerprint, endpoint, note, checkedAt }) => ({ id, label, category, status, fingerprint, endpoint, note, checkedAt })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `dsai-remote-gate-evidence-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Non-secret operator handoff exported locally.");
  };

  const copyTemplate = async () => {
    const template = evidence.map((item) => `${item.label}: ${statusLabel(item.status)}${item.checkedAt ? ` @ ${item.checkedAt}` : ""}`).join("\n");
    await navigator.clipboard?.writeText(template);
    setNotice("Status-only summary copied. No secret fields are included.");
  };

  if (loading) return <main className="min-h-screen bg-[#f2eee4] p-8 text-[#18241f]">পরিচয় যাচাই হচ্ছে…</main>;
  if (!user) return <main className="flex min-h-screen items-center justify-center bg-[#f2eee4] p-6 text-[#18241f]"><div className="max-w-md text-center"><LockKeyhole className="mx-auto h-10 w-10 text-[#c85a3f]" /><h1 className="mt-5 font-display text-4xl">প্রথমে পরিচয় নিশ্চিত করুন।</h1><p className="mt-4 text-sm leading-7 text-[#18241f]/65">Remote gate evidence console-এ প্রবেশের জন্য OAuth authentication প্রয়োজন।</p><Button onClick={() => startLogin()} className="mt-8 bg-[#c85a3f]">Sign in / create account</Button></div></main>;
  if (user.role !== "admin") return <main className="flex min-h-screen items-center justify-center bg-[#f2eee4] p-6 text-[#18241f]"><div className="max-w-md text-center"><ShieldCheck className="mx-auto h-10 w-10 text-[#c85a3f]" /><h1 className="mt-5 font-display text-4xl">এই console সীমিত।</h1><p className="mt-4 text-sm leading-7 text-[#18241f]/65">আপনার account-এ admin permission নেই। কোনো evidence বা configuration পরিবর্তন করা হয়নি।</p><Link href="/" className="mt-8 inline-flex border border-[#18241f]/25 px-5 py-3 font-semibold">মূল সাইটে ফিরুন</Link></div></main>;

  return <main className="min-h-screen bg-[#f2eee4] px-5 py-6 text-[#18241f] sm:px-10 lg:px-16"><div className="mx-auto max-w-7xl"><header className="flex flex-col gap-5 border-b border-[#18241f]/15 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><Link href="/admin" className="text-sm text-[#18241f]/60 hover:text-[#c85a3f]">← Admin overview</Link><p className="mt-7 text-xs uppercase tracking-[.25em] text-[#c85a3f]">DSAI / remote gate evidence</p><h1 className="mt-3 max-w-4xl font-display text-5xl leading-[.95] sm:text-7xl">প্রমাণ দিন,<br /><em className="text-[#c85a3f]">secret নয়।</em></h1><p className="mt-5 max-w-3xl text-base leading-8 text-[#18241f]/65">VPS, Play, OAuth, provider, backup এবং device-এর sanitized evidence এখানে draft হিসেবে রাখা যায়। এই console কখনো server-verified PASS বা production approval ঘোষণা করে না।</p></div><div className="flex flex-wrap gap-2"><Button onClick={() => void copyTemplate()} variant="outline" className="border-[#18241f]/25"><ClipboardCopy className="mr-2 h-4 w-4" />Copy summary</Button><Button onClick={exportHandoff} className="bg-[#c85a3f] hover:bg-[#b54d35]"><Download className="mr-2 h-4 w-4" />Export JSON</Button></div></header>
      <section className="mt-8 grid gap-4 sm:grid-cols-3"><div className="border border-[#18241f]/15 bg-white/50 p-5"><p className="text-[10px] uppercase tracking-[.2em] text-[#c85a3f]">Reported evidence</p><strong className="mt-3 block font-display text-4xl">{counts.reported}/{evidence.length}</strong><p className="mt-2 text-xs text-[#18241f]/60">operator-entered; not server-verified</p></div><div className="border border-[#18241f]/15 bg-white/50 p-5"><p className="text-[10px] uppercase tracking-[.2em] text-[#c85a3f]">Reported pass</p><strong className="mt-3 block font-display text-4xl text-emerald-700">{counts.pass}</strong><p className="mt-2 text-xs text-[#18241f]/60">requires independent confirmation</p></div><div className="border border-[#18241f]/15 bg-white/50 p-5"><p className="text-[10px] uppercase tracking-[.2em] text-[#c85a3f]">Pending</p><strong className="mt-3 block font-display text-4xl text-amber-700">{counts.pending}</strong><p className="mt-2 text-xs text-[#18241f]/60">next operator action required</p></div></section>
      {notice && <div role="status" className="mt-6 flex items-start gap-3 border border-[#d7a34b]/45 bg-[#d7a34b]/15 p-4 text-sm leading-6"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#9c7217]" />{notice}</div>}
      <section className="mt-8 grid gap-5 lg:grid-cols-2">{evidence.map((item) => <article key={item.id} className="border border-[#18241f]/15 bg-white/50 p-5 shadow-[0_12px_35px_rgba(24,36,31,.04)]"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.2em] text-[#c85a3f]">{item.category}</p><h2 className="mt-2 font-display text-2xl">{item.label}</h2></div><span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] uppercase tracking-[.1em] ${statusClass(item.status)}`}>{item.status === "reported-pass" ? <CheckCircle2 className="h-3 w-3" /> : null}{statusLabel(item.status)}</span></div><p className="mt-3 text-sm leading-6 text-[#18241f]/65">{item.description}</p><div className="mt-5 grid gap-3"><label className="text-xs font-semibold">Public fingerprint / evidence ID<input value={item.fingerprint} onChange={(event) => updateItem(item.id, { fingerprint: event.target.value })} placeholder="যেমন: SHA256:… (public only)" className="mt-1.5 block w-full border border-[#18241f]/15 bg-[#f2eee4]/70 px-3 py-2.5 text-sm outline-none transition focus:border-[#c85a3f] focus:ring-2 focus:ring-[#c85a3f]/20" /></label><label className="text-xs font-semibold">Public endpoint / result<input value={item.endpoint} onChange={(event) => updateItem(item.id, { endpoint: event.target.value })} placeholder="যেমন: https://…/healthz → 200" className="mt-1.5 block w-full border border-[#18241f]/15 bg-[#f2eee4]/70 px-3 py-2.5 text-sm outline-none transition focus:border-[#c85a3f] focus:ring-2 focus:ring-[#c85a3f]/20" /></label><label className="text-xs font-semibold">Sanitized operator note<textarea value={item.note} onChange={(event) => updateItem(item.id, { note: event.target.value })} placeholder="কী পরীক্ষা হয়েছে, কখন, কী ফল—secret ছাড়া লিখুন" rows={3} className="mt-1.5 block w-full resize-y border border-[#18241f]/15 bg-[#f2eee4]/70 px-3 py-2.5 text-sm outline-none transition focus:border-[#c85a3f] focus:ring-2 focus:ring-[#c85a3f]/20" /></label></div><div className="mt-5 flex flex-wrap items-center gap-2"><Button type="button" size="sm" variant="outline" onClick={() => markChecked(item.id, "pending")} className="border-amber-700/30 text-amber-800">Pending</Button><Button type="button" size="sm" onClick={() => markChecked(item.id, "reported-pass")} className="bg-emerald-700 hover:bg-emerald-800">Reported pass</Button><Button type="button" size="sm" variant="outline" onClick={() => markChecked(item.id, "reported-fail")} className="border-[#c85a3f]/40 text-[#a23e2b]">Reported fail</Button><Button type="button" size="sm" variant="ghost" onClick={() => setEvidence((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "not-run", fingerprint: "", endpoint: "", note: "", checkedAt: "" } : entry))} aria-label={`Clear ${item.label}`}><Trash2 className="h-4 w-4" /></Button></div><p className="mt-3 text-[10px] uppercase tracking-[.12em] text-[#18241f]/45">{item.checkedAt ? `Last entered ${new Date(item.checkedAt).toLocaleString()}` : "No evidence timestamp"}</p></article>)}</section><footer className="mt-10 border-t border-[#18241f]/15 pt-5 text-xs leading-6 text-[#18241f]/55">Safety boundary: never enter private keys, keystore files, passwords, API tokens, database URLs, SSH output containing credentials, cookies, or authorization headers. Use the separate remote-gate runbook to collect evidence, then record only sanitized results here.</footer></div></main>;
}
