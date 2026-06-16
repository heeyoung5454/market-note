"use client";

import type { DailyChartPoint } from "@/types/chart.type";
import {
  createChart,
  HistogramSeries,
  LineSeries,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import {
  applyIntradayTimeScale,
  attachCrosshairTooltip,
  getLineSeriesData,
  getPeriodLineColor,
  getPriceChartOptions,
  getVolumeChartOptions,
  getVolumeSeriesData,
  isIntradayChart,
} from "./chartUtils";
import "./chart.css";

type DailyLineChartProps = {
  data: DailyChartPoint[];
};

export default function DailyLineChart({ data }: DailyLineChartProps) {
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

    const lineSeries = priceChart.addSeries(LineSeries, {
      color: getPeriodLineColor(data),
      lineWidth: 2,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    lineSeries.setData(getLineSeriesData(data));

    const detachTooltip = attachCrosshairTooltip(
      priceChart,
      lineSeries,
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
