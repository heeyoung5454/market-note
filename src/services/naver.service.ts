import type { NewsItem, NewsSearchResponse } from "@/types/news.type";

const NAVER_NEWS_URL = "https://openapi.naver.com/v1/search/news.json";

function stripHtml(text: string) {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'");
}

function normalizeNewsItem(item: Record<string, string>): NewsItem {
  return {
    title: stripHtml(item.title ?? ""),
    description: stripHtml(item.description ?? ""),
    link: item.link ?? "",
    originallink: item.originallink ?? item.link ?? "",
    pubDate: item.pubDate ?? "",
  };
}

type SearchNewsOptions = {
  display?: number;
  start?: number;
};

export async function searchNews(
  query: string,
  options: SearchNewsOptions = {}
): Promise<NewsSearchResponse> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("네이버 API credentials가 설정되지 않았습니다.");
  }

  const display = Math.min(Math.max(options.display ?? 10, 1), 100);
  const start = Math.min(Math.max(options.start ?? 1, 1), 1000);

  const params = new URLSearchParams({
    query,
    display: String(display),
    start: String(start),
    sort: "date",
  });

  const response = await fetch(`${NAVER_NEWS_URL}?${params}`, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data.errorMessage ?? data.message ?? `HTTP ${response.status}`;
    throw new Error(`네이버 뉴스 API 요청 실패: ${message}`);
  }

  const items = ((data.items ?? []) as Record<string, string>[]).map(
    normalizeNewsItem
  );

  return {
    total: Number(data.total ?? 0),
    start: Number(data.start ?? start),
    display: Number(data.display ?? display),
    items,
  };
}
