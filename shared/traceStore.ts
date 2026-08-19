export type TraceStatus = "queued" | "running" | "paused_for_approval" | "completed" | "failed";
export type TraceStepStatus = "started" | "completed" | "blocked" | "failed";

export type TraceStep = {
  id: string;
  label: string;
  role: string;
  status: TraceStepStatus;
  startedAt: number;
  endedAt?: number;
  note?: string;
};

export type AgentTrace = {
  id: string;
  agentId: string;
  agentName: string;
  department: string;
  status: TraceStatus;
  startedAt: number;
  endedAt?: number;
  requestLabel: string;
  evidenceCount: number;
  approvalRequired: boolean;
  steps: TraceStep[];
  providerMode: "mock" | "provider-gated" | "local";
};

export const TRACE_STORAGE_KEY = "dsai-agent-traces-v1";

export function readTraceStore(): AgentTrace[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(TRACE_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.slice(0, 50) : [];
  } catch {
    return [];
  }
}

export function writeTraceStore(entries: AgentTrace[]) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(TRACE_STORAGE_KEY, JSON.stringify(entries.slice(0, 50))); } catch { /* local trace remains in memory */ }
}

export function recordAgentTrace(entry: AgentTrace) {
  const next = [entry, ...readTraceStore().filter(item => item.id !== entry.id)].slice(0, 50);
  writeTraceStore(next);
  return entry;
}
