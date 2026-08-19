import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  AccessCase,
  CreativeRequest,
  accessCases,
  creativeRequests,
  changelogEntries,
  deletionRequests,
  integrationConnectors,
  InsertUser,
  users,
  waitlistSignups,
  searchAnalytics,
  studentScholarshipPrograms,
  studentScholarshipApplications,
  studentProEntitlements,
  studentProUsageCounters,
  workPackets,
  workPacketSources,
  workPacketAuditEvents,
  userProfiles,
  alphaContributionEvents,
  alphaReferralEvents,
  alphaRewards,
  type WorkPacket,
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

export async function createWorkPacket(input: { userId: number; title: string; language: string; uncertainty?: string; nextAction?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async tx => {
    const result = await tx.insert(workPackets).values(input);
    const id = Number(result[0].insertId);
    await tx.insert(workPacketAuditEvents).values({ packetId: id, userId: input.userId, action: "created", metadata: JSON.stringify({ language: input.language }) });
    await tx.insert(alphaContributionEvents).values({ userId: input.userId, kind: "packet_created", points: 5, referenceId: id });
    return (await tx.select().from(workPackets).where(and(eq(workPackets.id, id), eq(workPackets.userId, input.userId))).limit(1))[0];
  });
}

export async function listWorkPackets(userId: number): Promise<WorkPacket[]> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(workPackets).where(eq(workPackets.userId, userId)).orderBy(desc(workPackets.updatedAt));
}

export async function getWorkPacketBundle(userId: number, packetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const packet = (await db.select().from(workPackets).where(and(eq(workPackets.id, packetId), eq(workPackets.userId, userId))).limit(1))[0];
  if (!packet) return null;
  const sources = await db.select().from(workPacketSources).where(and(eq(workPacketSources.packetId, packetId), eq(workPacketSources.userId, userId))).orderBy(desc(workPacketSources.createdAt));
  const auditEvents = await db.select().from(workPacketAuditEvents).where(and(eq(workPacketAuditEvents.packetId, packetId), eq(workPacketAuditEvents.userId, userId))).orderBy(desc(workPacketAuditEvents.createdAt));
  return { packet, sources, auditEvents };
}

export async function addWorkPacketSource(input: { userId: number; packetId: number; kind: "file" | "url" | "note"; label: string; reference?: string; evidenceText?: string; citationState?: "unreviewed" | "supported" | "uncertain" | "rejected" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async tx => {
    const packet = (await tx.select({ id: workPackets.id }).from(workPackets).where(and(eq(workPackets.id, input.packetId), eq(workPackets.userId, input.userId))).limit(1))[0];
    if (!packet) throw new Error("Work Packet not found");
    const result = await tx.insert(workPacketSources).values({ ...input, citationState: input.citationState ?? "unreviewed" });
    const id = Number(result[0].insertId);
    await tx.insert(workPacketAuditEvents).values({ packetId: input.packetId, userId: input.userId, action: "source_added", metadata: JSON.stringify({ sourceId: id, kind: input.kind }) });
    await tx.insert(alphaContributionEvents).values({ userId: input.userId, kind: "source_added", points: 3, referenceId: input.packetId });
    return (await tx.select().from(workPacketSources).where(and(eq(workPacketSources.id, id), eq(workPacketSources.userId, input.userId))).limit(1))[0];
  });
}

export async function updateWorkPacketReview(input: { userId: number; packetId: number; status: "review" | "approved" | "changes_requested" | "rejected"; reason?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async tx => {
    const packet = (await tx.select().from(workPackets).where(and(eq(workPackets.id, input.packetId), eq(workPackets.userId, input.userId))).limit(1))[0];
    if (!packet) throw new Error("Work Packet not found");
    await tx.update(workPackets).set({ status: input.status }).where(and(eq(workPackets.id, input.packetId), eq(workPackets.userId, input.userId)));
    const action = input.status === "review" ? "submitted_for_review" : input.status;
    await tx.insert(workPacketAuditEvents).values({ packetId: input.packetId, userId: input.userId, action, reason: input.reason ?? null });
    if (input.status === "review" && packet.status !== "review") await tx.insert(alphaContributionEvents).values({ userId: input.userId, kind: "submitted_for_review", points: 2, referenceId: input.packetId });
    if (input.status === "approved" && packet.status !== "approved") await tx.insert(alphaContributionEvents).values({ userId: input.userId, kind: "approved", points: 10, referenceId: input.packetId });
    return (await tx.select().from(workPackets).where(and(eq(workPackets.id, input.packetId), eq(workPackets.userId, input.userId))).limit(1))[0];
  });
}

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return (await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1))[0] ?? null;
}

