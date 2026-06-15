import { NEWS_SIDEBAR_SIZE } from "@/constants/newsPagination";
import { useStockNews } from "@/hooks/useStockNews";
import type { NewsSummaryResult } from "@/types/newsSummary.type";
import { useQuery } from "@tanstack/react-query";

export function useNewsSummary(stockName: string | undefined, enabled = true) {
  const news = useStockNews(stockName, {
    pageSize: NEWS_SIDEBAR_SIZE,
    enabled,
  });

  const titlesKey = news.data?.items.map((item) => item.title).join("|") ?? "";

  const summary = useQuery({
    queryKey: ["news-summary", stockName, titlesKey],
    queryFn: async (): Promise<NewsSummaryResult> => {
      const titles = news.data!.items.map((item) => item.title);

      const response = await fetch("/api/news-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockName, titles }),
      });

      if (!response.ok) {
        throw new Error("AI 요약 생성 실패");
      }

      return response.json();
    },
    enabled: enabled && !!stockName && (news.data?.items.length ?? 0) > 0,
    staleTime: 10 * 60_000,
  });

  const isLoading =
    news.isLoading || (!!stockName && news.isSuccess && summary.isLoading);
  const error = news.error ?? summary.error;

  return {
    data: summary.data,
    isLoading,
    isNewsLoading: news.isLoading,
    isSummaryLoading: summary.isLoading,
    error,
    hasNews: (news.data?.items.length ?? 0) > 0,
  };
}
