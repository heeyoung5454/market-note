import type { MarketIssueResponse } from "@/types/marketIssue.type";
import { useQuery } from "@tanstack/react-query";

export function useMarketIssue() {
  return useQuery({
    queryKey: ["market-issue"],
    queryFn: async (): Promise<MarketIssueResponse> => {
      const response = await fetch("/api/market-issue");

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "이슈 분석 조회 실패");
      }

      return response.json();
    },
    staleTime: 10 * 60_000,
  });
}
