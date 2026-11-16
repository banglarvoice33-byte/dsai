import { describe, expect, it } from "vitest";
import { DSAI_CAPABILITY_MATRIX } from "@shared/capabilityMatrix";
import { buildVideoCacheKey, chooseBatchPolicy, validateVideoJob } from "./videoCostPolicy";

describe("capability matrix", () => {
  it("covers government, private, and cross-sector service classes", () => {
    expect(new Set(DSAI_CAPABILITY_MATRIX.map(item => item.sector))).toEqual(new Set(["government", "private", "cross-sector"]));
    expect(DSAI_CAPABILITY_MATRIX.every(item => item.evidence.length >= 2 && item.humanGate.length > 15)).toBe(true);
  });
  it("does not overclaim live media or OCR services", () => {
    expect(DSAI_CAPABILITY_MATRIX.find(item => item.id === "private-creative")?.status).toBe("preview");
    expect(DSAI_CAPABILITY_MATRIX.find(item => item.id === "cross-file")?.specializationGap).toContain("ClamAV");
    expect(DSAI_CAPABILITY_MATRIX.find(item => item.id === "private-image-generation")?.status).toBe("provider-gated");
    expect(DSAI_CAPABILITY_MATRIX.find(item => item.id === "private-image-generation")?.specializationGap.toLowerCase()).toContain("authenticated");
    expect(DSAI_CAPABILITY_MATRIX.find(item => item.id === "private-creative")?.status).toBe("preview");
  });
});

describe("lawful video cost policy", () => {
  const base = { mode: "text-to-video" as const, prompt: "বৃষ্টির দৃশ্য", durationSeconds: 4, width: 640, height: 360, audio: false };
  it("permits a bounded low-resolution preview and rejects audio in the free tier", () => {
    expect(validateVideoJob(base, "preview").ok).toBe(true);
    expect(validateVideoJob({ ...base, audio: true }, "preview").reasons).toContain("audio-disabled-in-free-preview");
  });
  it("rejects budget overruns instead of silently increasing spend", () => {
    expect(validateVideoJob({ ...base, durationSeconds: 8 }, "preview").reasons).toContain("duration-budget");
    expect(validateVideoJob({ ...base, width: 1920, height: 1080 }, "standard").reasons).toContain("resolution-budget");
  });
  it("creates a stable deduplication key and bounded batch policy", () => {
    expect(buildVideoCacheKey(base, "preview")).toBe(buildVideoCacheKey(base, "preview"));
    expect(chooseBatchPolicy(1).mode).toBe("immediate");
    expect(chooseBatchPolicy(20).maxBatch).toBe(8);
  });
});