export async function upsertUserProfile(input: { userId: number; displayName?: string | null; bio?: string | null; preferredLanguage?: string; themePreference?: "system" | "light" | "dark" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const existing = await getUserProfile(input.userId);
  if (existing) {
    await db.update(userProfiles).set({ displayName: input.displayName ?? existing.displayName, bio: input.bio ?? existing.bio, preferredLanguage: input.preferredLanguage ?? existing.preferredLanguage, themePreference: input.themePreference ?? existing.themePreference }).where(eq(userProfiles.userId, input.userId));
  } else {
    await db.insert(userProfiles).values({ userId: input.userId, displayName: input.displayName ?? null, bio: input.bio ?? null, preferredLanguage: input.preferredLanguage ?? "bn", themePreference: input.themePreference ?? "system" });
  }
  return getUserProfile(input.userId);
}

export async function getAlphaLeaderboard(limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const rows = await db.select({ userId: alphaContributionEvents.userId, points: sql<number>`sum(${alphaContributionEvents.points})`.as("points"), displayName: userProfiles.displayName, userName: users.name }).from(alphaContributionEvents).leftJoin(userProfiles, eq(userProfiles.userId, alphaContributionEvents.userId)).leftJoin(users, eq(users.id, alphaContributionEvents.userId)).groupBy(alphaContributionEvents.userId, userProfiles.displayName, users.name).orderBy(desc(sql`sum(${alphaContributionEvents.points})`)).limit(limit);
  return rows.map((row, index) => ({ rank: index + 1, userId: row.userId, name: row.displayName || row.userName || "DSAI alpha user", points: Number(row.points ?? 0) }));
}

export async function getAlphaDashboard(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const contributions = await db.select({ points: sql<number>`coalesce(sum(${alphaContributionEvents.points}), 0)`.as("points"), events: sql<number>`count(*)`.as("events") }).from(alphaContributionEvents).where(eq(alphaContributionEvents.userId, userId));
  const referrals = await db.select({ qualified: sql<number>`coalesce(sum(case when ${alphaReferralEvents.status} in ('qualified','rewarded') then 1 else 0 end), 0)`.as("qualified"), pending: sql<number>`coalesce(sum(case when ${alphaReferralEvents.status} = 'pending' then 1 else 0 end), 0)`.as("pending"), points: sql<number>`coalesce(sum(${alphaReferralEvents.points}), 0)`.as("points") }).from(alphaReferralEvents).where(eq(alphaReferralEvents.referrerUserId, userId));
  const rewards = await db.select().from(alphaRewards).where(eq(alphaRewards.userId, userId)).orderBy(desc(alphaRewards.createdAt));
  return { points: Number(contributions[0]?.points ?? 0), contributionEvents: Number(contributions[0]?.events ?? 0), referrals: { qualified: Number(referrals[0]?.qualified ?? 0), pending: Number(referrals[0]?.pending ?? 0), points: Number(referrals[0]?.points ?? 0) }, rewards };
}

const CONNECTOR_CATALOG: Array<{ slug: string; label: string; category: "messaging" | "calendar" | "crm" | "media" | "analytics" }> = [
  { slug: "twilio", label: "Twilio Messaging", category: "messaging" },
  { slug: "google-calendar", label: "Google Calendar", category: "calendar" },
  { slug: "cal-com", label: "Cal.com Scheduling", category: "calendar" },
  { slug: "crm", label: "CRM Connector", category: "crm" },
  { slug: "media-worker", label: "Media Worker", category: "media" },
  { slug: "manus-forge", label: "Manus Built-in API", category: "analytics" },
];

const CONNECTOR_ENV_KEYS: Record<string, string[]> = {
  twilio: ["TWILIO_ACCOUNT_SID", "TWILIO_API_KEY", "TWILIO_API_SECRET"],
  "google-calendar": ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  "cal-com": ["CAL_API_KEY"],
  crm: ["CRM_API_BASE_URL", "CRM_API_KEY"],
  "media-worker": ["MEDIA_WORKER_URL", "MEDIA_WORKER_API_KEY"],
  "manus-forge": ["BUILT_IN_FORGE_API_URL", "BUILT_IN_FORGE_API_KEY"],
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
  if (!db) return CONNECTOR_CATALOG.map(connector => ({ ...connector, requiredKeys: CONNECTOR_ENV_KEYS[connector.slug] ?? [], enabled: 0, status: "disabled" as const, configured: false, lastCheckedAt: null, lastError: null }));
  await ensureConnectorCatalog();
  const rows = await db.select().from(integrationConnectors);
  return rows.map(row => ({ ...row, requiredKeys: CONNECTOR_ENV_KEYS[row.slug] ?? [], configured: connectorConfigured(row.slug) }));
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

export async function createDeletionRequest(input: { email: string; userId?: number; scope: "account" | "all_data" | "question"; details?: string; identityConfirmed: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(deletionRequests).values({ ...input, identityConfirmed: input.identityConfirmed ? 1 : 0 });
  const id = Number(result[0].insertId);
  return (await db.select({ id: deletionRequests.id, status: deletionRequests.status, scope: deletionRequests.scope, createdAt: deletionRequests.createdAt }).from(deletionRequests).where(eq(deletionRequests.id, id)).limit(1))[0];
}

export async function listDeletionRequests() {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(deletionRequests).orderBy(desc(deletionRequests.createdAt));
}

export async function updateDeletionRequest(input: { id: number; status: "pending" | "in_review" | "completed" | "rejected"; operatorNote?: string; reviewedBy: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(deletionRequests).set({ status: input.status, operatorNote: input.operatorNote ?? null, reviewedBy: input.reviewedBy, reviewedAt: new Date() }).where(eq(deletionRequests.id, input.id));
  return (await db.select().from(deletionRequests).where(eq(deletionRequests.id, input.id)).limit(1))[0];
}

export async function listPublishedChangelog() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(changelogEntries).where(eq(changelogEntries.status, "published")).orderBy(desc(changelogEntries.publishedAt), desc(changelogEntries.createdAt));
}

export async function listChangelogForAdmin() {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(changelogEntries).orderBy(desc(changelogEntries.updatedAt));
}

export async function createChangelogEntry(input: { version: string; title: string; summary: string; content: string; category: "feature" | "improvement" | "security" | "guide"; createdBy: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(changelogEntries).values(input);
  const id = Number(result[0].insertId);
  return (await db.select().from(changelogEntries).where(eq(changelogEntries.id, id)).limit(1))[0];
}

export async function setChangelogStatus(id: number, status: "draft" | "published") {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(changelogEntries).set({ status, publishedAt: status === "published" ? new Date() : null }).where(eq(changelogEntries.id, id));
  return (await db.select().from(changelogEntries).where(eq(changelogEntries.id, id)).limit(1))[0];
}

export async function recordSearchTerm(input: { normalizedTerm: string; source: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(searchAnalytics).values({ normalizedTerm: input.normalizedTerm, source: input.source, searchCount: 1 }).onDuplicateKeyUpdate({
    set: { searchCount: sql`${searchAnalytics.searchCount} + 1`, lastSearchedAt: new Date() },
  });
  return { accepted: true } as const;
}

export async function listSearchAnalytics(limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(searchAnalytics).orderBy(desc(searchAnalytics.searchCount), desc(searchAnalytics.lastSearchedAt)).limit(limit);
}

export async function listCreativeRequests(userId: number): Promise<CreativeRequest[]> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(creativeRequests).where(eq(creativeRequests.userId, userId)).orderBy(desc(creativeRequests.createdAt));
}

export async function createCreativeRequest(input: { userId: number; prompt: string; tier: "free" | "pro" | "creator" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(creativeRequests).values(input);
  const id = Number(result[0].insertId);
  return (await db.select().from(creativeRequests).where(and(eq(creativeRequests.id, id), eq(creativeRequests.userId, input.userId))).limit(1))[0];
}


const SCHOLARSHIP_PROGRAM_ID = 1;
const SCHOLARSHIP_PROGRAM_NAME = "DSAI Bengali Student Pro 30-Day Scholarship";
const SCHOLARSHIP_DAILY_LIMIT = 20;
const SCHOLARSHIP_MONTHLY_LIMIT = 300;
const SCHOLARSHIP_DURATION_DAYS = 30;

async function ensureScholarshipProgram(db: Awaited<ReturnType<typeof getDb>>) {
  if (!db) throw new Error("Database is not configured");
  await db.insert(studentScholarshipPrograms).values({ id: SCHOLARSHIP_PROGRAM_ID, name: SCHOLARSHIP_PROGRAM_NAME, maxSeats: 100, approvedSeats: 0, active: 1 }).onDuplicateKeyUpdate({ set: { id: sql`id` } });
}

export async function createStudentScholarshipApplication(input: {
  userId: number;
  language: string;
  country: string;
  institution: string;
  verificationMethod: "institutional_email" | "manual_review" | "provider_assertion";
  evidenceReferenceHash?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await ensureScholarshipProgram(db);
  const existing = await db.select().from(studentScholarshipApplications).where(eq(studentScholarshipApplications.userId, input.userId)).limit(1);
  if (existing[0] && !["rejected", "withdrawn"].includes(existing[0].status)) return existing[0];
  if (existing[0]) {
    await db.update(studentScholarshipApplications).set({ ...input, ageAttested18Plus: 1, status: "pending", reviewerId: null, reviewerNote: null, reviewedAt: null }).where(eq(studentScholarshipApplications.userId, input.userId));
  } else {
    await db.insert(studentScholarshipApplications).values({ ...input, ageAttested18Plus: 1 });
  }
  return (await db.select().from(studentScholarshipApplications).where(eq(studentScholarshipApplications.userId, input.userId)).limit(1))[0];
}

export async function getStudentScholarshipApplication(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return (await db.select().from(studentScholarshipApplications).where(eq(studentScholarshipApplications.userId, userId)).limit(1))[0] ?? null;
}

export async function listStudentScholarshipApplications() {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await ensureScholarshipProgram(db);
  return db.select().from(studentScholarshipApplications).orderBy(desc(studentScholarshipApplications.createdAt));
}

export async function reviewStudentScholarshipApplication(input: { id: number; status: "in_review" | "approved" | "rejected"; reviewerId: number; reviewerNote?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const current = (await db.select().from(studentScholarshipApplications).where(eq(studentScholarshipApplications.id, input.id)).limit(1))[0];
  if (!current) throw new Error("Scholarship application not found");
  if (input.status !== "approved") {
    await db.update(studentScholarshipApplications).set({ status: input.status, reviewerId: input.reviewerId, reviewerNote: input.reviewerNote ?? null, reviewedAt: new Date() }).where(eq(studentScholarshipApplications.id, input.id));
    return (await db.select().from(studentScholarshipApplications).where(eq(studentScholarshipApplications.id, input.id)).limit(1))[0];
  }
  if (current.status === "approved") return current;
  return db.transaction(async tx => {
    await tx.insert(studentScholarshipPrograms).values({ id: SCHOLARSHIP_PROGRAM_ID, name: SCHOLARSHIP_PROGRAM_NAME, maxSeats: 100, approvedSeats: 0, active: 1 }).onDuplicateKeyUpdate({ set: { id: sql`id` } });
    const seatUpdate = await tx.update(studentScholarshipPrograms).set({ approvedSeats: sql`${studentScholarshipPrograms.approvedSeats} + 1` }).where(and(eq(studentScholarshipPrograms.id, SCHOLARSHIP_PROGRAM_ID), eq(studentScholarshipPrograms.active, 1), sql`${studentScholarshipPrograms.approvedSeats} < ${studentScholarshipPrograms.maxSeats}`));
    if (!seatUpdate[0] || Number(seatUpdate[0].affectedRows ?? 0) !== 1) throw new Error("The 100-student scholarship capacity has been reached");
    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + SCHOLARSHIP_DURATION_DAYS * 24 * 60 * 60 * 1000);
    await tx.update(studentScholarshipApplications).set({ status: "approved", reviewerId: input.reviewerId, reviewerNote: input.reviewerNote ?? null, reviewedAt: startsAt }).where(eq(studentScholarshipApplications.id, input.id));
    await tx.insert(studentProEntitlements).values({ userId: current.userId, applicationId: current.id, plan: "pro", status: "active", dailyLimit: SCHOLARSHIP_DAILY_LIMIT, monthlyLimit: SCHOLARSHIP_MONTHLY_LIMIT, startsAt, expiresAt }).onDuplicateKeyUpdate({ set: { status: "active", startsAt, expiresAt, dailyLimit: SCHOLARSHIP_DAILY_LIMIT, monthlyLimit: SCHOLARSHIP_MONTHLY_LIMIT } });
    return (await tx.select().from(studentScholarshipApplications).where(eq(studentScholarshipApplications.id, input.id)).limit(1))[0];
  });
}

function periodStart(period: "day" | "month", now: Date) {
  return period === "day" ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function getStudentProStatus(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const entitlement = (await db.select().from(studentProEntitlements).where(eq(studentProEntitlements.userId, userId)).limit(1))[0] ?? null;
  if (!entitlement) return { active: false, entitlement: null, dailyUsed: 0, monthlyUsed: 0, warnings: [] as Array<{ key: string; level: "info" | "warning" | "exhausted"; message: string }> };
  const now = new Date();
  const dailyRows = await db.select().from(studentProUsageCounters).where(and(eq(studentProUsageCounters.entitlementId, entitlement.id), eq(studentProUsageCounters.period, "day"), eq(studentProUsageCounters.periodStart, periodStart("day", now)))).limit(1);
  const monthlyRows = await db.select().from(studentProUsageCounters).where(and(eq(studentProUsageCounters.entitlementId, entitlement.id), eq(studentProUsageCounters.period, "month"), eq(studentProUsageCounters.periodStart, periodStart("month", now)))).limit(1);
  const daily = dailyRows[0];
  const monthly = monthlyRows[0];
  const active = entitlement.status === "active" && entitlement.expiresAt.getTime() > now.getTime();
  const dailyUsed = daily?.units ?? 0;
  const monthlyUsed = monthly?.units ?? 0;
  const warnings: Array<{ key: string; level: "info" | "warning" | "exhausted"; message: string }> = [];
  if (!active) warnings.push({ key: "entitlement-expired", level: "exhausted", message: "আপনার scholarship Pro access-এর মেয়াদ শেষ হয়েছে।" });
  else {
    if (dailyUsed >= entitlement.dailyLimit) warnings.push({ key: "daily-exhausted", level: "exhausted", message: "আজকের Pro usage limit শেষ হয়েছে। আগামী দিনের reset পর্যন্ত অপেক্ষা করুন।" });
    else if (dailyUsed / entitlement.dailyLimit >= 0.8) warnings.push({ key: "daily-80", level: "warning", message: `আজকের limit-এর ${entitlement.dailyLimit - dailyUsed} unit বাকি আছে।` });
    if (monthlyUsed >= entitlement.monthlyLimit) warnings.push({ key: "monthly-exhausted", level: "exhausted", message: "এই মাসের Pro usage limit শেষ হয়েছে।" });
    else if (monthlyUsed / entitlement.monthlyLimit >= 0.8) warnings.push({ key: "monthly-80", level: "warning", message: `এই মাসের limit-এর ${entitlement.monthlyLimit - monthlyUsed} unit বাকি আছে।` });
  }
  return { active, entitlement, dailyUsed, monthlyUsed, warnings };
}

export async function consumeStudentProUsage(userId: number, units = 1) {
  if (!Number.isInteger(units) || units < 1 || units > 10) throw new Error("Usage units must be between 1 and 10");
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async tx => {
    const entitlement = (await tx.select().from(studentProEntitlements).where(eq(studentProEntitlements.userId, userId)).limit(1))[0];
    if (!entitlement || entitlement.status !== "active" || entitlement.expiresAt.getTime() <= Date.now()) throw new Error("Active student Pro entitlement is required");
    const now = new Date();
    const dayStart = periodStart("day", now);
    const monthStart = periodStart("month", now);
    const current = await tx.select().from(studentProUsageCounters).where(eq(studentProUsageCounters.entitlementId, entitlement.id));
    const dailyUsed = current.find(row => row.period === "day" && row.periodStart.getTime() === dayStart.getTime())?.units ?? 0;
    const monthlyUsed = current.find(row => row.period === "month" && row.periodStart.getTime() === monthStart.getTime())?.units ?? 0;
    if (dailyUsed + units > entitlement.dailyLimit) throw new Error("Daily student Pro limit reached");
    if (monthlyUsed + units > entitlement.monthlyLimit) throw new Error("Monthly student Pro limit reached");
    for (const [period, start] of [["day", dayStart], ["month", monthStart]] as const) {
      await tx.insert(studentProUsageCounters).values({ userId, entitlementId: entitlement.id, period, periodStart: start, units }).onDuplicateKeyUpdate({ set: { units: sql`${studentProUsageCounters.units} + ${units}` } });
    }
    return { accepted: true, dailyUsed: dailyUsed + units, dailyLimit: entitlement.dailyLimit, monthlyUsed: monthlyUsed + units, monthlyLimit: entitlement.monthlyLimit } as const;
  });
}
