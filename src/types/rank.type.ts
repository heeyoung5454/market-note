export type RankType = "volume" | "rise" | "amount" | "marketValue";

export type RankStock = {
  code: string;
  name: string;
  price: string;
  changeRate?: string;
  volume?: string;
  amount?: string;
  marketCap?: string;
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
