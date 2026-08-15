import { describe, expect, it } from "vitest";

describe("DSAI branding configuration", () => {
  it("uses the requested public application title", () => {
    expect(process.env.VITE_APP_TITLE).toBe("DSAI");
  });
});
