import type { MarketIssueInput } from "@/types/marketIssue.type";
import { searchNews } from "@/services/naver.service";

const NEWS_LIMIT = 20;

export function buildMarketIssuePrompt(input: MarketIssueInput) {
  if (!input.news.length) {
    return "주요 뉴스 없음";
  }

  return input.news
    .map((item, index) => {
      const description = item.description ? ` - ${item.description}` : "";
      return `${index + 1}. ${item.title}${description}`;
    })
    .join("\n");
}

export async function collectMarketIssueInput(): Promise<MarketIssueInput> {
  const newsRaw = await searchNews("코스피 코스닥 증시", {
    display: NEWS_LIMIT,
  });

  return {
    news: newsRaw.items.map((item) => ({
      title: item.title,
      description: item.description,
    })),
  };
}
