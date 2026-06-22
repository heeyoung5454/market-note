export type RiskLevel = "high" | "medium" | "low";

export type RiskStockItem = {
  name: string;
  riskLevel: RiskLevel;
  reason: string;
  warnings: string[];
};

export type RiskStockInput = {
  news: { title: string }[];
  surgeTop: { code: string; name: string; price: string; changeRate?: string }[];
  volumeIncreaseTop: {
    code: string;
    name: string;
    price: string;
    changeRate?: string;
    volume?: string;
  }[];
};

export type RiskStockResult = {
  riskStocks: RiskStockItem[];
};

export type RiskStockResponse = {
  input: RiskStockInput;
  result: RiskStockResult;
};
