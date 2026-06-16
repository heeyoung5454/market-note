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
  applyIntradayTimeScale,
  attachCrosshairTooltip,
  getChartPointTime,
  getPriceChartOptions,
  getVolumeChartOptions,
  getVolumeSeriesData,
  isIntradayChart,
} from "./chartUtils";
import "./chart.css";

type DailyCandleChartProps = {
  data: DailyChartPoint[];
};

export default function DailyCandleChart({ data }: DailyCandleChartProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const priceContainerRef = useRef<HTMLDivElement>(null);
  const volumeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !canvasRef.current ||
      !priceContainerRef.current ||
      !volumeContainerRef.current ||
      !data.length
    ) {
      return;
    }

    const intraday = isIntradayChart(data);

    const priceChart = createChart(
      priceContainerRef.current,
      getPriceChartOptions({ isIntraday: intraday })
    );
    const volumeChart = createChart(
      volumeContainerRef.current,
      getVolumeChartOptions(intraday)
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
        time: getChartPointTime(item),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }))
    );

    const detachTooltip = attachCrosshairTooltip(
      priceChart,
      candleSeries,
      canvasRef.current,
      intraday
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

    applyIntradayTimeScale(priceChart, data);
    applyIntradayTimeScale(volumeChart, data);

    const resizeObserver = new ResizeObserver(() => {
      if (priceContainerRef.current && volumeContainerRef.current) {
        priceChart.applyOptions({ width: priceContainerRef.current.clientWidth });
        volumeChart.applyOptions({ width: volumeContainerRef.current.clientWidth });
      }
    });

    resizeObserver.observe(priceContainerRef.current);
    resizeObserver.observe(volumeContainerRef.current);

    return () => {
      detachTooltip();
      resizeObserver.disconnect();
      priceChart.remove();
      volumeChart.remove();
    };
  }, [data]);

  return (
    <div ref={canvasRef} className="daily-chart__canvas">
      <div ref={priceContainerRef} className="chart-container" />
      <div ref={volumeContainerRef} className="daily-chart__volume" />
    </div>
  );
}
