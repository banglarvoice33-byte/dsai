CREATE TABLE "access_cases" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"title" varchar(180) NOT NULL,
	"workflow" text NOT NULL,
	"language" varchar(16) DEFAULT 'bn' NOT NULL,
	"riskLevel" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_traces" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"traceKey" varchar(96) NOT NULL,
	"agentId" varchar(80) NOT NULL,
	"agentName" varchar(120) NOT NULL,
	"department" varchar(160) NOT NULL,
	"status" text NOT NULL,
	"providerMode" text NOT NULL,
	"requestLabel" varchar(240) NOT NULL,
	"evidenceCount" integer DEFAULT 0 NOT NULL,
	"approvalRequired" integer DEFAULT 0 NOT NULL,
	"startedAt" timestamp NOT NULL,
	"endedAt" timestamp,
	"steps" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agent_traces_user_key_unique" UNIQUE("userId","traceKey")
);
--> statement-breakpoint
CREATE TABLE "benchmark_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"suiteVersion" varchar(40) NOT NULL,
	"language" varchar(16) DEFAULT 'bn' NOT NULL,
	"status" text NOT NULL,
	"scoreBps" integer NOT NULL,
	"sampleCount" integer DEFAULT 0 NOT NULL,
	"resultJson" text NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_webhook_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" varchar(64) NOT NULL,
	"eventId" varchar(160) NOT NULL,
	"eventType" varchar(160) NOT NULL,
	"signatureVerified" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"requestId" varchar(128),
	"processedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "billing_webhook_provider_event_unique" UNIQUE("provider","eventId")
);
--> statement-breakpoint
CREATE TABLE "changelog_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"version" varchar(40) NOT NULL,
	"title" varchar(180) NOT NULL,
	"summary" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"category" text DEFAULT 'feature' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"publishedAt" timestamp,
	"createdBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creative_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"prompt" text NOT NULL,
	"tier" text DEFAULT 'free' NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_lifecycle_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"subjectType" varchar(64) NOT NULL,
	"subjectId" varchar(128) NOT NULL,
	"action" text NOT NULL,
	"outcome" text NOT NULL,
	"evidenceHash" varchar(128),
	"requestId" varchar(128),
	"details" varchar(1000),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deletion_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"userId" integer,
	"scope" text DEFAULT 'account' NOT NULL,
	"details" varchar(2000),
	"identityConfirmed" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewedBy" integer,
	"reviewedAt" timestamp,
	"operatorNote" varchar(2000),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"storageKey" varchar(512) NOT NULL,
	"originalName" varchar(255) NOT NULL,
	"mimeType" varchar(128) NOT NULL,
	"byteSize" integer NOT NULL,
	"sha256" varchar(64) NOT NULL,
	"scanStatus" text DEFAULT 'quarantined' NOT NULL,
	"scanProvider" varchar(80),
	"scanMessage" varchar(500),
	"retentionExpiresAt" timestamp NOT NULL,
	"scannedAt" timestamp,
	"deletedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "file_assets_storageKey_unique" UNIQUE("storageKey")
);
--> statement-breakpoint
CREATE TABLE "integration_connectors" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"label" varchar(160) NOT NULL,
	"category" text NOT NULL,
	"enabled" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'disabled' NOT NULL,
	"lastCheckedAt" timestamp,
	"lastError" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "integration_connectors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "oauth_test_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"provider" varchar(80) NOT NULL,
	"scenario" varchar(80) NOT NULL,
	"outcome" text NOT NULL,
	"scopes" varchar(1000) NOT NULL,
	"detail" varchar(1000) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"module" varchar(120) NOT NULL,
	"route" varchar(160) NOT NULL,
	"p50Ms" integer NOT NULL,
	"p95Ms" integer NOT NULL,
	"errorRateBps" integer DEFAULT 0 NOT NULL,
	"sampleCount" integer DEFAULT 0 NOT NULL,
	"source" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "release_gate_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"category" text NOT NULL,
	"status" text NOT NULL,
	"thresholdLabel" varchar(180) NOT NULL,
	"observedLabel" varchar(180) NOT NULL,
	"details" varchar(1000) NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"normalizedTerm" varchar(160) NOT NULL,
	"source" varchar(32) DEFAULT 'homepage' NOT NULL,
	"searchCount" integer DEFAULT 0 NOT NULL,
	"lastSearchedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "search_analytics_term_source_unique" UNIQUE("normalizedTerm","source")
);
--> statement-breakpoint
CREATE TABLE "student_pro_entitlements" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"applicationId" integer NOT NULL,
	"plan" text DEFAULT 'pro' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"dailyLimit" integer DEFAULT 20 NOT NULL,
	"monthlyLimit" integer DEFAULT 300 NOT NULL,
	"startsAt" timestamp NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_pro_entitlements_userId_unique" UNIQUE("userId"),
	CONSTRAINT "student_pro_entitlements_applicationId_unique" UNIQUE("applicationId")
);
--> statement-breakpoint
CREATE TABLE "student_pro_usage_counters" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"entitlementId" integer NOT NULL,
	"period" text NOT NULL,
	"periodStart" timestamp NOT NULL,
	"units" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_pro_usage_unique" UNIQUE("userId","entitlementId","period","periodStart")
);
--> statement-breakpoint
CREATE TABLE "student_scholarship_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"language" varchar(16) DEFAULT 'bn' NOT NULL,
	"country" varchar(80) NOT NULL,
	"institution" varchar(180) NOT NULL,
	"verificationMethod" text DEFAULT 'manual_review' NOT NULL,
	"evidenceReferenceHash" varchar(128),
	"ageAttested18Plus" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewerId" integer,
	"reviewerNote" varchar(1000),
	"reviewedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_scholarship_applications_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "student_scholarship_programs" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"maxSeats" integer DEFAULT 100 NOT NULL,
	"approvedSeats" integer DEFAULT 0 NOT NULL,
	"active" integer DEFAULT 1 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" text DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "waitlist_signups" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"interest" text DEFAULT 'both' NOT NULL,
	"language" varchar(16) DEFAULT 'bn' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_signups_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "agent_traces_owner_created_idx" ON "agent_traces" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "billing_webhook_status_created_idx" ON "billing_webhook_events" USING btree ("status","createdAt");--> statement-breakpoint
CREATE INDEX "data_lifecycle_subject_idx" ON "data_lifecycle_events" USING btree ("subjectType","subjectId","createdAt");--> statement-breakpoint
CREATE INDEX "data_lifecycle_user_idx" ON "data_lifecycle_events" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "file_assets_user_status_idx" ON "file_assets" USING btree ("userId","scanStatus");--> statement-breakpoint
CREATE INDEX "file_assets_retention_idx" ON "file_assets" USING btree ("retentionExpiresAt","scanStatus");--> statement-breakpoint
CREATE INDEX "oauth_test_runs_owner_created_idx" ON "oauth_test_runs" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "performance_snapshots_module_created_idx" ON "performance_snapshots" USING btree ("module","createdAt");--> statement-breakpoint
CREATE INDEX "student_pro_expiry_idx" ON "student_pro_entitlements" USING btree ("status","expiresAt");--> statement-breakpoint
CREATE INDEX "student_scholarship_status_idx" ON "student_scholarship_applications" USING btree ("status","createdAt");