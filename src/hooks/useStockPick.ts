import type { StockPickResponse } from "@/types/stockPick.type";
import { useQuery } from "@tanstack/react-query";

export function useStockPick() {
  return useQuery({
    queryKey: ["stock-pick"],
    queryFn: async (): Promise<StockPickResponse> => {
      const response = await fetch("/api/stock-pick");

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "관심 종목 분석 조회 실패");
      }

      return response.json();
    },
    staleTime: 10 * 60_000,
  });
}
