"use client";

import type { DailyChartPoint } from "@/types/chart.type";
import {
  createChart,
  HistogramSeries,
  LineSeries,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import {
  buildColoredLineSegments,
  getPriceChartOptions,
  getVolumeChartOptions,
  getVolumeSeriesData,
} from "./chartUtils";
import "./chart.css";

type DailyLineChartProps = {
  data: DailyChartPoint[];
};

export default function DailyLineChart({ data }: DailyLineChartProps) {
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

    for (const segment of buildColoredLineSegments(data)) {
      const lineSeries = priceChart.addSeries(LineSeries, {
        color: segment.color,
        lineWidth: 2,
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceLineVisible: false,
      });

      lineSeries.setData(segment.points);
    }

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
