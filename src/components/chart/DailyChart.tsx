"use client";

import type { DailyChartPoint } from "@/types/chart.type";
import { useState } from "react";
import type { ChartViewType } from "./chartUtils";
import DailyCandleChart from "./DailyCandleChart";
import DailyLineChart from "./DailyLineChart";
import "./chart.css";

type DailyChartProps = {
  data: DailyChartPoint[];
};

export default function DailyChart({ data }: DailyChartProps) {
  const [view, setView] = useState<ChartViewType>("line");

  if (!data.length) {
    return (
      <div className="daily-chart__empty">
        표시할 차트 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="daily-chart">
      <div className="daily-chart__toolbar">
        <button
          type="button"
          className={`daily-chart__toggle${
            view === "line" ? " daily-chart__toggle--active" : ""
          }`}
          onClick={() => setView("line")}
        >
          라인차트 보기
        </button>
        <button
          type="button"
          className={`daily-chart__toggle${
            view === "candle" ? " daily-chart__toggle--active" : ""
          }`}
          onClick={() => setView("candle")}
        >
          캔들형태 차트보기
        </button>
      </div>

      {view === "line" ? (
        <DailyLineChart data={data} />
      ) : (
        <DailyCandleChart data={data} />
      )}
    </div>
  );
}
