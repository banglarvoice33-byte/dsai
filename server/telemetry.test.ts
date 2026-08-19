import { describe, expect, it, vi } from "vitest";
import { emitTelemetry, redactTelemetryAttributes } from "./telemetry";

describe("centralized telemetry", () => {
  it("redacts secret-bearing attributes while retaining safe dimensions", () => {
    const result = redactTelemetryAttributes({ requestId: "req-1", statusCode: 200, authorization: "Bearer secret", prompt: "private" });
    expect(result.requestId).toBe("req-1");
    expect(result.statusCode).toBe(200);
    expect(result.authorization).toBe("[REDACTED]");
    expect(result.prompt).toBe("[REDACTED]");
  });

  it("emits a structured event with a timestamp", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const record = emitTelemetry("test.event", { module: "quality", count: 1 });
    expect(record.event).toBe("test.event");
    expect(record.timestamp).toMatch(/^20/);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
