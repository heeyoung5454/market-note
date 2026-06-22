import type { StockPickItem, StockPickResult } from "@/types/stockPick.type";

const MAX_STOCKS = 20;
const MAX_SENTENCE_LENGTH = 120;
const MAX_FACTORS = 5;

function trimText(value: unknown, maxLength = MAX_SENTENCE_LENGTH) {
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

function normalizeScore(value: unknown) {
  const score = Number(value);

  if (Number.isNaN(score)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

function parseStockItem(raw: unknown): StockPickItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Partial<StockPickItem>;
  const name = trimText(item.name, 40);

  if (!name) {
    return null;
  }

  return {
    name,
    score: normalizeScore(item.score),
    reason: trimText(item.reason),
    positiveFactors: toFactorList(item.positiveFactors),
    riskFactors: toFactorList(item.riskFactors),
  };
}

export function parseStockPickResult(raw: string): StockPickResult {
  const parsed = JSON.parse(raw) as Partial<StockPickResult>;
  const stocks = Array.isArray(parsed.stocks)
    ? parsed.stocks
        .map(parseStockItem)
        .filter((stock): stock is StockPickItem => stock !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_STOCKS)
    : [];

  return { stocks };
}

export function getScoreTone(score: number) {
  if (score >= 80) {
    return "high";
  }

  if (score >= 60) {
    return "mid";
  }

  return "low";
}
