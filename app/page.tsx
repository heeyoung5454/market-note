"use client";

import RankList from "@/components/stock/RankList";
import RankTabs from "@/components/stock/RankTabs";
import { useRankStocks } from "@/hooks/useRankStocks";
import { useRankStore } from "@/store/useRankStore";

export default function Home() {
  const { selected } = useRankStore();
  const { data, isLoading, error } = useRankStocks(selected);

  return (
    <main className="min-h-screen bg-[#F4F5F7]">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-6 sm:py-8">
        <header className="mb-5 shrink-0">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
            Market Note
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900">
            국내 주식 순위
          </h1>
        </header>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
          <div className="shrink-0">
            <RankTabs />
          </div>

          <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
            <RankList
              stocks={data?.output}
              isLoading={isLoading}
              error={error}
              rankType={selected}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
