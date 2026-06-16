export type StockQuote = {
  code: string;
  name: string;
  price: number;
  change: number;
  changeRate: number;
  volume: number;
};

export type StockSearchResult = {
  code: string;
  name: string;
  market?: "KOSPI" | "KOSDAQ";
  price?: number;
  change?: number;
  changeRate?: number;
  volume?: number;
};
