import { useEffect, useState } from "react";
import { Check, Circle, FileCheck2, MousePointer2, Sparkles } from "lucide-react";

const steps = [
  ["শিখুন", "কাজের পথ বুঝুন"],
  ["দেখুন", "প্রমাণ ও সীমা দেখুন"],
  ["চেষ্টা করুন", "একটি packet শুরু করুন"],
  ["প্রমাণ দিন", "Evidence review করুন"],
  ["ফিরে আসুন", "পরের action নিন"],
] as const;

export default function LaunchFunnelInteractive() {
  const [active, setActive] = useState(2);
  const [success, setSuccess] = useState(false);
  useEffect(() => { if (!success) return; const timer = window.setTimeout(() => setSuccess(false), 2400); return () => window.clearTimeout(timer); }, [success]);
  const complete = () => { setSuccess(true); setActive(value => Math.min(4, value + 1)); };
  return <section className="launch-interactive" aria-labelledby="launch-interactive-title"><div className="launch-interactive-head"><div><span className="learn-label"><MousePointer2 size={13} /> TRY / PROVE LAB</span><h2 id="launch-interactive-title">কাজ শুরু হলে progress দেখা যাবে</h2></div><span className="launch-live-status" role="status" aria-live="polite">{success ? "ধাপ সম্পন্ন ✓" : `${active + 1} / ${steps.length} ধাপ`}</span></div><div className="launch-progress-track" aria-label={`Launch funnel progress: ${active + 1} of ${steps.length}`}><span style={{ width: `${((active + 1) / steps.length) * 100}%` }} /></div><div className="launch-step-row">{steps.map(([title, subtitle], index) => <button key={title} type="button" className={`launch-step-card ${index === active ? "active" : ""} ${index < active ? "done" : ""}`} onClick={() => { setActive(index); setSuccess(false); }}><span className="launch-step-icon">{index < active ? <Check size={14} /> : index === active ? <Sparkles size={14} /> : <Circle size={12} />}</span><strong>{title}</strong><small>{subtitle}</small></button>)}</div><div className={`launch-action-card ${success ? "success" : ""}`}><div>{success ? <FileCheck2 size={22} /> : <Sparkles size={22} />}<div><strong>{success ? "আপনার review signal সংরক্ষিত হয়েছে" : steps[active][0]}</strong><p>{success ? "এটি কোনো external submission নয়; পরের ধাপ আপনার control-এ থাকবে।" : steps[active][1]}</p></div></div><button type="button" onClick={complete}>{success ? "পরের ধাপ দেখুন" : active === 3 ? "Evidence review সম্পন্ন" : "এই ধাপটি সম্পন্ন"}</button></div></section>;
}
