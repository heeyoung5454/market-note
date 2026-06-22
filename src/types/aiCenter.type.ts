export type AiCenterItemId =
  | "marketBriefing"
  | "theme"
  | "watchlist"
  | "issue"
  | "risk"
  | "sentiment"
  | "outlook";

export type AiCenterItem = {
  id: AiCenterItemId;
  label: string;
  icon: string;
  description?: string;
};
