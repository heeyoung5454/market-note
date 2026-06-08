"use client";

import { useRankStore } from "@/store/useRankStore";
import type { RankType } from "@/types/rank.type";

const TABS: { type: RankType; label: string }[] = [
  { type: "volume", label: "거래량" },
  { type: "rise", label: "상승률" },
  { type: "amount", label: "거래대금" },
];

export default function RankTabs() {
  const { selected, setSelected } = useRankStore();

  return (
    <div className="flex gap-2 rounded-xl bg-neutral-100 p-1">
      {TABS.map(({ type, label }) => {
        const isActive = selected === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => setSelected(type)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
