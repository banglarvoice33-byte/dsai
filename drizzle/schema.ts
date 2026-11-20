import {
  bigint,
  char,
  date,
  integer,
  jsonb,
  numeric,
  pgSchema,
  pgTable,
  primaryKey,
  serial,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";

const privateSchema = pgSchema("private");

function enumText<const T extends readonly string[]>(name: string, _values: T) {
  return text(name).$type<T[number]>();
}

/** Core user table backing Manus OAuth. */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: enumText("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const waitlistSignups = pgTable("waitlist_signups", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  interest: enumText("interest", ["access", "creative", "both"])
    .default("both")
    .notNull(),
  language: varchar("language", { length: 16 }).default("bn").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const accessCases = pgTable("access_cases", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  workflow: enumText("workflow", [
    "document",
    "government",
    "healthcare",
    "jobs",
    "legal",
    "billing",
  ]).notNull(),
  language: varchar("language", { length: 16 }).default("bn").notNull(),
  riskLevel: enumText("riskLevel", ["low", "medium", "high"])
    .default("medium")
    .notNull(),
  status: enumText("status", ["draft", "review", "ready", "closed"])
    .default("draft")
    .notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const integrationConnectors = pgTable("integration_connectors", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  label: varchar("label", { length: 160 }).notNull(),
  category: enumText("category", [
    "messaging",
    "calendar",
    "crm",
    "media",
    "analytics",
  ]).notNull(),
  enabled: integer("enabled").default(0).notNull(),
  status: enumText("status", ["disabled", "ready", "degraded", "error"])
    .default("disabled")
    .notNull(),
  lastCheckedAt: timestamp("lastCheckedAt"),
  lastError: text("lastError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const deletionRequests = pgTable("deletion_requests", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  userId: integer("userId"),
  scope: enumText("scope", ["account", "all_data", "question"])
    .default("account")
    .notNull(),
  details: varchar("details", { length: 2000 }),
  identityConfirmed: integer("identityConfirmed").default(0).notNull(),
  status: enumText("status", ["pending", "in_review", "completed", "rejected"])
    .default("pending")
    .notNull(),
  reviewedBy: integer("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  operatorNote: varchar("operatorNote", { length: 2000 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const changelogEntries = pgTable("changelog_entries", {
  id: serial("id").primaryKey(),
  version: varchar("version", { length: 40 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  summary: varchar("summary", { length: 500 }).notNull(),
  content: text("content").notNull(),
  category: enumText("category", [
    "feature",
    "improvement",
    "security",
    "guide",
  ])
    .default("feature")
    .notNull(),
  status: enumText("status", ["draft", "published"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  createdBy: integer("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const searchAnalytics = pgTable(
  "search_analytics",
  {
    id: serial("id").primaryKey(),
    normalizedTerm: varchar("normalizedTerm", { length: 160 }).notNull(),
    source: varchar("source", { length: 32 }).default("homepage").notNull(),
    searchCount: integer("searchCount").default(0).notNull(),
    lastSearchedAt: timestamp("lastSearchedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  table => ({
    termSourceUnique: unique("search_analytics_term_source_unique").on(
      table.normalizedTerm,
      table.source
    ),
  })
);

export const fileAssets = pgTable(
  "file_assets",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    storageKey: varchar("storageKey", { length: 512 }).notNull().unique(),
    originalName: varchar("originalName", { length: 255 }).notNull(),
    mimeType: varchar("mimeType", { length: 128 }).notNull(),
    byteSize: integer("byteSize").notNull(),
    sha256: varchar("sha256", { length: 64 }).notNull(),
    scanStatus: enumText("scanStatus", [
      "quarantined",
      "scanning",
      "clean",
      "validated",
      "infected",
      "error",
      "expired",
    ])
      .default("quarantined")
      .notNull(),
    scanProvider: varchar("scanProvider", { length: 80 }),
    scanMessage: varchar("scanMessage", { length: 500 }),
    retentionExpiresAt: timestamp("retentionExpiresAt").notNull(),
    scannedAt: timestamp("scannedAt"),
    deletedAt: timestamp("deletedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  table => ({
    userStatusIndex: index("file_assets_user_status_idx").on(
      table.userId,
      table.scanStatus
    ),
    retentionIndex: index("file_assets_retention_idx").on(
      table.retentionExpiresAt,
      table.scanStatus
    ),
  })
);

export const creativeRequests = pgTable("creative_requests", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  prompt: text("prompt").notNull(),
  tier: enumText("tier", ["free", "pro", "creator"]).default("free").notNull(),
  status: enumText("status", ["queued", "processing", "complete", "failed"])
    .default("queued")
    .notNull(),
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
export const studentScholarshipPrograms = pgTable(
  "student_scholarship_programs",
  {
    id: integer("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    maxSeats: integer("maxSeats").default(100).notNull(),
    approvedSeats: integer("approvedSeats").default(0).notNull(),
    active: integer("active").default(1).notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }
);

/** Stores only review metadata; no student document bytes are stored here. */
export const studentScholarshipApplications = pgTable(
  "student_scholarship_applications",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull().unique(),
    language: varchar("language", { length: 16 }).default("bn").notNull(),
    country: varchar("country", { length: 80 }).notNull(),
    institution: varchar("institution", { length: 180 }).notNull(),
    verificationMethod: enumText("verificationMethod", [
      "institutional_email",
      "manual_review",
      "provider_assertion",
    ])
      .default("manual_review")
      .notNull(),
    evidenceReferenceHash: varchar("evidenceReferenceHash", { length: 128 }),
    ageAttested18Plus: integer("ageAttested18Plus").default(0).notNull(),
    status: enumText("status", [
      "pending",
      "in_review",
      "approved",
      "rejected",
      "withdrawn",
    ])
      .default("pending")
      .notNull(),
    reviewerId: integer("reviewerId"),
    reviewerNote: varchar("reviewerNote", { length: 1000 }),
    reviewedAt: timestamp("reviewedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  table => ({
    statusIndex: index("student_scholarship_status_idx").on(
      table.status,
      table.createdAt
    ),
  })
);

export const studentProEntitlements = pgTable(
  "student_pro_entitlements",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull().unique(),
    applicationId: integer("applicationId").notNull().unique(),
    plan: enumText("plan", ["pro"]).default("pro").notNull(),
    status: enumText("status", ["active", "expired", "revoked"])
      .default("active")
      .notNull(),
    dailyLimit: integer("dailyLimit").default(20).notNull(),
    monthlyLimit: integer("monthlyLimit").default(300).notNull(),
    startsAt: timestamp("startsAt").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  table => ({
    activeExpiryIndex: index("student_pro_expiry_idx").on(
      table.status,
      table.expiresAt
    ),
  })
);

export const studentProUsageCounters = pgTable(
  "student_pro_usage_counters",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    entitlementId: integer("entitlementId").notNull(),
    period: enumText("period", ["day", "month"]).notNull(),
    periodStart: timestamp("periodStart").notNull(),
    units: integer("units").default(0).notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    usageUnique: unique("student_pro_usage_unique").on(
      table.userId,
      table.entitlementId,
      table.period,
      table.periodStart
    ),
  })
);

export type StudentScholarshipApplication =
  typeof studentScholarshipApplications.$inferSelect;
export type StudentProEntitlement = typeof studentProEntitlements.$inferSelect;
export type StudentProUsageCounter =
  typeof studentProUsageCounters.$inferSelect;

export const agentTraces = pgTable(
  "agent_traces",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    traceKey: varchar("traceKey", { length: 96 }).notNull(),
    agentId: varchar("agentId", { length: 80 }).notNull(),
    agentName: varchar("agentName", { length: 120 }).notNull(),
    department: varchar("department", { length: 160 }).notNull(),
    status: enumText("status", [
      "queued",
      "running",
      "paused_for_approval",
      "completed",
      "failed",
    ]).notNull(),
    providerMode: enumText("providerMode", [
      "mock",
      "provider-gated",
      "local",
    ]).notNull(),
    requestLabel: varchar("requestLabel", { length: 240 }).notNull(),
    evidenceCount: integer("evidenceCount").default(0).notNull(),
  approvalRequired: integer("approvalRequired").default(0).notNull(),
    startedAt: timestamp("startedAt").notNull(),
    endedAt: timestamp("endedAt"),
    steps: text("steps").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    ownerTraceIndex: index("agent_traces_owner_created_idx").on(
      table.userId,
      table.createdAt
    ),
    traceKeyUnique: unique("agent_traces_user_key_unique").on(
      table.userId,
      table.traceKey
    ),
  })
);

export const performanceSnapshots = pgTable(
  "performance_snapshots",
  {
    id: serial("id").primaryKey(),
    module: varchar("module", { length: 120 }).notNull(),
    route: varchar("route", { length: 160 }).notNull(),
    p50Ms: integer("p50Ms").notNull(),
    p95Ms: integer("p95Ms").notNull(),
    errorRateBps: integer("errorRateBps").default(0).notNull(),
    sampleCount: integer("sampleCount").default(0).notNull(),
    source: enumText("source", ["lab", "field", "synthetic"]).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    moduleCreatedIndex: index("performance_snapshots_module_created_idx").on(
      table.module,
      table.createdAt
    ),
  })
);

export const benchmarkRuns = pgTable("benchmark_runs", {
  id: serial("id").primaryKey(),
  suiteVersion: varchar("suiteVersion", { length: 40 }).notNull(),
  language: varchar("language", { length: 16 }).default("bn").notNull(),
  status: enumText("status", ["passed", "failed", "blocked"]).notNull(),
  scoreBps: integer("scoreBps").notNull(),
  sampleCount: integer("sampleCount").default(0).notNull(),
  resultJson: text("resultJson").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const releaseGateChecks = pgTable("release_gate_checks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  category: enumText("category", [
    "quality",
    "security",
    "performance",
    "provider",
    "operations",
  ]).notNull(),
  status: enumText("status", ["pending", "pass", "fail", "waived"]).notNull(),
  thresholdLabel: varchar("thresholdLabel", { length: 180 }).notNull(),
  observedLabel: varchar("observedLabel", { length: 180 }).notNull(),
  details: varchar("details", { length: 1000 }).notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const oauthTestRuns = pgTable(
  "oauth_test_runs",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    provider: varchar("provider", { length: 80 }).notNull(),
    scenario: varchar("scenario", { length: 80 }).notNull(),
    outcome: enumText("outcome", ["passed", "failed", "blocked"]).notNull(),
    scopes: varchar("scopes", { length: 1000 }).notNull(),
    detail: varchar("detail", { length: 1000 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    oauthOwnerIndex: index("oauth_test_runs_owner_created_idx").on(
      table.userId,
      table.createdAt
    ),
  })
);

export type AgentTrace = typeof agentTraces.$inferSelect;
export type PerformanceSnapshot = typeof performanceSnapshots.$inferSelect;
export type BenchmarkRun = typeof benchmarkRuns.$inferSelect;
export type ReleaseGateCheck = typeof releaseGateChecks.$inferSelect;
export type OAuthTestRun = typeof oauthTestRuns.$inferSelect;

/** Privacy-safe lifecycle evidence; payloads and file bytes are never stored here. */
export const dataLifecycleEvents = pgTable(
  "data_lifecycle_events",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId"),
    subjectType: varchar("subjectType", { length: 64 }).notNull(),
    subjectId: varchar("subjectId", { length: 128 }).notNull(),
    action: enumText("action", [
      "retention_scheduled",
      "retention_expired",
      "deletion_requested",
      "deletion_verified",
      "deletion_failed",
      "tombstone_written",
    ]).notNull(),
    outcome: enumText("outcome", [
      "recorded",
      "completed",
      "failed",
      "blocked",
    ]).notNull(),
    evidenceHash: varchar("evidenceHash", { length: 128 }),
    requestId: varchar("requestId", { length: 128 }),
    details: varchar("details", { length: 1000 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    lifecycleSubjectIndex: index("data_lifecycle_subject_idx").on(
      table.subjectType,
      table.subjectId,
      table.createdAt
    ),
    lifecycleUserIndex: index("data_lifecycle_user_idx").on(
      table.userId,
      table.createdAt
    ),
  })
);

/** Provider-neutral billing event inbox; event payloads are not retained after normalization. */
export const billingWebhookEvents = pgTable(
  "billing_webhook_events",
  {
    id: serial("id").primaryKey(),
    provider: varchar("provider", { length: 64 }).notNull(),
    eventId: varchar("eventId", { length: 160 }).notNull(),
    eventType: varchar("eventType", { length: 160 }).notNull(),
  signatureVerified: integer("signatureVerified").default(0).notNull(),
    status: enumText("status", [
      "received",
      "processed",
      "ignored",
      "failed",
      "blocked",
    ])
      .default("received")
      .notNull(),
    requestId: varchar("requestId", { length: 128 }),
    processedAt: timestamp("processedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    billingEventUnique: unique("billing_webhook_provider_event_unique").on(
      table.provider,
      table.eventId
    ),
    billingStatusIndex: index("billing_webhook_status_created_idx").on(
      table.status,
      table.createdAt
    ),
  })
);

export type DataLifecycleEvent = typeof dataLifecycleEvents.$inferSelect;
export type BillingWebhookEvent = typeof billingWebhookEvents.$inferSelect;


/**
 * User-owned CRM records. Consent to generate a draft is deliberately separate
 * from consent to contact a person; records default to unknown/no outreach.
 */
export const leadRecords = pgTable(
  "lead_records",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 240 }).notNull(),
    company: varchar("company", { length: 180 }),
    contactName: varchar("contactName", { length: 160 }),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 40 }),
    website: varchar("website", { length: 500 }),
    source: varchar("source", { length: 120 }).notNull().default("user-entered"),
    sourceUrl: varchar("sourceUrl", { length: 1000 }),
    sourceEvidence: text("sourceEvidence"),
    country: varchar("country", { length: 80 }),
    language: varchar("language", { length: 80 }),
    industry: varchar("industry", { length: 80 }),
    notes: text("notes"),
    draftSubject: varchar("draftSubject", { length: 240 }),
    draftBody: text("draftBody"),
    status: enumText("status", ["new", "qualified", "contacted", "interested", "converted", "lost"]).default("new").notNull(),
    consentStatus: enumText("consentStatus", ["unknown", "granted", "withdrawn", "not_required"]).default("unknown").notNull(),
    consentSource: varchar("consentSource", { length: 240 }),
    consentCapturedAt: timestamp("consentCapturedAt"),
    nextFollowUpAt: timestamp("nextFollowUpAt"),
    archivedAt: timestamp("archivedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  table => ({
    ownerCreatedIndex: index("lead_records_owner_created_idx").on(table.userId, table.createdAt),
    ownerStatusIndex: index("lead_records_owner_status_created_idx").on(table.userId, table.status, table.createdAt),
    ownerFollowUpIndex: index("lead_records_owner_followup_idx").on(table.userId, table.nextFollowUpAt),
  })
);

