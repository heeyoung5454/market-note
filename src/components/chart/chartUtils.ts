import type { DailyChartPoint } from "@/types/chart.type";
import {
  STOCK_DOWN_COLOR,
  STOCK_UP_COLOR,
} from "@/utils/formatChangeRate";
import { ColorType, type DeepPartial, type TimeChartOptions } from "lightweight-charts";

export const CHART_FLAT_COLOR = "#a3a3a3";
export const VOLUME_UP_COLOR = "#fecaca";
export const VOLUME_DOWN_COLOR = "#bfdbfe";
export const VOLUME_FLAT_COLOR = "#e5e5e5";

export type ChartViewType = "line" | "candle";

export function toChartTime(date: string) {
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}

export function getDayDirection(data: DailyChartPoint[], index: number) {
  if (index === 0) {
    if (data[0].close > data[0].open) {
      return "up";
    }
    if (data[0].close < data[0].open) {
      return "down";
    }
    return "flat";
  }

  const prev = data[index - 1];
  const curr = data[index];

  if (curr.close > prev.close) {
    return "up";
  }
  if (curr.close < prev.close) {
    return "down";
  }
  return "flat";
}

export function getLineColor(direction: ReturnType<typeof getDayDirection>) {
  if (direction === "up") {
    return STOCK_UP_COLOR;
  }
  if (direction === "down") {
    return STOCK_DOWN_COLOR;
  }
  return CHART_FLAT_COLOR;
}

export function getVolumeColor(direction: ReturnType<typeof getDayDirection>) {
  if (direction === "up") {
    return VOLUME_UP_COLOR;
  }
  if (direction === "down") {
    return VOLUME_DOWN_COLOR;
  }
  return VOLUME_FLAT_COLOR;
}

export function buildColoredLineSegments(data: DailyChartPoint[]) {
  if (data.length < 2) {
    return [];
  }

  const segments: {
    color: string;
    points: { time: string; value: number }[];
  }[] = [];

  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const color = getLineColor(getDayDirection(data, i));
    const start = { time: toChartTime(prev.date), value: prev.close };
    const end = { time: toChartTime(curr.date), value: curr.close };
    const last = segments.at(-1);

    if (last?.color === color) {
      last.points.push(end);
    } else {
      segments.push({ color, points: [start, end] });
    }
  }

  return segments;
}

export function getPriceChartOptions(
  showTimeScale = false
): DeepPartial<TimeChartOptions> {
  return {
    layout: {
      background: { type: ColorType.Solid, color: "#ffffff" },
      textColor: "#737373",
      fontSize: 11,
    },
    grid: {
      vertLines: { color: "#f5f5f5" },
      horzLines: { color: "#f5f5f5" },
    },
    rightPriceScale: {
      borderVisible: false,
    },
    timeScale: {
      borderVisible: false,
      visible: showTimeScale,
    },
    handleScroll: false,
    handleScale: false,
  };
}

export function getVolumeChartOptions(): DeepPartial<TimeChartOptions> {
  return {
    layout: {
      background: { type: ColorType.Solid, color: "#ffffff" },
      textColor: "#737373",
      fontSize: 11,
    },
    grid: {
      vertLines: { visible: false },
      horzLines: { color: "#f5f5f5" },
    },
    rightPriceScale: {
      borderVisible: false,
    },
    timeScale: {
      borderVisible: false,
    },
    handleScroll: false,
    handleScale: false,
  };
}

export function getVolumeSeriesData(data: DailyChartPoint[]) {
  return data.map((item, index) => ({
    time: toChartTime(item.date),
    value: item.volume,
    color: getVolumeColor(getDayDirection(data, index)),
  }));
}
