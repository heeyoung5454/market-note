import type { ThemeAnalysisResponse } from "@/types/themeAnalysis.type";
import { useQuery } from "@tanstack/react-query";

export function useThemeAnalysis() {
  return useQuery({
    queryKey: ["theme-analysis"],
    queryFn: async (): Promise<ThemeAnalysisResponse> => {
      const response = await fetch("/api/theme-analysis");

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "테마 분석 조회 실패");
      }

      return response.json();
    },
    staleTime: 10 * 60_000,
  });
}
