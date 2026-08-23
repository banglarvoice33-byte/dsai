import { describe, expect, it } from "vitest";
import { BUSINESS_MARKETS } from "@shared/businessMarkets";
import { filterBusinessMarkets } from "@shared/businessMarketSearch";

describe("business market search", () => {
  it("matches country, language, currency, and region values", () => {
    expect(filterBusinessMarkets(BUSINESS_MARKETS, "Canada", "all").map((market) => market.id)).toEqual(["ca"]);
    expect(filterBusinessMarkets(BUSINESS_MARKETS, "EUR", "Europe").length).toBeGreaterThan(1);
    expect(filterBusinessMarkets(BUSINESS_MARKETS, "Bengali", "all").map((market) => market.id)).toContain("bd");
  });

  it("returns all markets when query and region are unfiltered", () => {
    expect(filterBusinessMarkets(BUSINESS_MARKETS, "", "all")).toHaveLength(40);
  });
});
