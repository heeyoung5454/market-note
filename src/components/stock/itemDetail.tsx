"use client";

import DailyChart from "@/components/chart/DailyChart";
import { CHART_PERIOD_OPTIONS } from "@/constants/chartPeriod";
import { useDailyChart } from "@/hooks/useDailyChart";
import { formatChangeRate } from "@/utils/formatChangeRate";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import "./stock.css";

type ItemDetailProps = {
  code: string;
  name?: string;
};

export default function ItemDetail({ code, name }: ItemDetailProps) {
  const [days, setDays] = useState<number>(1);
  const { data, isLoading, error } = useDailyChart(code, days);
  const summary = data?.summary;
  const displayName = summary?.name ?? name ?? code;
  const price = summary?.price ?? "0";
  const change = formatChangeRate(summary?.changeRate);

  return (
    <main className="stock-detail-page">
      <div className="stock-detail-page__inner">
        <Link href="/" className="stock-detail__back">
          <ArrowLeft className="h-4 w-4" />
          순위 목록
        </Link>

        <div className="stock-detail__header">
          <div>
            <h1 className="stock-detail__title">{displayName}</h1>
            <p className="stock-detail__code">{code}</p>
          </div>
        </div>

        <section className="stock-detail__summary">
          <div>
            <p className="stock-detail__label">현재가</p>
            <p className={`stock-detail__price ${change.className}`}>
              {isLoading ? "-" : `${Number(price).toLocaleString()}원`}
            </p>
          </div>
          <div>
            <p className="stock-detail__label">등락률</p>
            <p className={`stock-detail__change ${change.className}`}>
              {isLoading ? "-" : change.text}
            </p>
          </div>
          {summary?.marketCap && (
            <div>
              <p className="stock-detail__label">시가총액</p>
              <p className="stock-detail__value">
                {Number(summary.marketCap).toLocaleString()}억
              </p>
            </div>
          )}
        </section>

        <section className="stock-detail__chart">
          <div className="stock-detail__chart-header">
            <p className="stock-detail__chart-title">일별 추이</p>
            <select
              className="stock-detail__period-select"
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              aria-label="차트 기간 선택"
            >
              {CHART_PERIOD_OPTIONS.map(({ label, days: optionDays }) => (
                <option key={optionDays} value={optionDays}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {isLoading && (
            <div className="stock-detail__chart-state">
              <span className="stock-detail__spinner" />
              차트를 불러오는 중...
            </div>
          )}

          {error && (
            <div className="stock-detail__chart-state stock-detail__chart-state--error">
              차트 조회에 실패했습니다.
            </div>
          )}

          {!isLoading && !error && data?.output && (
            <DailyChart data={data.output} periodDays={days} />
          )}
        </section>
      </div>
    </main>
  );
}
