export const CHART_PERIOD_OPTIONS = [
  { label: "3개월", days: 90 },
  { label: "6개월", days: 180 },
  { label: "1년", days: 365 },
] as const;

export type ChartPeriodDays = (typeof CHART_PERIOD_OPTIONS)[number]["days"];

export function getChartPeriodLabel(days: number) {
  return (
    CHART_PERIOD_OPTIONS.find((option) => option.days === days)?.label ??
    `${days}일`
  );
}