export const leadActivities = pgTable(
  "lead_activities",
  {
    id: serial("id").primaryKey(),
    leadId: integer("leadId").notNull().references(() => leadRecords.id, { onDelete: "cascade" }),
    userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    activityType: enumText("activityType", ["created", "note", "status_changed", "follow_up_scheduled", "consent_updated"]).notNull(),
    summary: varchar("summary", { length: 500 }).notNull(),
    details: text("details"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    leadActivityTimelineIndex: index("lead_activities_lead_created_idx").on(table.leadId, table.createdAt),
    ownerActivityTimelineIndex: index("lead_activities_owner_created_idx").on(table.userId, table.createdAt),
  })
);

export type LeadRecord = typeof leadRecords.$inferSelect;
export type InsertLeadRecord = typeof leadRecords.$inferInsert;
export type LeadActivity = typeof leadActivities.$inferSelect;

export const aiProviderRateLimits = pgTable("ai_provider_rate_limits", {
  subjectHash: varchar("subject_hash", { length: 64 }).notNull(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  requestCount: smallint("request_count").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.subjectHash, t.windowStart] })]);

export const dsaiR2UsageCounters = pgTable("dsai_r2_usage_counters", {
  periodStart: date("period_start").notNull(),
  metric: text("metric").notNull(),
  used: bigint("used", { mode: "number" }).default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.periodStart, t.metric] })]);

