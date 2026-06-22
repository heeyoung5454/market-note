import type { MarketIndexSnapshot, MarketStockSnapshot } from "@/types/marketBriefing.type";

export type MarketOutlookInput = {
  kospi: MarketIndexSnapshot;
  kosdaq: MarketIndexSnapshot;
  risingStockCount: number;
  fallingStockCount: number;
  tradingAmountTop: MarketStockSnapshot[];
  riseTop: MarketStockSnapshot[];
  foreignFlow: string;
  usMarketNews: { title: string }[];
  news: { title: string }[];
};

export type MarketOutlookResult = {
  tomorrow: string;
  strongThemes: string[];
  watchStocks: string[];
  risks: string[];
  strategy: string;
  summary: string;
};

export type MarketOutlookResponse = {
  input: MarketOutlookInput;
  result: MarketOutlookResult;
};
