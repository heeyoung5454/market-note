export type MarketIndexSnapshot = {
  name: string;
  price: string;
  changeRate: string;
};

export type MarketStockSnapshot = {
  code: string;
  name: string;
  price: string;
  changeRate?: string;
  metric?: string;
};

export type MarketBriefingInput = {
  kospi: MarketIndexSnapshot;
  kosdaq: MarketIndexSnapshot;
  tradingAmountTop: MarketStockSnapshot[];
  riseTop: MarketStockSnapshot[];
  foreignNetBuyTop: MarketStockSnapshot[];
  institutionNetBuyTop: MarketStockSnapshot[];
  news: { title: string }[];
};

export type MarketBriefingResult = {
  summary: string;
  marketAnalysis: string;
  strongThemes: string[];
  weakThemes: string[];
  foreignTrend: string;
  institutionTrend: string;
  outlook: string;
};

export type MarketBriefingResponse = {
  input: MarketBriefingInput;
  result: MarketBriefingResult;
};
