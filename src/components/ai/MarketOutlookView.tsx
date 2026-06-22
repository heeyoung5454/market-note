"use client";

import { useMarketOutlook } from "@/hooks/useMarketOutlook";
import { formatIndexChange } from "@/utils/marketBriefing";
import { getStockDirectionClass } from "@/utils/formatChangeRate";
import "./market-outlook.css";

function TagSection({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "theme" | "stock" | "risk";
}) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="market-outlook-card">
      <h2 className="market-outlook-card__title">{title}</h2>
      <div className="market-outlook-card__tags">
        {items.map((item) => (
          <span
            key={item}
            className={`market-outlook-card__tag market-outlook-card__tag--${tone}`}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

export default function MarketOutlookView() {
  const { data, isLoading, error } = useMarketOutlook();

  if (isLoading) {
    return (
      <div className="market-outlook-page__loading">
        <span className="market-outlook-page__spinner" />
        <p>시장 데이터와 뉴스를 분석해 단기 전망을 작성하는 중입니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="market-outlook-page__error">
        <p>{error.message}</p>
      </div>
    );
  }

  if (!data?.result.summary) {
    return (
      <div className="market-outlook-page__empty">
        <p>표시할 시장 전망이 없습니다.</p>
      </div>
    );
  }

  const { input, result } = data;

  return (
    <div className="market-outlook-page__content">
      <section className="market-outlook-hero">
        <p className="market-outlook-hero__label">AI 단기 전망</p>
        <p className="market-outlook-hero__summary">{result.summary}</p>
      </section>

      {result.tomorrow ? (
        <section className="market-outlook-card market-outlook-card--highlight">
          <h2 className="market-outlook-card__title">내일 시장 전망</h2>
          <p className="market-outlook-card__text">{result.tomorrow}</p>
        </section>
      ) : null}

      {result.strategy ? (
        <section className="market-outlook-card">
          <h2 className="market-outlook-card__title">전략 관점</h2>
          <p className="market-outlook-card__text">{result.strategy}</p>
        </section>
      ) : null}

      <TagSection title="주목 테마" items={result.strongThemes} tone="theme" />
      <TagSection title="관찰 종목" items={result.watchStocks} tone="stock" />
      <TagSection title="리스크 요인" items={result.risks} tone="risk" />

      <section className="market-outlook-card">
        <h2 className="market-outlook-card__title">오늘 시장 데이터</h2>
        <div className="market-outlook-card__index-grid">
          {[input.kospi, input.kosdaq].map((index) => {
            const change = formatIndexChange(index.changeRate);

            return (
              <div key={index.name} className="market-outlook-card__index-item">
                <span className="market-outlook-card__index-name">{index.name}</span>
                <span className="market-outlook-card__index-value">
                  {Number(index.price).toLocaleString()}
                </span>
                <span
                  className={`market-outlook-card__index-change ${getStockDirectionClass(
                    Number(index.changeRate) > 0
                      ? "up"
                      : Number(index.changeRate) < 0
                        ? "down"
                        : "flat"
                  )}`}
                >
                  {change}
                </span>
              </div>
            );
          })}
        </div>

        <div className="market-outlook-card__stats">
          <div className="market-outlook-card__stat">
            <span className="market-outlook-card__stat-label">상승 종목</span>
            <span className="market-outlook-card__stat-value">
              {input.risingStockCount.toLocaleString()}개
            </span>
          </div>
          <div className="market-outlook-card__stat">
            <span className="market-outlook-card__stat-label">하락 종목</span>
            <span className="market-outlook-card__stat-value">
              {input.fallingStockCount.toLocaleString()}개
            </span>
          </div>
        </div>
      </section>

      <section className="market-outlook-card">
        <h2 className="market-outlook-card__title">외국인 수급</h2>
        <p className="market-outlook-card__foreign">{input.foreignFlow}</p>
      </section>

      {input.usMarketNews.length > 0 ? (
        <section className="market-outlook-card">
          <h2 className="market-outlook-card__title">미국 증시 동향</h2>
          <ul className="market-outlook-card__list">
            {input.usMarketNews.map((item) => (
              <li key={item.title}>{item.title}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
