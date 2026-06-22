import type { MarketStockSnapshot } from "@/types/marketBriefing.type";

export type StockPickItem = {
  name: string;
  score: number;
  reason: string;
  positiveFactors: string[];
  riskFactors: string[];
};

export type StockPickInput = {
  news: { title: string }[];
  volumeIncreaseTop: MarketStockSnapshot[];
  tradingAmountTop: MarketStockSnapshot[];
  riseTop: MarketStockSnapshot[];
  foreignNetBuyTop: MarketStockSnapshot[];
  institutionNetBuyTop: MarketStockSnapshot[];
};

export type StockPickResult = {
  stocks: StockPickItem[];
};

export type StockPickResponse = {
  input: StockPickInput;
  result: StockPickResult;
};
