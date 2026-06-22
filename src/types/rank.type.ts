export type RankType =
  | "volume"
  | "rise"
  | "amount"
  | "tradingAmount"
  | "investorTrade";

export type InvestorType = "foreign" | "institution" | "individual";

export type RankStock = {
  code: string;
  name: string;
  price: string;
  changeRate?: string;
  volume?: string;
  amount?: string;
  marketCap?: string;
  netBuyAmount?: string;
  netSellAmount?: string;
  netBuyQty?: string;
  per?: string;
  pbr?: string;
  pcr?: string;
  psr?: string;
  eps?: string;
  eva?: string;
  ebitda?: string;
  pvDivEbitda?: string;
  ebitdaDivFnncExpn?: string;
};
