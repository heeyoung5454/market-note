"use client";

import { useStockPick } from "@/hooks/useStockPick";
import type { StockPickItem } from "@/types/stockPick.type";
import { getScoreTone } from "@/utils/stockPick";
import "./stock-pick.css";

function FactorTags({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "positive" | "risk";
}) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="stock-pick-card__section">
      <p className="stock-pick-card__section-title">{title}</p>
      <div className="stock-pick-card__tags">
        {items.map((item) => (
          <span
            key={item}
            className={`stock-pick-card__tag stock-pick-card__tag--${tone}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function StockPickCard({ stock }: { stock: StockPickItem }) {
  const tone = getScoreTone(stock.score);

  return (
    <article className="stock-pick-card">
      <div className="stock-pick-card__header">
        <h3 className="stock-pick-card__name">{stock.name}</h3>
        <span className={`stock-pick-card__score stock-pick-card__score--${tone}`}>
          {stock.score}점
        </span>
      </div>

      {stock.reason ? (
        <p className="stock-pick-card__reason">{stock.reason}</p>
      ) : null}

      <FactorTags
        title="긍정 요인"
        items={stock.positiveFactors}
        tone="positive"
      />
      <FactorTags title="리스크 요인" items={stock.riskFactors} tone="risk" />
    </article>
  );
}

export default function StockPickView() {
  const { data, isLoading, error } = useStockPick();

  if (isLoading) {
    return (
      <div className="stock-pick-page__loading">
        <span className="stock-pick-page__spinner" />
        <p>종목 데이터를 분석하는 중입니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stock-pick-page__error">
        <p>{error.message}</p>
      </div>
    );
  }

  if (!data?.result.stocks.length) {
    return (
      <div className="stock-pick-page__empty">
        <p>표시할 관심 종목이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="stock-pick-page__list">
      {data.result.stocks.map((stock) => (
        <StockPickCard key={`${stock.name}-${stock.score}`} stock={stock} />
      ))}
    </div>
  );
}
