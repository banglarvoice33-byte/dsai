import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, FileWarning, LockKeyhole, RefreshCw, ShieldCheck, Trash2, XCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { mockDeleteObject, mockMalwareScan, type MockScanMode } from "@shared/mockSecurity";

type Stage = "idle" | "quarantined" | "scanning" | "clean" | "infected" | "retryable" | "deleting" | "deleted";
type ScanLog = { id: string; filename: string; verdict: string; time: string; scanId: string; };


export default function SecurityLifecycleLab() {
  const [filename, setFilename] = useState("report.pdf");
  const [mode, setMode] = useState<MockScanMode>("clean");
  const [stage, setStage] = useState<Stage>("idle");
  const [attempt, setAttempt] = useState(0);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Mock API ready — no real object storage or scanner is contacted.");
  const [scanHistory, setScanHistory] = useState<ScanLog[]>([]);
  const timerRef = useRef<number | undefined>(undefined);
  const clearTimer = () => { if (timerRef.current) window.clearInterval(timerRef.current); timerRef.current = undefined; };
  const addScanLog = (verdict: string, scanId: string) => setScanHistory(history => [{ id: `${scanId}-${Date.now()}`, filename, verdict, scanId, time: new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }) }, ...history].slice(0, 8));
  useEffect(() => () => clearTimer(), []);
  const runScan = (scanMode = mode) => {
    clearTimer();
    setStage("quarantined"); setProgress(8); setMessage("Object accepted into user quarantine namespace. Downstream processing is blocked.");
    window.setTimeout(() => {
      setStage("scanning"); setProgress(18); setAttempt(value => value + 1); setMessage("Mock scanner is inspecting the quarantined object…");
      timerRef.current = window.setInterval(() => setProgress(value => value >= 88 ? value : value + 7), 180);
      window.setTimeout(() => {
        clearTimer(); setProgress(100);
        const result = mockMalwareScan({ filename, mode: scanMode, attempt: attempt + 1 });
        if (result.verdict === "clean") { addScanLog("Clean", result.scanId); setStage("clean"); setMessage(`${result.message} ${result.scanId}`); toast.success("Mock scan complete", { description: "Clean verdict — downstream processing may proceed in test mode." }); }
        else if (result.verdict === "infected") { addScanLog("Infected", result.scanId); setStage("infected"); setMessage(`${result.message} ${result.scanId}`); toast.error("Mock threat detected", { description: "Object remains isolated. Delete it to complete the test flow." }); }
        else { addScanLog("Provider error", result.scanId); setStage("retryable"); setMessage(`${result.message} ${result.scanId}`); toast.error("Mock scanner error", { description: "The file is still quarantined; retry is available." }); }
      }, 2100);
    }, 260);
  };
  const retry = () => { setMode("clean"); runScan("clean"); };
  const deleteObject = () => {
    clearTimer(); setStage("deleting"); setProgress(12); setMessage("Mock storage deletion started; metadata remains as a tombstone.");
    timerRef.current = window.setInterval(() => setProgress(value => value >= 94 ? value : value + 14), 160);
    window.setTimeout(() => { clearTimer(); setProgress(100); const result = mockDeleteObject({ assetId: 42, attempt: attempt + 1 }); setStage("deleted"); setMessage(`${result.message} ${result.deletionId}`); toast.success("Mock deletion complete", { description: "Content is not preserved; the metadata tombstone remains retryable." }); }, 1100);
  };
  const stageLabel = { idle: "Ready", quarantined: "Quarantined", scanning: "Scanning", clean: "Clean", infected: "Infected", retryable: "Retryable error", deleting: "Deleting", deleted: "Deleted + tombstone" }[stage];
  const busy = stage === "scanning" || stage === "deleting";
  return <main className="security-lab-page"><header className="security-lab-topbar"><Link href="/platform" className="workspace-back">← Platform</Link><span className="eyebrow-pill"><span className="pulse-dot" />Mock API · isolated test mode</span></header><div className="security-lab-shell"><section className="security-lab-hero"><div><span className="learn-label">DSAI / SECURITY LAB</span><h1>স্ক্যান করুন,<br /><em>তারপর মুছুন</em>।</h1><p>এই Mock API lab-এ clean, infected এবং provider error verdict পরীক্ষা করা যায়। কোনো বাস্তব malware scanner, S3 object বা user file স্পর্শ করা হয় না।</p></div><div className="security-lab-integrity"><ShieldCheck size={20} /><strong>Fail-closed simulation</strong><span>Quarantine → verdict → deletion tombstone</span></div></section><section className="security-lab-card"><div className="security-lab-controls"><span className="learn-label">01 / MOCK UPLOAD</span><label>File name<input value={filename} onChange={event => setFilename(event.target.value)} aria-label="Mock file name" /></label><label>Mock API verdict<select value={mode} onChange={event => setMode(event.target.value as MockScanMode)} aria-label="Mock verdict"><option value="clean">Clean</option><option value="infected">Infected</option><option value="error">Provider error</option></select></label><Button type="button" className="btn-primary" onClick={() => runScan()} disabled={busy}><ShieldCheck size={15} /> Upload & scan</Button></div>{busy && <div className="security-progress" aria-label={`${stageLabel} progress`}><div className="security-progress-label"><span>{stageLabel}…</span><strong>{progress}%</strong></div><div className="security-progress-track"><span style={{ width: `${progress}%` }} /></div></div>}<div className="security-lab-flow"><div className={`security-stage ${stage === "quarantined" || stage === "scanning" ? "active" : ""}`}><LockKeyhole size={17} /><span>Quarantine</span><small>blocked by default</small></div><div className="security-stage-arrow">→</div><div className={`security-stage ${stage === "clean" ? "success" : stage === "infected" ? "danger" : stage === "retryable" ? "warning" : stage === "scanning" ? "active" : ""}`}><FileWarning size={17} /><span>{stage === "idle" ? "Scan verdict" : stageLabel}</span><small>{stage === "clean" ? "processing allowed" : "no downstream access"}</small></div><div className="security-stage-arrow">→</div><div className={`security-stage ${stage === "deleting" ? "active" : stage === "deleted" ? "success" : ""}`}><Trash2 size={17} /><span>Deletion</span><small>tombstone retained</small></div></div><section className="security-log-viewer" aria-label="Scan history"><div className="security-log-head"><span className="learn-label">SCAN HISTORY</span><strong>{scanHistory.length ? `${scanHistory.length} previous results` : "No completed scans"}</strong></div>{scanHistory.length ? <div className="security-log-list">{scanHistory.map(log => <div className="security-log-row" key={log.id}><span className={`security-log-dot ${log.verdict === "Clean" ? "clean" : log.verdict === "Infected" ? "infected" : "error"}`} /><div><strong>{log.filename}</strong><small>{log.verdict} · {log.time}</small></div><code>{log.scanId}</code></div>)}</div> : <p className="security-log-empty">স্ক্যান সম্পন্ন হলে পূর্ববর্তী verdict এখানে দেখা যাবে।</p>}</section><div className="security-lab-status" role="status" aria-live="polite">{stage === "clean" ? <CheckCircle2 /> : stage === "infected" ? <XCircle /> : stage === "retryable" ? <RefreshCw /> : <AlertTriangle />}<span>{message}</span></div><div className="security-lab-actions">{stage === "retryable" && <Button type="button" variant="outline" onClick={retry}><RefreshCw size={15} /> Retry with clean mock</Button>}{stage === "infected" && <Button type="button" variant="outline" onClick={deleteObject}><Trash2 size={15} /> Isolate & delete mock object</Button>}{stage === "clean" && <span className="security-lab-safe-note"><CheckCircle2 size={15} /> Clean verdict ছাড়া কোনো processing নয়</span>}{stage === "deleted" && <span className="security-lab-safe-note"><LockKeyhole size={15} /> Metadata tombstone retained; content not preserved</span>}</div></section><section className="security-lab-contract"><span className="learn-label">TEST CONTRACT</span><h2>Provider error কখনো clean নয়</h2><p>Mock API শুধু contract validation-এর জন্য। Production scanner adapter, signed callback, object deletion provider, retry worker এবং operator evidence আলাদাভাবে configure না হওয়া পর্যন্ত file intake fail-closed থাকবে।</p></section></div></main>;
}
