import type { RiskStockResponse } from "@/types/riskStock.type";
import { useQuery } from "@tanstack/react-query";

export function useRiskStock() {
  return useQuery({
    queryKey: ["risk-stock"],
    queryFn: async (): Promise<RiskStockResponse> => {
      const response = await fetch("/api/risk-stock");

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "위험 종목 분석 조회 실패");
      }

      return response.json();
    },
    staleTime: 10 * 60_000,
  });
}
