"use client";

import { useMarketBriefing } from "@/hooks/useMarketBriefing";
import type { MarketStockSnapshot } from "@/types/marketBriefing.type";
import { formatIndexChange } from "@/utils/marketBriefing";
import { getStockDirectionClass } from "@/utils/formatChangeRate";
import Link from "next/link";
import "./market-briefing.css";

function StockMiniList({
  title,
  stocks,
}: {
  title: string;
  stocks: MarketStockSnapshot[];
}) {
  return (
    <div className="market-briefing-page__card">
      <h2 className="market-briefing-page__card-title">{title}</h2>
      <ul className="market-briefing-page__list">
        {stocks.map((stock) => (
          <li key={stock.code} className="market-briefing-page__list-item">
            <Link
              href={`/stock/${stock.code}?name=${encodeURIComponent(stock.name)}`}
              className="market-briefing-page__list-name"
            >
              {stock.name}
            </Link>
            <span className="market-briefing-page__list-meta">
              {stock.metric ??
                (stock.changeRate ? `${stock.changeRate}%` : "")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MarketBriefingView() {
  const { data, isLoading, error } = useMarketBriefing();

  if (isLoading) {
    return (
      <div className="market-briefing-page__loading">
        <span className="market-briefing-page__spinner" />
        <p>시장 데이터를 수집하고 AI 브리핑을 생성하는 중입니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="market-briefing-page__error">
        <p>{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="market-briefing-page__empty">
        <p>표시할 브리핑이 없습니다.</p>
      </div>
    );
  }

  const { input, result } = data;

  return (
    <>
      <section className="market-briefing-page__card">
        <h2 className="market-briefing-page__card-title">시장 지수</h2>
        <div className="market-briefing-page__index-grid">
          {[input.kospi, input.kosdaq].map((index) => {
            const change = formatIndexChange(index.changeRate);

            return (
              <div key={index.name} className="market-briefing-page__index-item">
                <span className="market-briefing-page__index-name">
                  {index.name}
                </span>
                <span className="market-briefing-page__index-price">
                  {Number(index.price).toLocaleString()}
                </span>
                <span
                  className={`market-briefing-page__index-change ${getStockDirectionClass(
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
      </section>

      <section className="market-briefing-page__card">
        <h2 className="market-briefing-page__card-title">AI 시장 브리핑</h2>
        <div className="market-briefing-page__section-grid">
          <p className="market-briefing-page__summary">{result.summary}</p>
          <p className="market-briefing-page__paragraph">
            {result.marketAnalysis}
          </p>

          {result.strongThemes.length > 0 ? (
            <div>
              <h3 className="market-briefing-page__card-title">강세 테마</h3>
              <div className="market-briefing-page__tags">
                {result.strongThemes.map((theme) => (
                  <span
                    key={theme}
                    className="market-briefing-page__tag market-briefing-page__tag--strong"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {result.weakThemes.length > 0 ? (
            <div>
              <h3 className="market-briefing-page__card-title">약세 테마</h3>
              <div className="market-briefing-page__tags">
                {result.weakThemes.map((theme) => (
                  <span
                    key={theme}
                    className="market-briefing-page__tag market-briefing-page__tag--weak"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <h3 className="market-briefing-page__card-title">외국인 동향</h3>
            <p className="market-briefing-page__paragraph">
              {result.foreignTrend}
            </p>
          </div>

          <div>
            <h3 className="market-briefing-page__card-title">기관 동향</h3>
            <p className="market-briefing-page__paragraph">
              {result.institutionTrend}
            </p>
          </div>

          <div>
            <h3 className="market-briefing-page__card-title">AI 전망</h3>
            <p className="market-briefing-page__paragraph">{result.outlook}</p>
          </div>
        </div>
      </section>

      <StockMiniList title="거래대금 상위" stocks={input.tradingAmountTop} />
      <StockMiniList title="상승률 상위" stocks={input.riseTop} />
      <StockMiniList
        title="외국인 순매수 상위"
        stocks={input.foreignNetBuyTop}
      />
      <StockMiniList
        title="기관 순매수 상위"
        stocks={input.institutionNetBuyTop}
      />

      <section className="market-briefing-page__card">
        <h2 className="market-briefing-page__card-title">주요 뉴스</h2>
        <ul className="market-briefing-page__news-list">
          {input.news.map((item) => (
            <li key={item.title} className="market-briefing-page__news-item">
              {item.title}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
