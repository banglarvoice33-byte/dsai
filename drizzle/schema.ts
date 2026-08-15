import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
