"use client";

import AiCenter from "@/components/ai/AiCenter";
import RankList from "@/components/stock/RankList";
import RankTabs from "@/components/stock/RankTabs";
import StockMemoWidget from "@/components/stock/StockMemoWidget";
import StockSearchTrigger from "@/components/stock/StockSearchTrigger";
import { useRankStocks } from "@/hooks/useRankStocks";
import { useRankStore } from "@/store/useRankStore";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { selected, options } = useRankStore();
  const { data, isLoading, error } = useRankStocks(selected, options[selected]);

  return (
    <main className="min-h-screen bg-[#F4F5F7]">
      <StockMemoWidget />
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-6 sm:py-8">
        <header className="mb-5 shrink-0">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
            Market Note
          </p>
        </header>

        <AiCenter
          onSelectItem={(id) => {
            if (id === "marketBriefing") {
              router.push("/ai/market");
            }
            if (id === "theme") {
              router.push("/ai/themes");
            }
            if (id === "watchlist") {
              router.push("/ai/stocks");
            }
            if (id === "issue") {
              router.push("/ai/issues");
            }
            if (id === "risk") {
              router.push("/ai/risks");
            }
            if (id === "sentiment") {
              router.push("/ai/sentiment");
            }
            if (id === "outlook") {
              router.push("/ai/outlook");
            }
          }}
        />

        <header className="mb-5 shrink-0">
          <div className="stock-rank-header__title-row">
            <h1 className="stock-rank-header__title">
              국내 주식 순위
            </h1>
            <div className="stock-rank-header__search">
              <StockSearchTrigger />
            </div>
          </div>
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
