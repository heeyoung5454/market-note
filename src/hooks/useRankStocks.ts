import { useQuery } from "@tanstack/react-query";
import {
  buildRankQueryString,
  RANK_OPTION_DEFS,
} from "@/constants/rankOptions";
import type { RankType } from "@/types/rank.type";

const RANK_ENDPOINTS: Record<RankType, string> = {
  volume: "/uapi/domestic-stock/v1/quotations/volume-rank",
  rise: "/uapi/domestic-stock/v1/ranking/fluctuation",
  amount: "/uapi/domestic-stock/v1/ranking/market-cap",
  marketValue: "/uapi/domestic-stock/v1/ranking/market-value",
};

export function useRankStocks(
  type: RankType,
  options: Record<string, string>
) {
  return useQuery({
    queryKey: ["rank", type, options],
    queryFn: async () => {
      const query = buildRankQueryString(options);
      const endpoint = query
        ? `${RANK_ENDPOINTS[type]}?${query}`
        : RANK_ENDPOINTS[type];
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error("조회 실패");
      }

      return response.json();
    },
  });
}
