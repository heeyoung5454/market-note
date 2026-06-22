import type { MarketOutlookResponse } from "@/types/marketOutlook.type";
import { useQuery } from "@tanstack/react-query";

export function useMarketOutlook() {
  return useQuery({
    queryKey: ["market-outlook"],
    queryFn: async (): Promise<MarketOutlookResponse> => {
      const response = await fetch("/api/market-outlook");

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "시장 전망 조회 실패");
      }

      return response.json();
    },
    staleTime: 10 * 60_000,
  });
}
