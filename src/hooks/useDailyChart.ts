import { useQuery } from "@tanstack/react-query";
import type { DailyChartResponse } from "@/types/chart.type";

export function useDailyChart(code: string | null, days = 90) {
  return useQuery({
    queryKey: ["daily-chart", code, days],
    queryFn: async (): Promise<DailyChartResponse> => {
      const response = await fetch(`/api/kis/chart/${code}?days=${days}`);

      if (!response.ok) {
        throw new Error("일별 추이 조회 실패");
      }

      return response.json();
    },
    enabled: !!code,
  });
}
