"use client";

import { useRankStore } from "@/store/useRankStore";
import type { RankType } from "@/types/rank.type";
import "./stock.css";

const TABS: { type: RankType; label: string; description: string }[] = [
  { type: "volume", label: "거래량", description: "거래량순위" },
  { type: "rise", label: "등락률", description: "등락률순위" },
  { type: "amount", label: "시가총액", description: "시가총액상위" },
  { type: "marketValue", label: "시장가치", description: "시장가치순위" },
];

export function getRankTabLabel(type: RankType) {
  return TABS.find((tab) => tab.type === type)?.description ?? "";
}

export default function RankTabs() {
  const { selected, setSelected } = useRankStore();

  return (
    <div className="stock-tabs" role="tablist" aria-label="순위 기준">
      {TABS.map(({ type, label }) => {
        const isActive = selected === type;

        return (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setSelected(type)}
            className={`stock-tabs__item${isActive ? " stock-tabs__item--active" : ""}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
