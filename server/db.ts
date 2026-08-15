import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  AccessCase,
  accessCases,
  creativeRequests,
  InsertUser,
  users,
  waitlistSignups,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined || user.openId === ENV.ownerOpenId) {
    values.role = user.role ?? "admin";
    updateSet.role = values.role;
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function addWaitlistSignup(input: { email: string; interest: "access" | "creative" | "both"; language: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(waitlistSignups).values(input).onDuplicateKeyUpdate({
    set: { interest: input.interest, language: input.language },
  });
  const result = await db.select().from(waitlistSignups).where(eq(waitlistSignups.email, input.email)).limit(1);
  return result[0];
}

export async function createAccessCase(input: {
  userId: number;
  title: string;
  workflow: "document" | "government" | "healthcare" | "jobs" | "legal" | "billing";
  language: string;
  riskLevel: "low" | "medium" | "high";
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(accessCases).values(input);
  const id = Number(result[0].insertId);
  return (await db.select().from(accessCases).where(eq(accessCases.id, id)).limit(1))[0];
}

export async function listAccessCases(userId: number): Promise<AccessCase[]> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(accessCases).where(eq(accessCases.userId, userId)).orderBy(desc(accessCases.createdAt));
}

export async function createCreativeRequest(input: { userId: number; prompt: string; tier: "free" | "pro" | "creator" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(creativeRequests).values(input);
  const id = Number(result[0].insertId);
  return (await db.select().from(creativeRequests).where(and(eq(creativeRequests.id, id), eq(creativeRequests.userId, input.userId))).limit(1))[0];
}
