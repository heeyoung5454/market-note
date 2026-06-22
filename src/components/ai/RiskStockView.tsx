"use client";

import { useRiskStock } from "@/hooks/useRiskStock";
import type { RiskStockItem } from "@/types/riskStock.type";
import { getRiskLevelLabel } from "@/utils/riskStock";
import "./risk-stock.css";

function RiskStockCard({ stock }: { stock: RiskStockItem }) {
  return (
    <article className={`risk-stock-card risk-stock-card--${stock.riskLevel}`}>
      <div className="risk-stock-card__header">
        <h3 className="risk-stock-card__name">{stock.name}</h3>
        <span
          className={`risk-stock-card__level risk-stock-card__level--${stock.riskLevel}`}
        >
          위험 {getRiskLevelLabel(stock.riskLevel)}
        </span>
      </div>

      {stock.reason ? (
        <p className="risk-stock-card__reason">{stock.reason}</p>
      ) : null}

      {stock.warnings.length > 0 ? (
        <div>
          <p className="risk-stock-card__section-title">주의 사항</p>
          <div className="risk-stock-card__warnings">
            {stock.warnings.map((warning) => (
              <span key={warning} className="risk-stock-card__warning">
                {warning}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function RiskStockView() {
  const { data, isLoading, error } = useRiskStock();

  if (isLoading) {
    return (
      <div className="risk-stock-page__loading">
        <span className="risk-stock-page__spinner" />
        <p>위험 종목을 분석하는 중입니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="risk-stock-page__error">
        <p>{error.message}</p>
      </div>
    );
  }

  if (!data?.result.riskStocks.length) {
    return (
      <div className="risk-stock-page__empty">
        <p>표시할 위험 종목이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="risk-stock-page__list">
      {data.result.riskStocks.map((stock) => (
        <RiskStockCard key={stock.name} stock={stock} />
      ))}
    </div>
  );
}
