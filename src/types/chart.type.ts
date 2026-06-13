export type DailyChartPoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type DailyChartSummary = {
  name?: string;
  code?: string;
  price?: string;
  changeRate?: string;
  volume?: string;
  amount?: string;
  marketCap?: string;
};

export type DailyChartResponse = {
  output: DailyChartPoint[];
  summary: DailyChartSummary | null;
};