export const generatedImages = pgTable("generated_images", {
  id: uuid("id").defaultRandom().notNull(),
  userId: integer("user_id").notNull(),
  prompt: text("prompt").notNull(),
  model: text("model").notNull(),
  storagePath: text("storage_path").notNull(),
  mimeType: text("mime_type").notNull(),
  byteSize: integer("byte_size").notNull(),
  status: text("status").default("completed").notNull(),
  providerCostUsd: numeric("provider_cost_usd", { precision: 12, scale: 6 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const imageGenerationDailyUsers = pgTable("image_generation_daily_users", {
  usageDate: date("usage_date").notNull(),
  userId: integer("user_id").notNull(),
  reservations: smallint("reservations").default(0).notNull(),
  successfulCount: smallint("successful_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastReservedAt: timestamp("last_reserved_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.usageDate, t.userId] })]);

export const imageGenerationUsage = pgTable("image_generation_usage", {
  userId: integer("user_id").notNull(),
  usageDate: date("usage_date").notNull(),
  requestCount: smallint("request_count").default(0).notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.usageDate] })]);

export const aiProviderQuotaEvents = privateSchema.table("ai_provider_quota_events", {
  id: bigint("id", { mode: "number" }).notNull(),
  provider: text("provider").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const documentKnowledgeChunks = privateSchema.table("document_knowledge_chunks", {
  id: bigint("id", { mode: "number" }).notNull(),
  documentId: bigint("document_id", { mode: "number" }).notNull(),
  userId: integer("user_id").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  tokenCount: integer("token_count"),
  embeddingModel: text("embedding_model").default("@cf/baai/bge-m3").notNull(),
  embedding: text("embedding").notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const documentKnowledgeDocuments = privateSchema.table("document_knowledge_documents", {
  id: bigint("id", { mode: "number" }).notNull(),
  userId: integer("user_id").notNull(),
  fileAssetId: integer("file_asset_id").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  contentSha256: char("content_sha256", { length: 64 }).notNull(),
  embeddingModel: text("embedding_model").default("@cf/baai/bge-m3").notNull(),
  embeddingDimension: smallint("embedding_dimension").default(1024).notNull(),
  status: text("status").default("queued").notNull(),
  chunkCount: integer("chunk_count").default(0).notNull(),
  errorCode: text("error_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const imageGenerationProviderDailyUsage = privateSchema.table("image_generation_provider_daily_usage", {
  usageDate: date("usage_date").notNull(),
  requestCount: integer("request_count").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.usageDate] })]);

export const imageGenerationProviderMinuteUsage = privateSchema.table("image_generation_provider_minute_usage", {
  minuteStart: timestamp("minute_start", { withTimezone: true }).notNull(),
  requestCount: integer("request_count").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.minuteStart] })]);


