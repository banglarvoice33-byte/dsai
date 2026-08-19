import { int, mysqlEnum, mysqlTable, text, timestamp, tinyint, unique, varchar, index } from "drizzle-orm/mysql-core";

/** Core user table backing Manus OAuth. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const waitlistSignups = mysqlTable("waitlist_signups", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  interest: mysqlEnum("interest", ["access", "creative", "both"]).default("both").notNull(),
  language: varchar("language", { length: 16 }).default("bn").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const accessCases = mysqlTable("access_cases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  workflow: mysqlEnum("workflow", ["document", "government", "healthcare", "jobs", "legal", "billing"]).notNull(),
  language: varchar("language", { length: 16 }).default("bn").notNull(),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]).default("medium").notNull(),
  status: mysqlEnum("status", ["draft", "review", "ready", "closed"]).default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const integrationConnectors = mysqlTable("integration_connectors", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  label: varchar("label", { length: 160 }).notNull(),
  category: mysqlEnum("category", ["messaging", "calendar", "crm", "media", "analytics"]).notNull(),
  enabled: tinyint("enabled").default(0).notNull(),
  status: mysqlEnum("status", ["disabled", "ready", "degraded", "error"]).default("disabled").notNull(),
  lastCheckedAt: timestamp("lastCheckedAt"),
  lastError: text("lastError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const deletionRequests = mysqlTable("deletion_requests", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  userId: int("userId"),
  scope: mysqlEnum("scope", ["account", "all_data", "question"]).default("account").notNull(),
  details: varchar("details", { length: 2000 }),
  identityConfirmed: tinyint("identityConfirmed").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "in_review", "completed", "rejected"]).default("pending").notNull(),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  operatorNote: varchar("operatorNote", { length: 2000 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const changelogEntries = mysqlTable("changelog_entries", {
  id: int("id").autoincrement().primaryKey(),
  version: varchar("version", { length: 40 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  summary: varchar("summary", { length: 500 }).notNull(),
  content: text("content").notNull(),
  category: mysqlEnum("category", ["feature", "improvement", "security", "guide"]).default("feature").notNull(),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const searchAnalytics = mysqlTable("search_analytics", {
  id: int("id").autoincrement().primaryKey(),
  normalizedTerm: varchar("normalizedTerm", { length: 160 }).notNull(),
  source: varchar("source", { length: 32 }).default("homepage").notNull(),
  searchCount: int("searchCount").default(0).notNull(),
  lastSearchedAt: timestamp("lastSearchedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ termSourceUnique: unique("search_analytics_term_source_unique").on(table.normalizedTerm, table.source) }));

export const fileAssets = mysqlTable("file_assets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  storageKey: varchar("storageKey", { length: 512 }).notNull().unique(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  byteSize: int("byteSize").notNull(),
  sha256: varchar("sha256", { length: 64 }).notNull(),
  scanStatus: mysqlEnum("scanStatus", ["quarantined", "scanning", "clean", "infected", "error", "expired"]).default("quarantined").notNull(),
  scanProvider: varchar("scanProvider", { length: 80 }),
  scanMessage: varchar("scanMessage", { length: 500 }),
  retentionExpiresAt: timestamp("retentionExpiresAt").notNull(),
  scannedAt: timestamp("scannedAt"),
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userStatusIndex: index("file_assets_user_status_idx").on(table.userId, table.scanStatus),
  retentionIndex: index("file_assets_retention_idx").on(table.retentionExpiresAt, table.scanStatus),
}));

export const creativeRequests = mysqlTable("creative_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  prompt: text("prompt").notNull(),
  tier: mysqlEnum("tier", ["free", "pro", "creator"]).default("free").notNull(),
  status: mysqlEnum("status", ["queued", "processing", "complete", "failed"]).default("queued").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type WaitlistSignup = typeof waitlistSignups.$inferSelect;
export type AccessCase = typeof accessCases.$inferSelect;
export type CreativeRequest = typeof creativeRequests.$inferSelect;
export type FileAsset = typeof fileAssets.$inferSelect;
export type ChangelogEntry = typeof changelogEntries.$inferSelect;
export type DeletionRequest = typeof deletionRequests.$inferSelect;
export type IntegrationConnector = typeof integrationConnectors.$inferSelect;
export type SearchAnalytics = typeof searchAnalytics.$inferSelect;


/** A single globally capped scholarship program; row id 1 is initialized by server code. */
export const studentScholarshipPrograms = mysqlTable("student_scholarship_programs", {
  id: int("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  maxSeats: int("maxSeats").default(100).notNull(),
  approvedSeats: int("approvedSeats").default(0).notNull(),
  active: tinyint("active").default(1).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Stores only review metadata; no student document bytes are stored here. */
export const studentScholarshipApplications = mysqlTable("student_scholarship_applications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  language: varchar("language", { length: 16 }).default("bn").notNull(),
  country: varchar("country", { length: 80 }).notNull(),
  institution: varchar("institution", { length: 180 }).notNull(),
  verificationMethod: mysqlEnum("verificationMethod", ["institutional_email", "manual_review", "provider_assertion"]).default("manual_review").notNull(),
  evidenceReferenceHash: varchar("evidenceReferenceHash", { length: 128 }),
  ageAttested18Plus: tinyint("ageAttested18Plus").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "in_review", "approved", "rejected", "withdrawn"]).default("pending").notNull(),
  reviewerId: int("reviewerId"),
  reviewerNote: varchar("reviewerNote", { length: 1000 }),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ statusIndex: index("student_scholarship_status_idx").on(table.status, table.createdAt) }));

