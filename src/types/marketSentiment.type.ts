export type MarketSentimentType = "positive" | "negative" | "neutral";

export type MarketSentimentInput = {
  news: { title: string }[];
  risingStockCount: number;
  fallingStockCount: number;
  foreignNetBuy: string;
};

export type MarketSentimentResult = {
  sentiment: MarketSentimentType;
  score: number;
  positiveFactors: string[];
  negativeFactors: string[];
  summary: string;
};

export type MarketSentimentResponse = {
  input: MarketSentimentInput;
  result: MarketSentimentResult;
};