/** Durable, server-only Work Desk document tasks. */
export const documentTasks = privateSchema.table("document_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileAssetId: integer("file_asset_id").notNull().references(() => fileAssets.id, { onDelete: "cascade" }),
  taskType: text("task_type").default("extract_text").notNull(),
  status: text("status").default("queued").notNull(),
  language: text("language").default("bn").notNull(),
  idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull(),
  contentSha256: char("content_sha256", { length: 64 }).notNull(),
  attemptCount: smallint("attempt_count").default(0).notNull(),
  maxAttempts: smallint("max_attempts").default(3).notNull(),
  nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),
  leaseToken: uuid("lease_token"),
  leaseExpiresAt: timestamp("lease_expires_at", { withTimezone: true }),
  cancelRequestedAt: timestamp("cancel_requested_at", { withTimezone: true }),
  resultJson: jsonb("result_json"),
  extractedText: text("extracted_text"),
  errorCode: varchar("error_code", { length: 80 }),
  errorMessage: varchar("error_message", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (t) => [
  unique("document_tasks_user_idempotency_unique").on(t.userId, t.idempotencyKey),
  index("document_tasks_user_created_idx").on(t.userId, t.createdAt),
  index("document_tasks_queue_idx").on(t.status, t.nextRetryAt, t.createdAt),
  index("document_tasks_lease_idx").on(t.leaseExpiresAt),
  index("document_tasks_file_asset_idx").on(t.fileAssetId, t.createdAt),
]);

export const documentTaskEvents = privateSchema.table("document_task_events", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
  taskId: uuid("task_id").notNull().references(() => documentTasks.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  attemptCount: smallint("attempt_count").default(0).notNull(),
  detailJson: jsonb("detail_json").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("document_task_events_task_created_idx").on(t.taskId, t.createdAt),
  index("document_task_events_user_created_idx").on(t.userId, t.createdAt),
]);


/** Durable text-only Work Desk tasks; no file or malware-scanner dependency. */
export const workdeskTextTasks = privateSchema.table("workdesk_text_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull(),
  language: varchar("language", { length: 8 }).default("bn").notNull(),
  prompt: text("prompt").notNull(),
  status: text("status").default("queued").notNull(),
  resultText: text("result_text"),
  errorCode: varchar("error_code", { length: 80 }),
  attemptCount: smallint("attempt_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (t) => [
  unique("workdesk_text_tasks_user_idempotency_unique").on(t.userId, t.idempotencyKey),
  index("workdesk_text_tasks_user_created_idx").on(t.userId, t.createdAt),
]);
