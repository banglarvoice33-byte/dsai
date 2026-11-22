import { describe, expect, it } from "vitest";
import { getReleaseGateStatus } from "./operationsReleaseStatus";

describe("getReleaseGateStatus", () => {
  it("does not treat an empty gate table as a successful release", () => {
    expect(getReleaseGateStatus({ total: 0, passed: 0, failed: 0, pending: 0 })).toEqual({
      label: "No release-gate evidence recorded",
      tone: "warn",
    });
  });

  it("reports a failure before any other status", () => {
    expect(getReleaseGateStatus({ total: 3, passed: 1, failed: 1, pending: 1 })).toEqual({
      label: "Release gate failure recorded",
      tone: "bad",
    });
  });

  it("reports pending evidence as a warning", () => {
    expect(getReleaseGateStatus({ total: 2, passed: 1, failed: 0, pending: 1 })).toEqual({
      label: "Pending release gates",
      tone: "warn",
    });
  });

  it("reports success only when every recorded gate is passed", () => {
    expect(getReleaseGateStatus({ total: 3, passed: 3, failed: 0, pending: 0 })).toEqual({
      label: "All recorded release gates passed",
      tone: "good",
    });
  });

  it("does not hide unclassified gate records", () => {
    expect(getReleaseGateStatus({ total: 2, passed: 1, failed: 0, pending: 0 })).toEqual({
      label: "Release-gate evidence is incomplete",
      tone: "warn",
    });
  });
});