export const studentProEntitlements = mysqlTable("student_pro_entitlements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  applicationId: int("applicationId").notNull().unique(),
  plan: mysqlEnum("plan", ["pro"]).default("pro").notNull(),
  status: mysqlEnum("status", ["active", "expired", "revoked"]).default("active").notNull(),
  dailyLimit: int("dailyLimit").default(20).notNull(),
  monthlyLimit: int("monthlyLimit").default(300).notNull(),
  startsAt: timestamp("startsAt").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ activeExpiryIndex: index("student_pro_expiry_idx").on(table.status, table.expiresAt) }));

export const studentProUsageCounters = mysqlTable("student_pro_usage_counters", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  entitlementId: int("entitlementId").notNull(),
  period: mysqlEnum("period", ["day", "month"]).notNull(),
  periodStart: timestamp("periodStart").notNull(),
  units: int("units").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ usageUnique: unique("student_pro_usage_unique").on(table.userId, table.entitlementId, table.period, table.periodStart) }));

export type StudentScholarshipApplication = typeof studentScholarshipApplications.$inferSelect;
export type StudentProEntitlement = typeof studentProEntitlements.$inferSelect;
export type StudentProUsageCounter = typeof studentProUsageCounters.$inferSelect;


export const agentTraces = mysqlTable("agent_traces", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  traceKey: varchar("traceKey", { length: 96 }).notNull(),
  agentId: varchar("agentId", { length: 80 }).notNull(),
  agentName: varchar("agentName", { length: 120 }).notNull(),
  department: varchar("department", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["queued", "running", "paused_for_approval", "completed", "failed"]).notNull(),
  providerMode: mysqlEnum("providerMode", ["mock", "provider-gated", "local"]).notNull(),
  requestLabel: varchar("requestLabel", { length: 240 }).notNull(),
  evidenceCount: int("evidenceCount").default(0).notNull(),
  approvalRequired: tinyint("approvalRequired").default(0).notNull(),
  startedAt: timestamp("startedAt").notNull(),
  endedAt: timestamp("endedAt"),
  steps: text("steps").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ ownerTraceIndex: index("agent_traces_owner_created_idx").on(table.userId, table.createdAt), traceKeyUnique: unique("agent_traces_user_key_unique").on(table.userId, table.traceKey) }));

export const performanceSnapshots = mysqlTable("performance_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  module: varchar("module", { length: 120 }).notNull(),
  route: varchar("route", { length: 160 }).notNull(),
  p50Ms: int("p50Ms").notNull(),
  p95Ms: int("p95Ms").notNull(),
  errorRateBps: int("errorRateBps").default(0).notNull(),
  sampleCount: int("sampleCount").default(0).notNull(),
  source: mysqlEnum("source", ["lab", "field", "synthetic"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ moduleCreatedIndex: index("performance_snapshots_module_created_idx").on(table.module, table.createdAt) }));

export const benchmarkRuns = mysqlTable("benchmark_runs", {
  id: int("id").autoincrement().primaryKey(),
  suiteVersion: varchar("suiteVersion", { length: 40 }).notNull(),
  language: varchar("language", { length: 16 }).default("bn").notNull(),
  status: mysqlEnum("status", ["passed", "failed", "blocked"]).notNull(),
  scoreBps: int("scoreBps").notNull(),
  sampleCount: int("sampleCount").default(0).notNull(),
  resultJson: text("resultJson").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const releaseGateChecks = mysqlTable("release_gate_checks", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  category: mysqlEnum("category", ["quality", "security", "performance", "provider", "operations"]).notNull(),
  status: mysqlEnum("status", ["pending", "pass", "fail", "waived"]).notNull(),
  thresholdLabel: varchar("thresholdLabel", { length: 180 }).notNull(),
  observedLabel: varchar("observedLabel", { length: 180 }).notNull(),
  details: varchar("details", { length: 1000 }).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const oauthTestRuns = mysqlTable("oauth_test_runs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: varchar("provider", { length: 80 }).notNull(),
  scenario: varchar("scenario", { length: 80 }).notNull(),
  outcome: mysqlEnum("outcome", ["passed", "failed", "blocked"]).notNull(),
  scopes: varchar("scopes", { length: 1000 }).notNull(),
  detail: varchar("detail", { length: 1000 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ oauthOwnerIndex: index("oauth_test_runs_owner_created_idx").on(table.userId, table.createdAt) }));

export type AgentTrace = typeof agentTraces.$inferSelect;
export type PerformanceSnapshot = typeof performanceSnapshots.$inferSelect;
export type BenchmarkRun = typeof benchmarkRuns.$inferSelect;
export type ReleaseGateCheck = typeof releaseGateChecks.$inferSelect;
export type OAuthTestRun = typeof oauthTestRuns.$inferSelect;
