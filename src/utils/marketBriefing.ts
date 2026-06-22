import type { MarketBriefingResult } from "@/types/marketBriefing.type";

const MAX_SENTENCE_LENGTH = 100;

function trimSentence(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }

  return text.length > MAX_SENTENCE_LENGTH
    ? `${text.slice(0, MAX_SENTENCE_LENGTH - 1)}…`
    : text;
}

function toStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => trimSentence(item))
    .filter(Boolean)
    .slice(0, 5);
}

export function parseMarketBriefingResult(raw: string): MarketBriefingResult {
  const parsed = JSON.parse(raw) as Partial<MarketBriefingResult>;

  return {
    summary: trimSentence(parsed.summary),
    marketAnalysis: trimSentence(parsed.marketAnalysis),
    strongThemes: toStringList(parsed.strongThemes),
    weakThemes: toStringList(parsed.weakThemes),
    foreignTrend: trimSentence(parsed.foreignTrend),
    institutionTrend: trimSentence(parsed.institutionTrend),
    outlook: trimSentence(parsed.outlook),
  };
}

export function formatIndexChange(changeRate: string) {
  const value = Number(changeRate);

  if (Number.isNaN(value)) {
    return "-";
  }

  if (value > 0) {
    return `+${value.toFixed(2)}%`;
  }

  if (value < 0) {
    return `${value.toFixed(2)}%`;
  }

  return "0.00%";
}
