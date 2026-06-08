export type RankType = "volume" | "rise" | "amount";

export type RankStock = {
  code: string;
  name: string;
  price: string;
  changeRate?: string;
  volume?: string;
  amount?: string;
};
