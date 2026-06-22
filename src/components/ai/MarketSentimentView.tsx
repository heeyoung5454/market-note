"use client";

import { useMarketSentiment } from "@/hooks/useMarketSentiment";
import {
  getSentimentLabel,
  getSentimentTone,
} from "@/utils/marketSentiment";
import "./market-sentiment.css";

function FactorSection({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "positive" | "negative";
}) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="market-sentiment-card">
      <h2 className="market-sentiment-card__section-title">{title}</h2>
      <div className="market-sentiment-card__tags">
        {items.map((item) => (
          <span
            key={item}
            className={`market-sentiment-card__tag market-sentiment-card__tag--${tone}`}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

export default function MarketSentimentView() {
  const { data, isLoading, error } = useMarketSentiment();

  if (isLoading) {
    return (
      <div className="market-sentiment-page__loading">
        <span className="market-sentiment-page__spinner" />
        <p>시장 심리를 분석하는 중입니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="market-sentiment-page__error">
        <p>{error.message}</p>
      </div>
    );
  }

  if (!data?.result.summary) {
    return (
      <div className="market-sentiment-page__empty">
        <p>표시할 시장 심리 분석이 없습니다.</p>
      </div>
    );
  }

  const { input, result } = data;
  const tone = getSentimentTone(result.score);

  return (
    <div className="market-sentiment-page__content">
      <section className={`market-sentiment-card market-sentiment-card--${tone}`}>
        <div className="market-sentiment-card__hero">
          <div className="market-sentiment-card__score-wrap">
            <p className="market-sentiment-card__score-label">심리 점수</p>
            <p className="market-sentiment-card__score">{result.score}</p>
          </div>
          <span
            className={`market-sentiment-card__badge market-sentiment-card__badge--${result.sentiment}`}
          >
            {getSentimentLabel(result.sentiment)}
          </span>
        </div>

        <p className="market-sentiment-card__summary">{result.summary}</p>
      </section>

      <section className="market-sentiment-card">
        <h2 className="market-sentiment-card__section-title">시장 지표</h2>
        <div className="market-sentiment-card__stats">
          <div className="market-sentiment-card__stat">
            <span className="market-sentiment-card__stat-label">상승 종목</span>
            <span className="market-sentiment-card__stat-value market-sentiment-card__stat-value--up">
              {input.risingStockCount.toLocaleString()}개
            </span>
          </div>
          <div className="market-sentiment-card__stat">
            <span className="market-sentiment-card__stat-label">하락 종목</span>
            <span className="market-sentiment-card__stat-value market-sentiment-card__stat-value--down">
              {input.fallingStockCount.toLocaleString()}개
            </span>
          </div>
        </div>
      </section>

      <section className="market-sentiment-card">
        <h2 className="market-sentiment-card__section-title">외국인 순매수</h2>
        <p className="market-sentiment-card__foreign">{input.foreignNetBuy}</p>
      </section>

      <FactorSection
        title="긍정 요인"
        items={result.positiveFactors}
        tone="positive"
      />
      <FactorSection
        title="부정 요인"
        items={result.negativeFactors}
        tone="negative"
      />
    </div>
  );
}
