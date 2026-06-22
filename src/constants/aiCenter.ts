import type { AiCenterItem } from "@/types/aiCenter.type";

export const AI_CENTER_BRIEFING: AiCenterItem = {
  id: "marketBriefing",
  label: "시장 브리핑",
  icon: "📈",
  description: "오늘 시장 흐름을 AI가 요약합니다.",
};

export const AI_CENTER_GRID_ITEMS: AiCenterItem[] = [
  {
    id: "theme",
    label: "테마",
    icon: "🔥",
    description: "오늘 주목받는 테마",
  },
  {
    id: "watchlist",
    label: "관심 종목",
    icon: "⭐",
    description: "내 관심 종목 AI 분석",
  },
  {
    id: "issue",
    label: "이슈",
    icon: "📰",
    description: "핵심 뉴스와 이슈",
  },
  {
    id: "risk",
    label: "위험 종목",
    icon: "⚠️",
    description: "주의가 필요한 종목",
  },
  {
    id: "sentiment",
    label: "시장 심리",
    icon: "😊",
    description: "투자 심리 지표",
  },
  {
    id: "outlook",
    label: "AI 전망",
    icon: "📅",
    description: "단기·중기 시장 전망",
  },
];
