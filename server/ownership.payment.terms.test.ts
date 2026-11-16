import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const auth = readFileSync(resolve(root, "client/src/pages/AuthLogin.tsx"), "utf8");
const authClient = readFileSync(resolve(root, "client/src/lib/supabaseAuthClient.ts"), "utf8");
const authSdk = readFileSync(resolve(root, "server/_core/sdk.ts"), "utf8");
const imageFunction = readFileSync(resolve(root, "supabase/functions/dsai-image-generate/index.ts"), "utf8");
const fileUploadPanel = readFileSync(resolve(root, "client/src/components/FileUploadPanel.tsx"), "utf8");
const trpcCore = readFileSync(resolve(root, "server/_core/trpc.ts"), "utf8");
const aiProviders = readFileSync(resolve(root, "server/aiProviders.ts"), "utf8");
const workspace = readFileSync(resolve(root, "client/src/pages/Workspace.tsx"), "utf8");
const payments = readFileSync(resolve(root, "client/src/pages/AdminPayments.tsx"), "utf8");
const register = readFileSync(resolve(root, "DSAI_OWNERSHIP_CONTROL_REGISTER_INTERNAL.md"), "utf8");
const research = readFileSync(resolve(root, "DSAI_BENCHMARK_AND_BRANDING_RESEARCH_2026-08.md"), "utf8");

describe("ownership, terms, market wording, and payment safety", () => {
  it("requires explicit controlled-alpha acknowledgement and verified Supabase accounts", () => {
    expect(auth).toContain("termsAccepted");
    expect(auth).toContain("AI-operated");
    expect(auth).toContain("double-check");
    expect(auth).toContain("signInWithPassword");
    expect(auth).toContain("signUpWithPassword");
    expect(auth).toContain("signInAnonymously");
    expect(auth).toContain("TurnstileWidget");
    expect(authClient).toContain("captcha_token");
    expect(authSdk).toContain("isAnonymous");
    expect(imageFunction).toContain("const isAnonymous");
    // The OpenRouter key name is allowed only in the server Edge Function's
    // Vault lookup; never read it from a public environment variable.
    expect(imageFunction).toContain('secret(admin, "OPENROUTER_API_KEY")');
    expect(imageFunction).not.toContain('Deno.env.get("OPENROUTER_API_KEY")');
    expect(imageFunction).toContain("recraft/recraft-v4.1-flash-v2:free");
    expect(imageFunction).toContain("provider: { allow_fallbacks: false }");
    expect(imageFunction).toContain("reportedCost > 0");
    expect(imageFunction).not.toContain("apihub.agnes-ai.com");
    expect(imageFunction).not.toContain("api.cloudflare.com/client/v4/accounts/");
    expect(fileUploadPanel).toContain('file.scanStatus === "clean" && <Button');
    expect(fileUploadPanel).not.toContain('file.scanStatus === "clean" || file.scanStatus === "validated"');
    expect(trpcCore).toContain('opts.path !== "auth.me"');
    expect(aiProviders).toContain('input.preferredProvider ?? "openrouter"');
    expect(aiProviders).toContain("FREE_ONLY_MODE");
    expect(aiProviders).toContain("openrouter/free");
    expect(aiProviders).toContain("paid_provider_blocked_in_free_only_mode");
    expect(workspace).toContain("trpc.aiAssistant.complete");
    expect(auth).toContain("Supabase Auth");
    expect(auth).not.toContain("VITE_OAUTH_PORTAL_URL");
    expect(auth).not.toContain("OAuth portal URL");
    expect(auth).not.toContain("Account login এই deployment-এ চালু নেই");
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
