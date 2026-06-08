"use client";

import RankTabs from "@/components/stock/RankTabs";
import { useRankStocks } from "@/hooks/useRankStocks";
import { useRankStore } from "@/store/useRankStore";
import type { RankStock } from "@/types/rank.type";

function formatChangeRate(rate?: string) {
  if (!rate) {
    return { text: "-", className: "text-neutral-400" };
  }

  const value = Number(rate);

  if (Number.isNaN(value)) {
    return { text: "-", className: "text-neutral-400" };
  }

  if (value > 0) {
    return {
      text: `+${value.toFixed(2)}%`,
      className: "font-semibold text-[#F04452]",
    };
  }

  if (value < 0) {
    return {
      text: `${value.toFixed(2)}%`,
      className: "font-semibold text-[#3182F6]",
    };
  }

  return {
    text: "0.00%",
    className: "text-neutral-400",
  };
}

function RankRow({
  stock,
  rank,
}: {
  stock: RankStock;
  rank: number;
}) {
  const change = formatChangeRate(stock.changeRate);

  return (
    <li className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-500">
        {rank}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-neutral-900">{stock.name}</p>
        <p className="text-xs text-neutral-400">{stock.code}</p>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-semibold tabular-nums text-neutral-900">
          {Number(stock.price).toLocaleString()}
          <span className="ml-0.5 text-sm font-normal text-neutral-500">
            원
          </span>
        </p>
        <p className={`mt-0.5 text-sm tabular-nums ${change.className}`}>
          {change.text}
        </p>
      </div>
    </li>
  );
}

export default function Home() {
  const { selected } = useRankStore();
  const { data, isLoading, error } = useRankStocks(selected);

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            MarketNote
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            국내 주식 순위를 실시간으로 확인하세요
          </p>
        </header>

        <RankTabs />

        <section className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {isLoading && (
            <div className="flex items-center justify-center py-20 text-sm text-neutral-400">
              불러오는 중...
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-20 text-sm text-red-500">
              조회에 실패했습니다. 잠시 후 다시 시도해 주세요.
            </div>
          )}

          {!isLoading && !error && (
            <ul className="divide-y divide-neutral-100">
              {data?.output?.map((stock: RankStock, index: number) => (
                <RankRow
                  key={stock.code}
                  stock={stock}
                  rank={index + 1}
                />
              ))}
            </ul>
          )}

          {!isLoading && !error && data?.output?.length === 0 && (
            <div className="flex items-center justify-center py-20 text-sm text-neutral-400">
              표시할 종목이 없습니다.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
