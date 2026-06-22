import type {
  IssueImpact,
  MarketIssueItem,
  MarketIssueResult,
} from "@/types/marketIssue.type";

const MAX_ISSUES = 10;
const MAX_SENTENCE_LENGTH = 120;
const MAX_TAGS = 6;

function trimText(value: unknown, maxLength = MAX_SENTENCE_LENGTH) {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }

  return text.length > maxLength
    ? `${text.slice(0, maxLength - 1)}…`
    : text;
}

function toTagList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => trimText(item, 40))
    .filter(Boolean)
    .slice(0, MAX_TAGS);
}

function normalizeImpact(value: unknown): IssueImpact {
  const impact = String(value ?? "").trim().toLowerCase();

  if (impact === "negative" || impact === "bearish") {
    return "negative";
  }

  if (impact === "neutral" || impact === "mixed") {
    return "neutral";
  }

  return "positive";
}

function parseIssueItem(raw: unknown): MarketIssueItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Partial<MarketIssueItem>;
  const title = trimText(item.title, 60);

  if (!title) {
    return null;
  }

  return {
    title,
    summary: trimText(item.summary),
    impact: normalizeImpact(item.impact),
    relatedThemes: toTagList(item.relatedThemes),
    relatedStocks: toTagList(item.relatedStocks),
  };
}

export function parseMarketIssueResult(raw: string): MarketIssueResult {
  const parsed = JSON.parse(raw) as Partial<MarketIssueResult>;
  const issues = Array.isArray(parsed.issues)
    ? parsed.issues
        .map(parseIssueItem)
        .filter((issue): issue is MarketIssueItem => issue !== null)
        .slice(0, MAX_ISSUES)
    : [];

  return { issues };
}

export function getIssueImpactLabel(impact: IssueImpact) {
  const labels: Record<IssueImpact, string> = {
    positive: "긍정",
    negative: "부정",
    neutral: "중립",
  };

  return labels[impact];
}
