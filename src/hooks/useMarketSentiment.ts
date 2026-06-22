import type { MarketSentimentResponse } from "@/types/marketSentiment.type";
import { useQuery } from "@tanstack/react-query";

export function useMarketSentiment() {
  return useQuery({
    queryKey: ["market-sentiment"],
    queryFn: async (): Promise<MarketSentimentResponse> => {
      const response = await fetch("/api/market-sentiment");

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "시장 심리 분석 조회 실패");
      }

      return response.json();
    },
    staleTime: 10 * 60_000,
  });
}
