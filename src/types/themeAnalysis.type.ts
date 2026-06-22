import type { MarketStockSnapshot } from "@/types/marketBriefing.type";

export type ThemeStrength = "strong" | "weak" | "moderate";

export type ThemeAnalysisItem = {
  name: string;
  summary: string;
  strength: ThemeStrength;
  stocks: string[];
  reason: string;
};

export type ThemeAnalysisInput = {
  news: { title: string }[];
  riseTop: MarketStockSnapshot[];
  tradingAmountTop: MarketStockSnapshot[];
};

export type ThemeAnalysisResult = {
  themes: ThemeAnalysisItem[];
};

export type ThemeAnalysisResponse = {
  input: ThemeAnalysisInput;
  result: ThemeAnalysisResult;
};
