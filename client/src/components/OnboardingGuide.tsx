import { useState } from "react";
import { ArrowLeft, ArrowRight, Bot, Check, Loader2, Mic, MicOff, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

const steps = [
  ["শিখুন", "বাংলা utility guide, privacy এবং limits দেখে শুরু করুন."],
  ["দেখুন", "Evidence, method এবং product flow দেখে কাজের পথ বুঝুন."],
  ["চেষ্টা করুন", "একটি narrow task দিয়ে Work Packet শুরু করুন."],
  ["প্রমাণ দিন", "Source/evidence যোগ করে human review-এর জন্য প্রস্তুত করুন."],
  ["ফিরে আসুন", "Export, next action এবং পরের packet-এর জন্য ফিরে আসুন."],
] as const;

export default function OnboardingGuide({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState("");
  const guide = trpc.onboarding.guide.useMutation({ onSuccess: data => setAnswer(data.text) });
  const progress = ((step + 1) / steps.length) * 100;

  const toggleVoice = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setVoiceNotice("এই browser-এ voice input নেই; keyboard ব্যবহার করুন।"); return; }
    if (listening) { setListening(false); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "bn-BD";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => { setListening(true); setVoiceNotice("শুনছি… আপনার প্রশ্ন বলুন।"); };
    recognition.onresult = (event: any) => { const transcript = event.results?.[0]?.[0]?.transcript ?? ""; setQuestion(transcript.slice(0, 600)); setVoiceNotice("Voice প্রশ্ন লেখা হয়েছে; পাঠানোর আগে দেখে নিন।"); };
    recognition.onerror = () => { setListening(false); setVoiceNotice("Voice permission বা microphone পাওয়া যায়নি; keyboard ব্যবহার করুন।"); };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const askGuide = () => {
    if (!user) {
      startLogin();
      return;
    }
    guide.mutate({ step: step + 1, question: question.trim() || undefined });
  };

  return <section className={`onboarding-guide ${compact ? "onboarding-guide-compact" : ""}`} aria-labelledby="onboarding-guide-title">
    <div className="onboarding-guide-header">
      <div><span className="learn-label"><Bot size={13} /> DSAI / AI GUIDE</span><h2 id="onboarding-guide-title">পাঁচ ধাপে Workdesk বুঝে নিন</h2></div>
      <div className={`onboarding-voice-orb ${listening ? "listening" : guide.isPending ? "thinking" : answer ? "answered" : "idle"}`} role="img" aria-label={listening ? "Voice input শুনছে" : guide.isPending ? "AI response তৈরি হচ্ছে" : answer ? "উত্তর প্রস্তুত" : "Guide প্রস্তুত"}><span /><span /><span /></div>
      <span className="onboarding-guide-count" aria-live="polite">{step + 1} / {steps.length}</span>
    </div>
    <div className="onboarding-progress" aria-label={`Onboarding progress: ${step + 1} of ${steps.length}`}><span style={{ width: `${progress}%` }} /></div>
    <div className="onboarding-step-grid">{steps.map(([title, body], index) => <button key={title} type="button" className={`onboarding-step ${index === step ? "active" : ""} ${index < step ? "complete" : ""}`} onClick={() => { setStep(index); setAnswer(""); }} aria-current={index === step ? "step" : undefined}><span>{index < step ? <Check size={13} /> : String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><small>{body}</small></button>)}</div>
    <div className="onboarding-guide-body"><div><p className="onboarding-kicker">এখন আপনার ধাপ</p><h3>{steps[step][0]}</h3><p>{steps[step][1]}</p></div><div className="onboarding-guide-actions"><label htmlFor="onboarding-question">কী জানতে চান?</label><div className="onboarding-voice-row"><input id="onboarding-question" value={question} onChange={event => setQuestion(event.target.value)} placeholder="একটি ছোট প্রশ্ন লিখুন" maxLength={600} /><button type="button" className="onboarding-voice-button" onClick={toggleVoice} aria-pressed={listening} aria-label={listening ? "Voice input বন্ধ করুন" : "Voice input চালু করুন"}>{listening ? <MicOff size={16} /> : <Mic size={16} />}</button></div>{voiceNotice && <small className="onboarding-voice-notice" role="status">{voiceNotice}</small>}<button type="button" className="onboarding-ask-button" onClick={askGuide} disabled={guide.isPending}>{guide.isPending ? <Loader2 className="animate-spin" size={15} /> : <Sparkles size={15} />} {user ? "AI guide জিজ্ঞেস করুন" : "Sign in করে AI guide চালু করুন"}</button></div></div>
    {answer && <div className="onboarding-answer" role="status" aria-live="polite"><Sparkles size={16} /><p>{answer}</p></div>}
    <div className="onboarding-footer"><button type="button" onClick={() => { setStep(value => Math.max(0, value - 1)); setAnswer(""); }} disabled={step === 0} aria-label="আগের ধাপ"><ArrowLeft size={15} /> আগের</button>{step === steps.length - 1 ? <Link href={user ? "/workspace" : "/auth/login"} className="onboarding-next-link">{user ? "Workspace খুলুন" : "Sign in করুন"} <ArrowRight size={15} /></Link> : <button type="button" onClick={() => { setStep(value => Math.min(steps.length - 1, value + 1)); setAnswer(""); }}>পরের ধাপ <ArrowRight size={15} /></button>}</div>
  </section>;
}
