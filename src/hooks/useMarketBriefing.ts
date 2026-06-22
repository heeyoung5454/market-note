import type { MarketBriefingResponse } from "@/types/marketBriefing.type";
import { useQuery } from "@tanstack/react-query";

export function useMarketBriefing() {
  return useQuery({
    queryKey: ["market-briefing"],
    queryFn: async (): Promise<MarketBriefingResponse> => {
      const response = await fetch("/api/market-briefing");

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "시장 브리핑 조회 실패");
      }

      return response.json();
    },
    staleTime: 10 * 60_000,
  });
}
