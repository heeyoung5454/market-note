export type DailyChartPoint = {
  date: string;
  /** HHMMSS — 1일(시간별) 차트일 때만 사용 */
  time?: string;
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
  granularity?: "day" | "hour";
};
