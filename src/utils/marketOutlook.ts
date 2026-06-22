import type { MarketOutlookResult } from "@/types/marketOutlook.type";

const MAX_SENTENCE_LENGTH = 100;
const MAX_LIST_ITEMS = 6;

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
    .slice(0, MAX_LIST_ITEMS);
}

export function parseMarketOutlookResult(raw: string): MarketOutlookResult {
  const parsed = JSON.parse(raw) as Partial<MarketOutlookResult>;

  return {
    tomorrow: trimSentence(parsed.tomorrow),
    strongThemes: toStringList(parsed.strongThemes),
    watchStocks: toStringList(parsed.watchStocks),
    risks: toStringList(parsed.risks),
    strategy: trimSentence(parsed.strategy),
    summary: trimSentence(parsed.summary),
  };
}
