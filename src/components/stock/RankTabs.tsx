"use client";

import { useRankStore } from "@/store/useRankStore";
import type { InvestorType, RankType } from "@/types/rank.type";
import "./stock.css";

const REGULAR_TABS: { type: RankType; label: string; description: string }[] = [
  { type: "volume", label: "거래량", description: "거래량순위" },
  { type: "rise", label: "등락률", description: "등락률순위" },
  { type: "amount", label: "시가총액", description: "시가총액상위" },
  { type: "tradingAmount", label: "거래대금", description: "거래대금순위" },
];

const INVESTOR_TABS: { investorType: InvestorType; label: string }[] = [
  { investorType: "foreign", label: "외국인" },
  { investorType: "institution", label: "기관" },
  { investorType: "individual", label: "개인" },
];

export function getRankTabLabel(type: RankType) {
  return REGULAR_TABS.find((tab) => tab.type === type)?.description ?? "";
}

export default function RankTabs() {
  const { selected, options, setSelected, setOption } = useRankStore();
  const investorType = options.investorTrade.investor_type ?? "foreign";

  const selectInvestorTab = (type: InvestorType) => {
    setSelected("investorTrade");
    setOption("investorTrade", "investor_type", type);
  };

  return (
    <div className="stock-tabs" role="tablist" aria-label="순위 기준">
      {REGULAR_TABS.map(({ type, label }) => {
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
      {INVESTOR_TABS.map(({ investorType: type, label }) => {
        const isActive =
          selected === "investorTrade" && investorType === type;

        return (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => selectInvestorTab(type)}
            className={`stock-tabs__item${isActive ? " stock-tabs__item--active" : ""}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
