"use client";

import { useRankStore } from "@/store/useRankStore";
import type { RankType } from "@/types/rank.type";

const TABS: { type: RankType; label: string; description: string }[] = [
  { type: "volume", label: "거래량", description: "거래량 상위" },
  { type: "rise", label: "상승률", description: "등락률 상위" },
  { type: "amount", label: "거래대금", description: "거래대금 상위" },
];

export function getRankTabLabel(type: RankType) {
  return TABS.find((tab) => tab.type === type)?.description ?? "";
}

export default function RankTabs() {
  const { selected, setSelected } = useRankStore();

  return (
    <div className="grid grid-cols-3 gap-1 p-1.5">
      {TABS.map(({ type, label }) => {
        const isActive = selected === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => setSelected(type)}
            className={`rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition-all ${
              isActive
                ? "bg-neutral-900 text-white shadow-sm"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
