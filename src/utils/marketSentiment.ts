import type {
  MarketSentimentResult,
  MarketSentimentType,
} from "@/types/marketSentiment.type";

const MAX_FACTORS = 6;
const MAX_SUMMARY_LENGTH = 200;

function trimText(value: unknown, maxLength = 80) {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }

  return text.length > maxLength
    ? `${text.slice(0, maxLength - 1)}…`
    : text;
}

function toFactorList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => trimText(item, 60))
    .filter(Boolean)
    .slice(0, MAX_FACTORS);
}

function normalizeSentiment(value: unknown): MarketSentimentType {
  const sentiment = String(value ?? "").trim().toLowerCase();

  if (sentiment === "negative" || sentiment === "bearish") {
    return "negative";
  }

  if (sentiment === "neutral" || sentiment === "mixed") {
    return "neutral";
  }

  return "positive";
}

function normalizeScore(value: unknown) {
  const score = Number(value);

  if (Number.isNaN(score)) {
    return 50;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

export function parseMarketSentimentResult(raw: string): MarketSentimentResult {
  const parsed = JSON.parse(raw) as Partial<MarketSentimentResult>;

  return {
    sentiment: normalizeSentiment(parsed.sentiment),
    score: normalizeScore(parsed.score),
    positiveFactors: toFactorList(parsed.positiveFactors),
    negativeFactors: toFactorList(parsed.negativeFactors),
    summary: trimText(parsed.summary, MAX_SUMMARY_LENGTH),
  };
}

export function getSentimentLabel(sentiment: MarketSentimentType) {
  const labels: Record<MarketSentimentType, string> = {
    positive: "긍정",
    negative: "부정",
    neutral: "중립",
  };

  return labels[sentiment];
}

export function getSentimentTone(score: number) {
  if (score >= 65) {
    return "positive";
  }

  if (score <= 35) {
    return "negative";
  }

  return "neutral";
}
