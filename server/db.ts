import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  AccessCase,
  accessCases,
  creativeRequests,
  integrationConnectors,
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

const CONNECTOR_CATALOG: Array<{ slug: string; label: string; category: "messaging" | "calendar" | "crm" | "media" | "analytics" }> = [
  { slug: "twilio", label: "Twilio Messaging", category: "messaging" },
  { slug: "google-calendar", label: "Google Calendar", category: "calendar" },
  { slug: "cal-com", label: "Cal.com Scheduling", category: "calendar" },
  { slug: "crm", label: "CRM Connector", category: "crm" },
  { slug: "media-worker", label: "Media Worker", category: "media" },
];

const CONNECTOR_ENV_KEYS: Record<string, string[]> = {
  twilio: ["TWILIO_ACCOUNT_SID", "TWILIO_API_KEY", "TWILIO_API_SECRET"],
  "google-calendar": ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  "cal-com": ["CAL_API_KEY"],
  crm: ["CRM_API_BASE_URL", "CRM_API_KEY"],
  "media-worker": ["MEDIA_WORKER_URL", "MEDIA_WORKER_API_KEY"],
};

function connectorConfigured(slug: string) {
  return (CONNECTOR_ENV_KEYS[slug] ?? []).every(key => Boolean(process.env[key]));
}

export async function ensureConnectorCatalog() {
  const db = await getDb();
  if (!db) return;
  await db.insert(integrationConnectors).values(CONNECTOR_CATALOG).onDuplicateKeyUpdate({
    set: { slug: sql`slug` },
  });
}

export async function listConnectors() {
  const db = await getDb();
  if (!db) return CONNECTOR_CATALOG.map(connector => ({ ...connector, enabled: 0, status: "disabled" as const, configured: false, lastCheckedAt: null, lastError: null }));
  await ensureConnectorCatalog();
  const rows = await db.select().from(integrationConnectors);
  return rows.map(row => ({ ...row, configured: connectorConfigured(row.slug) }));
}

export async function updateConnector(slug: string, enabled: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await ensureConnectorCatalog();
  const configured = connectorConfigured(slug);
  const status = enabled ? (configured ? "ready" : "degraded") : "disabled";
  const lastError = enabled && !configured ? "Provider credentials are not configured; safe fallback remains active." : null;
  await db.update(integrationConnectors).set({ enabled: enabled ? 1 : 0, status, lastError, lastCheckedAt: new Date() }).where(eq(integrationConnectors.slug, slug));
  const rows = await db.select().from(integrationConnectors).where(eq(integrationConnectors.slug, slug)).limit(1);
  return rows[0];
}

export async function testConnector(slug: string) {
  const configured = connectorConfigured(slug);
  return {
    slug,
    configured,
    status: configured ? "ready" as const : "degraded" as const,
    checkedAt: new Date(),
    message: configured ? "Required provider environment values are present; complete provider OAuth and health checks before enabling live actions." : "Provider credentials are absent; deployment remains healthy and the connector stays in safe fallback mode.",
  };
}

export async function createCreativeRequest(input: { userId: number; prompt: string; tier: "free" | "pro" | "creator" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(creativeRequests).values(input);
  const id = Number(result[0].insertId);
  return (await db.select().from(creativeRequests).where(and(eq(creativeRequests.id, id), eq(creativeRequests.userId, input.userId))).limit(1))[0];
}
