import type { BusinessMarket } from "./businessMarkets";

export const filterBusinessMarkets = (markets: BusinessMarket[], query: string, region: string) => {
  const normalized = query.trim().toLocaleLowerCase();
  return markets.filter((market) => {
    const matchesQuery = !normalized || [market.country, market.region, market.defaultLanguage, market.locale, market.currency].some((value) => value.toLocaleLowerCase().includes(normalized));
    return matchesQuery && (region === "all" || market.region === region);
  });
};
