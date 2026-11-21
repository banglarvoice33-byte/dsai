import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createContractSnapshot, hashAcknowledgmentToken, sha256Hex } from "./contractAcknowledgment";

const service = readFileSync(new URL("./contractAcknowledgment.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20261121130000_dsai_contract_acknowledgment.sql", import.meta.url), "utf8");
const router = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const composer = readFileSync(new URL("../client/src/pages/LeadComposer.tsx", import.meta.url), "utf8");
const panel = readFileSync(new URL("../client/src/components/ContractAcknowledgmentPanel.tsx", import.meta.url), "utf8");
const publicPage = readFileSync(new URL("../client/src/pages/ConfirmAcknowledgment.tsx", import.meta.url), "utf8");

describe("DSAI one-time customer acknowledgment", () => {
  it("creates a canonical immutable snapshot and deterministic SHA-256 evidence", () => {
    const snapshot = createContractSnapshot("  চুক্তির নথি  ", "প্রথম লাইন\r\nদ্বিতীয় লাইন");
    expect(snapshot).toEqual({ version: 1, title: "চুক্তির নথি", body: "প্রথম লাইন\nদ্বিতীয় লাইন" });
    expect(sha256Hex(JSON.stringify(snapshot))).toMatch(/^[a-f0-9]{64}$/);
    expect(sha256Hex(JSON.stringify(snapshot))).toBe(sha256Hex(JSON.stringify(snapshot)));
  });

  it("rejects empty, oversized and malformed acknowledgment tokens", () => {
    expect(() => createContractSnapshot(" ", "body")).toThrow("invalid_document_title");
    expect(() => createContractSnapshot("title", " ")).toThrow("invalid_document_body");
    expect(() => createContractSnapshot("title", "x".repeat(30_001))).toThrow("invalid_document_body");
    expect(() => hashAcknowledgmentToken("not-a-token")).toThrow("invalid_acknowledgment_token");
  });

  it("hashes high-entropy link tokens before persistence", () => {
    const token = "A".repeat(43);
    const hashed = hashAcknowledgmentToken(token);
    expect(hashed).toMatch(/^[a-f0-9]{64}$/);
    expect(hashed).not.toBe(token);
    expect(service).toContain('randomBytes(32).toString("base64url")');
    expect(service).toContain("const tokenHash = sha256Hex(token)");
    expect(service).toContain("VALUES");
    expect(service).not.toContain("INSERT INTO private.contract_acknowledgments (owner_user_id, token)");
  });

  it("enforces one-time confirmation and a server-side three-second minimum view", () => {
    expect(service).toContain("status = 'pending'");
    expect(service).toContain("status = 'acknowledged'");
    expect(service).toContain("first_viewed_at <= now() - interval");
    expect(service).toContain("MIN_VIEW_SECONDS = 3");
    expect(service).toContain("already_acknowledged");
  });

  it("keeps the snapshot and recipient immutable and audit events append-only", () => {
    expect(migration).toContain("contract_ack_snapshot_immutable");
    expect(migration).toContain("document_snapshot IS DISTINCT FROM NEW.document_snapshot");
    expect(migration).toContain("contract_ack_events_append_only");
    expect(migration).toContain("contract acknowledgment events are immutable");
  });

  it("denies direct browser database access and grants only the server role", () => {
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
    expect(migration).toContain("FORCE ROW LEVEL SECURITY");
    expect(migration).toContain("AS RESTRICTIVE FOR ALL TO anon, authenticated");
    expect(migration).toContain("USING (false) WITH CHECK (false)");
    expect(migration).toContain("REVOKE ALL ON private.contract_acknowledgments FROM PUBLIC, anon, authenticated");
    expect(migration).toContain("GRANT SELECT, INSERT, UPDATE ON private.contract_acknowledgments TO service_role");
  });

  it("exposes owner operations only to authenticated users and recipient operations publicly by token", () => {
    expect(router).toContain("status: protectedProcedure");
    expect(router).toContain("create: protectedProcedure");
    expect(router).toContain("list: protectedProcedure");
    expect(router).toContain("open: publicProcedure");
    expect(router).toContain("confirm: publicProcedure");
  });

  it("presents the customer acknowledgment boundary honestly in Bengali", () => {
    expect(composer).toContain("<ContractAcknowledgmentPanel");
    expect(panel).toContain("পরিচয়-যাচাইকৃত বা আইনগত ই-স্বাক্ষর নয়");
    expect(panel).toContain("DSAI নিজে কোনো ইমেইল বা SMS পাঠাবে না");
    expect(publicPage).toContain("আমি নথিটি গ্রহণ করেছি");
    expect(publicPage).toContain("নামটি আপনার নিজের দেওয়া তথ্য");
    expect(publicPage).toContain("remainingSeconds > 0");
  });

  it("fails closed while the feature flag is disabled", () => {
    expect(service).toContain('process.env.CONTRACT_ACKNOWLEDGMENT_ENABLED === "true"');
    expect(service).toContain("acknowledgment_disabled");
  });
});
