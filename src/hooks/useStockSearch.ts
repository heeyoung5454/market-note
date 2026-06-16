import type { StockSearchResult } from "@/types/stock.type";
import { useQuery } from "@tanstack/react-query";

const STOCK_CODE_PATTERN = /^[0-9A-Za-z]+$/;

function getMinQueryLength(query: string) {
  return STOCK_CODE_PATTERN.test(query) ? 1 : 2;
}

async function searchStocks(query: string): Promise<StockSearchResult[]> {
  const response = await fetch(
    `/api/kis/search?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message ?? "종목 검색에 실패했습니다.");
  }

  const data = await response.json();
  return data.results ?? [];
}

export function useStockSearch(query: string, enabled: boolean) {
  const trimmed = query.trim();
  const minLength = getMinQueryLength(trimmed);

  return useQuery({
    queryKey: ["stock-search", trimmed],
    queryFn: () => searchStocks(trimmed),
    enabled: enabled && trimmed.length >= minLength,
    staleTime: 30_000,
  });
}
