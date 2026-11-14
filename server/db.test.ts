import { describe, expect, it } from "vitest";
import { resolveDatabaseSsl } from "./db";

describe("database TLS policy", () => {
  it("requires TLS by default for remote database connections", () => {
    expect(resolveDatabaseSsl("postgresql://user:pass@db.example.com:5432/app", undefined)).toBe("require");
  });

  it("allows explicit TLS disable for the local Compose postgres service", () => {
    expect(resolveDatabaseSsl("postgresql://user:pass@postgres:5432/app", "disable")).toBe(false);
  });

  it("allows explicit TLS disable for loopback-only local development", () => {
    expect(resolveDatabaseSsl("postgresql://user:pass@127.0.0.1:5432/app", "disable")).toBe(false);
  });

  it("still requires TLS when disable is requested for a remote host", () => {
    expect(resolveDatabaseSsl("postgresql://user:pass@db.example.com:5432/app", "disable")).toBe("require");
  });

  it("does not disable TLS for an unknown host", () => {
    expect(resolveDatabaseSsl("postgresql://user:pass@database.internal:5432/app", "disable")).toBe("require");
  });
});
