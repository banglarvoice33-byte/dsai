import { useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, ExternalLink, Loader2, LockKeyhole, Play, ShieldCheck, XCircle } from "lucide-react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { DSAI_AGENT_REGISTRY } from "@shared/agentRegistry";

const statusLabel: Record<string, string> = {
  queued: "অপেক্ষমাণ",
  running: "প্রক্রিয়াধীন",
  retry_wait: "পুনরায় চেষ্টার অপেক্ষায়",
  completed: "সম্পন্ন",
  failed: "ব্যর্থ",
  cancelled: "বাতিল",
};

export default function AgentDetail() {
  const [, params] = useRoute("/agents/:id");
  const agent = DSAI_AGENT_REGISTRY.find(item => item.id === params?.id) || DSAI_AGENT_REGISTRY[0];
  const [taskPrompt, setTaskPrompt] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Use the existing owner-scoped, durable WorkDesk queue. This is a real
  // single-model AI draft, not a simulated multi-agent orchestration.
  const tasks = trpc.workDesk.textTasks.useQuery({ limit: 30 }, {
    retry: false,
    refetchInterval: query => query.state.data?.some(task => ["queued", "running", "retry_wait"].includes(task.status)) ? 5000 : 15000,
    refetchIntervalInBackground: false,
    staleTime: 5000,
  });
  const createTask = trpc.workDesk.createTextTask.useMutation({
    onSuccess: async result => {
      setSelectedTaskId(result.id);
      setTaskPrompt("");
      await tasks.refetch();
    },
  });
  const activeTask = tasks.data?.find(task => task.id === selectedTaskId) ?? null;

  const runTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const request = taskPrompt.trim();
    if (request.length < 3 || createTask.isPending) return;
    const prompt = [
      `তুমি DSAI Work Desk-এর single-model draft assistant। নিচের বিভাগীয় দায়িত্বের জন্য শুধু বিশ্লেষণ/খসড়া তৈরি করবে; কোনো বাহ্যিক API action, ইমেইল, CRM update, payment, submission, approval বা account পরিবর্তন করবে না।`,
      `Agent: ${agent.name} (${agent.department})`,
      `Outcome: ${agent.outcome}`,
      `Declared tools (not invoked by this task): ${agent.tools.join(", ")}`,
      `Required evidence: ${agent.evidence}`,
      `Human gate: ${agent.humanGate}`,
      `Stop conditions: ${agent.stopConditions.join("; ")}`,
      "Output: বাংলায় একটি পর্যালোচনাযোগ্য draft, assumptions, missing evidence, risks এবং human review checklist. কখনো দাবি করবে না যে কোনো external tool বা supporting model চালানো হয়েছে।",
      `ব্যবহারকারীর কাজ: ${request}`,
    ].join("\n\n");
    createTask.mutate({ prompt, language: "bn", idempotencyKey: crypto.randomUUID() });
  };

  const pending = activeTask && ["queued", "running", "retry_wait"].includes(activeTask.status);

  return <main className="agent-detail-page">
    <header className="agent-detail-topbar">
      <Link href="/agents" className="workspace-back"><ArrowLeft size={15} /> Agent operations</Link>
      <div><Link href="/traces" className="quiet-button">Trace Store</Link><Link href="/integration-pilot" className="quiet-button">Integration readiness</Link></div>
    </header>
    <div className="agent-detail-shell">
      <section className="agent-detail-hero">
        <div className="agent-detail-mark">{agent.name.slice(0, 1)}</div>
        <div><span className="learn-label">{agent.department} · {agent.readiness}</span><h1>{agent.name}</h1><p>{agent.outcome}</p></div>
      </section>
      <section className="agent-detail-grid">
        <article className="agent-detail-card">
          <span className="learn-label">LEAD CONTRACT</span><h2>Bounded responsibility</h2>
          <p>This page uses the existing WorkDesk single-model task queue to produce a reviewable draft. It does not invoke the listed supporting models or tools.</p>
          <div className="agent-contract-list">
            <span><ShieldCheck size={14} /> Human gate: {agent.humanGate}</span>
            <span><LockKeyhole size={14} /> Risk: {agent.risk} · owner: {agent.owner}</span>
            <span><CheckCircle2 size={14} /> Evidence requirement: {agent.evidence}</span>
          </div>
        </article>
        <article className="agent-detail-card">
          <span className="learn-label">DECLARED SUPPORT ROLES</span><h2>{agent.supportModels.length} roles · not invoked</h2>
          <div className="agent-support-list">{agent.supportModels.map(model => <div key={model}><span>{model}</span><small>registry contract only</small></div>)}</div>
        </article>
      </section>
      <section className="agent-task-card">
        <div className="agent-task-head"><div><span className="learn-label">REAL WORKDESK AI TASK · SINGLE MODEL</span><h2>একটি পর্যালোচনাযোগ্য খসড়া তৈরি করুন</h2></div></div>
        <form className="space-y-3" onSubmit={runTask}>
          <label className="block text-sm font-semibold" htmlFor="agent-task-prompt">আপনার কাজের নির্দেশনা</label>
          <textarea id="agent-task-prompt" value={taskPrompt} onChange={event => setTaskPrompt(event.target.value)} minLength={3} maxLength={5000} required rows={5} placeholder="কোন কাজের খসড়া বা বিশ্লেষণ তৈরি করতে হবে লিখুন…" className="min-h-32 w-full rounded-xl border border-[#d9ded5] bg-white p-4 text-sm leading-7 outline-none focus:border-[#963a28]" />
          <button type="submit" className="primary-button" disabled={createTask.isPending || taskPrompt.trim().length < 3}>
            {createTask.isPending ? <><Loader2 size={15} className="spin" /> জমা হচ্ছে…</> : <><Play size={14} /> WorkDesk AI-তে চালান</>}
          </button>
        </form>
        {createTask.error && <p role="alert" className="mt-3 text-sm text-rose-700">{createTask.error.message}</p>}
        {tasks.isError && <p role="alert" className="mt-3 text-sm text-rose-700">কাজের অবস্থা পাওয়া যায়নি। আবার চেষ্টা করুন।</p>}
        {activeTask && <div className="agent-task-result mt-4">
          <strong className="inline-flex items-center gap-2">{pending ? <Clock3 size={15} /> : activeTask.status === "completed" ? <CheckCircle2 size={15} /> : <XCircle size={15} />}{statusLabel[activeTask.status] ?? activeTask.status}</strong>
          <span>Task {activeTask.id} · {activeTask.provider ?? "provider pending"} · {activeTask.model ?? "model pending"}</span>
          {activeTask.errorMessage && <p role="alert">{activeTask.errorMessage}</p>}
          {activeTask.result && <div className="mt-3 whitespace-pre-wrap text-sm leading-7">{activeTask.result}</div>}
          {pending && <p className="mt-2 text-xs">Durable WorkDesk queue-তে কাজটি চলছে। এই পৃষ্ঠা খোলা থাকলে অবস্থা স্বয়ংক্রিয়ভাবে হালনাগাদ হবে।</p>}
        </div>}
      </section>
      <section className="agent-detail-card">
        <span className="learn-label">TOOLS · STOP CONDITIONS · EVALUATION</span>
        <div className="agent-detail-columns">
          <div><h3>Declared tools</h3><p>{agent.tools.join(" · ")}</p></div>
          <div><h3>Stop conditions</h3><p>{agent.stopConditions.join(" · ")}</p></div>
          <div><h3>Evaluation</h3><p>{agent.evaluation.join(" · ")}</p></div>
        </div>
      </section>
      <div className="agent-detail-boundary"><ExternalLink size={15} /><span>Truthful execution boundary: this is a real WorkDesk single-model text task. Multi-agent orchestration, provider-specific tool adapters, external side effects and approval workflows are not implemented here. All results require human review.</span></div>
    </div>
  </main>;
}
