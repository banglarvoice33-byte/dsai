import { performance } from "node:perf_hooks";
import { buildLeadActionPlan, leadIntakeSchema } from "../server/leadAgent";

const lead = leadIntakeSchema.parse({
  name: "Benchmark User",
  email: "benchmark@example.com",
  timezone: "UTC",
  requestedService: "Consultation",
  source: "benchmark",
  consentToContact: true,
  preferredChannel: "email",
});

const samples: number[] = [];
const errors: string[] = [];
for (let index = 0; index < 1000; index += 1) {
  const started = performance.now();
  try {
    const plan = buildLeadActionPlan(lead);
    if (plan.outboundSendAllowed) errors.push("outbound action was enabled");
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  samples.push(performance.now() - started);
}

const sorted = [...samples].sort((a, b) => a - b);
const percentile = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? 0;
console.log(JSON.stringify({
  iterations: samples.length,
  p50Ms: Number(percentile(0.5).toFixed(4)),
  p95Ms: Number(percentile(0.95).toFixed(4)),
  maxMs: Number((sorted.at(-1) ?? 0).toFixed(4)),
  errors,
}, null, 2));

if (errors.length > 0 || percentile(0.95) > 20) process.exitCode = 1;
