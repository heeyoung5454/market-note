"use client";

import type { DailyChartPoint } from "@/types/chart.type";
import {
  STOCK_DOWN_COLOR,
  STOCK_UP_COLOR,
} from "@/utils/formatChangeRate";
import {
  CandlestickSeries,
  createChart,
  HistogramSeries,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import {
  getPriceChartOptions,
  getVolumeChartOptions,
  getVolumeSeriesData,
  toChartTime,
} from "./chartUtils";
import "./chart.css";

type DailyCandleChartProps = {
  data: DailyChartPoint[];
};

export default function DailyCandleChart({ data }: DailyCandleChartProps) {
  const priceContainerRef = useRef<HTMLDivElement>(null);
  const volumeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!priceContainerRef.current || !volumeContainerRef.current || !data.length) {
      return;
    }

    const priceChart = createChart(
      priceContainerRef.current,
      getPriceChartOptions()
    );
    const volumeChart = createChart(
      volumeContainerRef.current,
      getVolumeChartOptions()
    );

    const candleSeries = priceChart.addSeries(CandlestickSeries, {
      upColor: STOCK_UP_COLOR,
      downColor: STOCK_DOWN_COLOR,
      borderUpColor: STOCK_UP_COLOR,
      borderDownColor: STOCK_DOWN_COLOR,
      wickUpColor: STOCK_UP_COLOR,
      wickDownColor: STOCK_DOWN_COLOR,
    });

    candleSeries.setData(
      data.map((item) => ({
        time: toChartTime(item.date),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }))
    );

    const volumeSeries = volumeChart.addSeries(HistogramSeries, {
      color: "#d4d4d4",
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });

    volumeChart.priceScale("").applyOptions({
      scaleMargins: { top: 0.1, bottom: 0 },
    });

    volumeSeries.setData(getVolumeSeriesData(data));

    priceChart.timeScale().fitContent();
    volumeChart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      if (priceContainerRef.current && volumeContainerRef.current) {
        priceChart.applyOptions({ width: priceContainerRef.current.clientWidth });
        volumeChart.applyOptions({ width: volumeContainerRef.current.clientWidth });
      }
    });

    resizeObserver.observe(priceContainerRef.current);
    resizeObserver.observe(volumeContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      priceChart.remove();
      volumeChart.remove();
    };
  }, [data]);

  return (
    <div className="daily-chart__canvas">
      <div ref={priceContainerRef} className="chart-container" />
      <div ref={volumeContainerRef} className="daily-chart__volume" />
    </div>
  );
}
