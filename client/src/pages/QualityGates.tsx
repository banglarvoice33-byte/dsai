import { useMemo } from "react";
import { Activity, ArrowLeft, Gauge, Languages, LockKeyhole, Play, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const modules = [{ name: "Homepage", route: "/" }, { name: "Workspace", route: "/workspace" }, { name: "Alpha Dashboard", route: "/workspace" }, { name: "Governance & Security", route: "/governance" }, { name: "Integration Pilot", route: "/integration-pilot" }, { name: "Trace Store", route: "/traces" }, { name: "Agent Operations", route: "/agents" }, { name: "Evidence ledger", route: "/evidence" }];
const budgets = [{ label: "LCP", target: "â‰¤ 2.5s" }, { label: "INP", target: "â‰¤ 200ms" }, { label: "CLS", target: "â‰¤ 0.10" }, { label: "Trace p95", target: "â‰¤ 800ms" }];
const benchmarkTasks = ["Bengali intent routing", "Banglish normalization", "Evidence-grounded answer", "Work Packet extraction", "Safety refusal", "Human-review handoff"];

export default function QualityGates() {
  const { user } = useAuth();
  const performance = trpc.performance.list.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const benchmarks = trpc.evaluation.listBenchmarks.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const gates = trpc.evaluation.listGates.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const runBenchmark = trpc.evaluation.runBengali.useMutation({ onSuccess: () => void benchmarks¶»§q«^