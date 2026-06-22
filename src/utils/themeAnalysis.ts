import type {
  ThemeAnalysisItem,
  ThemeAnalysisResult,
  ThemeStrength,
} from "@/types/themeAnalysis.type";

const MAX_THEMES = 10;
const MAX_SENTENCE_LENGTH = 100;

function trimText(value: unknown, maxLength = MAX_SENTENCE_LENGTH) {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }

  return text.length > maxLength
    ? `${text.slice(0, maxLength - 1)}…`
    : text;
}

function normalizeStrength(value: unknown): ThemeStrength {
  const strength = String(value ?? "").trim().toLowerCase();

  if (strength === "weak") {
    return "weak";
  }

  if (strength === "moderate" || strength === "neutral") {
    return "moderate";
  }

  return "strong";
}

function toStockList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => trimText(item, 40))
    .filter(Boolean)
    .slice(0, 8);
}

function parseThemeItem(raw: unknown): ThemeAnalysisItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Partial<ThemeAnalysisItem>;
  const name = trimText(item.name, 40);

  if (!name) {
    return null;
  }

  return {
    name,
    summary: trimText(item.summary),
    strength: normalizeStrength(item.strength),
    stocks: toStockList(item.stocks),
    reason: trimText(item.reason),
  };
}

export function parseThemeAnalysisResult(raw: string): ThemeAnalysisResult {
  const parsed = JSON.parse(raw) as Partial<ThemeAnalysisResult>;
  const themes = Array.isArray(parsed.themes)
    ? parsed.themes
        .map(parseThemeItem)
        .filter((theme): theme is ThemeAnalysisItem => theme !== null)
        .slice(0, MAX_THEMES)
    : [];

  return { themes };
}

export function getThemeStrengthLabel(strength: ThemeStrength) {
  const labels: Record<ThemeStrength, string> = {
    strong: "강세",
    moderate: "보통",
    weak: "약세",
  };

  return labels[strength];
}
