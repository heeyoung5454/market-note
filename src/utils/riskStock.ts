import type {
  RiskLevel,
  RiskStockItem,
  RiskStockResult,
} from "@/types/riskStock.type";

const MAX_STOCKS = 10;
const MAX_SENTENCE_LENGTH = 120;
const MAX_WARNINGS = 5;

function trimText(value: unknown, maxLength = MAX_SENTENCE_LENGTH) {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }

  return text.length > maxLength
    ? `${text.slice(0, maxLength - 1)}…`
    : text;
}

function toWarningList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => trimText(item, 60))
    .filter(Boolean)
    .slice(0, MAX_WARNINGS);
}

function normalizeRiskLevel(value: unknown): RiskLevel {
  const level = String(value ?? "").trim().toLowerCase();

  if (level === "low" || level === "minor") {
    return "low";
  }

  if (level === "medium" || level === "moderate" || level === "mid") {
    return "medium";
  }

  return "high";
}

function parseRiskStockItem(raw: unknown): RiskStockItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Partial<RiskStockItem>;
  const name = trimText(item.name, 40);

  if (!name) {
    return null;
  }

  return {
    name,
    riskLevel: normalizeRiskLevel(item.riskLevel),
    reason: trimText(item.reason),
    warnings: toWarningList(item.warnings),
  };
}

export function parseRiskStockResult(raw: string): RiskStockResult {
  const parsed = JSON.parse(raw) as Partial<RiskStockResult>;
  const riskStocks = Array.isArray(parsed.riskStocks)
    ? parsed.riskStocks
        .map(parseRiskStockItem)
        .filter((stock): stock is RiskStockItem => stock !== null)
        .slice(0, MAX_STOCKS)
    : [];

  return { riskStocks };
}

export function getRiskLevelLabel(level: RiskLevel) {
  const labels: Record<RiskLevel, string> = {
    high: "높음",
    medium: "보통",
    low: "낮음",
  };

  return labels[level];
}
