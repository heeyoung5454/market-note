import { useQuery } from "@tanstack/react-query";

export function useRankStocks(type: string) {
  return useQuery({
    queryKey: ["rank", type],
    queryFn: async () => {
      const response = await fetch(
        `/api/kis/rank/${type}`
      );

      if (!response.ok) {
        throw new Error("조회 실패");
      }

      return response.json();
    },
  });
}