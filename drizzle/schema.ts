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
  packetId: int("packetId"),
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

export const workPackets = mysqlTable("work_packets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  language: varchar("language", { length: 16 }).default("bn").notNull(),
  status: mysqlEnum("status", ["draft", "review", "approved", "changes_requested", "rejected", "archived"]).default("draft").notNull(),
  uncertainty: text("uncertainty"),
  nextAction: text("nextAction"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ userStatusIndex: index("work_packets_user_status_idx").on(table.userId, table.status) }));

export const workPacketSources = mysqlTable("work_packet_sources", {
  id: int("id").autoincrement().primaryKey(),
  packetId: int("packetId").notNull(),
  userId: int("userId").notNull(),
  kind: mysqlEnum("kind", ["file", "url", "note"]).notNull(),
  label: varchar("label", { length: 180 }).notNull(),
  reference: varchar("reference", { length: 1000 }),
  evidenceText: text("evidenceText"),
  citationState: mysqlEnum("citationState", ["unreviewed", "supported", "uncertain", "rejected"]).default("unreviewed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ packetIndex: index("work_packet_sources_packet_idx").on(table.packetId, table.createdAt) }));

export const workPacketAuditEvents = mysqlTable("work_packet_audit_events", {
  id: int("id").autoincrement().primaryKey(),
  packetId: int("packetId").notNull(),
  userId: int("userId").notNull(),
  action: mysqlEnum("action", ["created", "source_added", "drafted", "submitted_for_review", "approved", "changes_requested", "rejected", "exported", "deleted"]).notNull(),
  reason: varchar("reason", { length: 1000 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ packetAuditIndex: index("work_packet_audit_packet_idx").on(table.packetId, table.createdAt) }));

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
export type WorkPacket = typeof workPackets.$inferSelect;
export type WorkPacketSource = typeof workPacketSources.$inferSelect;
export type WorkPacketAuditEvent = typeof workPacketAuditEvents.$inferSelect;
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
