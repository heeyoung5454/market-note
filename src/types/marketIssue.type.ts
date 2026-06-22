export type IssueImpact = "positive" | "negative" | "neutral";

export type MarketIssueItem = {
  title: string;
  summary: string;
  impact: IssueImpact;
  relatedThemes: string[];
  relatedStocks: string[];
};

export type MarketIssueNewsItem = {
  title: string;
  description: string;
};

export type MarketIssueInput = {
  news: MarketIssueNewsItem[];
};

export type MarketIssueResult = {
  issues: MarketIssueItem[];
};

export type MarketIssueResponse = {
  input: MarketIssueInput;
  result: MarketIssueResult;
};
