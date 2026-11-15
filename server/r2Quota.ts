import { sql } from "drizzle-orm";
import { getDb } from "./db";

// These ceilings are 90% of DSAI's 50% allocation from the published R2
// Standard free tier. The remaining 10% is a safety reserve.
export const DSAI_R2_LIMITS = {
  storedBytes: 4_500_000_000, // 4.5 GB live object bytes (conservative vs GB-month)
  classA: 450_000,            // 90% of 500,000
  classB: 4_500_000,          // 90% of 5,000,000
} as const;

export type R2UsageMetric = "class_a" | "class_b" | "stored_bytes";

/** Atomically reserve usage in Postgres before issuing a storage capability or reading an object. */
export async function reserveR2Usage(metric: R2UsageMetric, units: number, limit: number) {
  if (!Number.isSafeInteger(units) || units <= 0) throw new Error("Invalid R2 quota units");
  const db = await getDb();
  if (!db) throw new Error("DSAI R2 quota ledger is unavailable; R2 operations are fail-closed");
  const result = await db.execute(sql`select public.dsai_r2_reserve_usage(${metric}, ${units}, ${limit}) as allowed`);
  const rows = result as unknown as Array<{ allowed: boolean }>;
  if (rows[0]?.allowed !== true) {
    const label = metric === "stored_bytes" ? "storage capacity" : metric === "class_a" ? "monthly write-operation" : "monthly read-operation";
    throw new Error(`DSAI R2 ${label} budget reached; operation blocked to protect the free-tier allocation`);
  }
}

export async function releaseR2StorageUsage(units: number) {
  if (!Number.isSafeInteger(units) || units <= 0) return;
  const db = await getDb();
  if (!db) throw new Error("DSAI R2 quota ledger is unavailable; storage reservation cannot be released");
  await db.execute(sql`select public.dsai_r2_release_storage(${units})`);
}
