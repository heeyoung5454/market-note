import { getNewsStart } from "@/constants/newsPagination";
import type { NewsSearchResponse } from "@/types/news.type";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

type UseStockNewsOptions = {
  page?: number;
  pageSize?: number;
  enabled?: boolean;
};

export function useStockNews(
  query: string | undefined,
  options: UseStockNewsOptions = {}
) {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 10;
  const start = getNewsStart(page, pageSize);
  const enabled = (options.enabled ?? true) && !!query;

  return useQuery({
    queryKey: ["stock-news", query, page, pageSize],
    queryFn: async (): Promise<NewsSearchResponse> => {
      const params = new URLSearchParams({
        query: query!,
        display: String(pageSize),
        start: String(start),
      });
      const response = await fetch(`/api/naver/news?${params}`);

      if (!response.ok) {
        throw new Error("뉴스 조회 실패");
      }

      return response.json();
    },
    enabled,
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });
}
