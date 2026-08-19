import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const auth = readFileSync(resolve(root, "client/src/pages/AuthLogin.tsx"), "utf8");
const payments = readFileSync(resolve(root, "client/src/pages/AdminPayments.tsx"), "utf8");
const register = readFileSync(resolve(root, "DSAI_OWNERSHIP_CONTROL_REGISTER_INTERNAL.md"), "utf8");
const research = readFileSync(resolve(root, "DSAI_BENCHMARK_AND_BRANDING_RESEARCH_2026-08.md"), "utf8");

describe("ownership, terms, market wording, and payment safety", () => {
  it("requires explicit controlled-alpha acknowledgement before OAuth starts", () => {
    expect(auth).toContain("termsAccepted");
    expect(auth).toContain("AI-operated");
    expect(auth).toContain("double-check");
    expect(auth).toContain("Checkbox ছাড়া login শুরু হবে না");
  });

  it("keeps the internal register free of direct identity fields", () => {
    expect(register).toContain("Non-public operational record");
    expect(register).toContain("No |");
    expect(register).toContain("Legal entity / trade registration");
    expect(register).not.toMatch(/\b\d{10,17}\b/);
  });

  it("uses evidence-aware market language", () => {
    expect(research).toContain("absence of evidence is not proof of absence");
    expect(research).toContain("do not claim category monopoly");
    expect(research).not.toMatch(/no comparable AI platform exists|only platform in the world/i);
  });

  it("keeps payment channels ordered and disabled by default", () => {
    expect(payments.indexOf('key: "card"')).toBeGreaterThanOrEqual(0);
    expect(payments.indexOf('key: "bkash"')).toBeGreaterThan(payments.indexOf('key: "card"'));
    expect(payments.indexOf('key: "nagad"')).toBeGreaterThan(payments.indexOf('key: "bkash"'));
    expect(payments.indexOf('key: "rocket"')).toBeGreaterThan(payments.indexOf('key: "nagad"'));
    expect(payments).toContain("Live charge: off");
    expect(payments).toContain("This page does not process payments");
  });
});
