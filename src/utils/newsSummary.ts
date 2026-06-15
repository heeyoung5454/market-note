import type { NewsSummaryResult } from "@/types/newsSummary.type";

export function getRiskLabel(percent: number) {
  if (percent <= 33) {
    return "낮음";
  }
  if (percent <= 66) {
    return "보통";
  }
  return "높음";
}

export function clampPercent(value: unknown) {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(num)));
}

export function parseNewsSummaryResult(raw: string): NewsSummaryResult {
  const parsed = JSON.parse(raw) as Partial<NewsSummaryResult>;

  const points = Array.isArray(parsed.points)
    ? parsed.points.map((point) => String(point).trim()).filter(Boolean)
    : [];

  return {
    points,
    recommendationPercent: clampPercent(parsed.recommendationPercent),
    riskPercent: clampPercent(parsed.riskPercent),
  };
}
