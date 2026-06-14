import type { DailyChartPoint } from "@/types/chart.type";
import {
  getStockDirectionClass,
  STOCK_DOWN_COLOR,
  STOCK_UP_COLOR,
} from "@/utils/formatChangeRate";
import {
  ColorType,
  isBusinessDay,
  type DeepPartial,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type SeriesType,
  type Time,
  type TimeChartOptions,
} from "lightweight-charts";

export const CHART_FLAT_COLOR = "#a3a3a3";
export const VOLUME_UP_COLOR = "#fecaca";
export const VOLUME_DOWN_COLOR = "#bfdbfe";
export const VOLUME_FLAT_COLOR = "#e5e5e5";

export type ChartViewType = "line" | "candle";

export function isIntradayChart(data: DailyChartPoint[]) {
  return data.some((point) => point.time);
}

export function toChartTime(date: string) {
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}

export function toChartTimestamp(date: string, time: string) {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(4, 6)) - 1;
  const day = Number(date.slice(6, 8));
  const hours = Number(time.slice(0, 2));
  const minutes = Number(time.slice(2, 4));

  return Math.floor(
    Date.UTC(year, month, day, hours - 9, minutes, 0) / 1000
  );
}

export function getChartPointTime(point: DailyChartPoint): Time {
  if (point.time) {
    return toChartTimestamp(point.date, point.time) as Time;
  }

  return toChartTime(point.date) as Time;
}

function formatKstDateTime(timestamp: number) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(timestamp * 1000))
    .replace(/\.\s?/g, ".")
    .replace(", ", " ")
    .replace(/(\d{4})\.\s(\d{2})\.\s(\d{2})/, "$1.$2.$3");
}

export function formatCrosshairDate(time: Time, isIntraday = false) {
  if (typeof time === "number") {
    if (isIntraday) {
      return formatKstDateTime(time);
    }

    const date = new Date(time * 1000);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${year}.${month}.${day}`;
  }

  if (typeof time === "string") {
    return time.replace(/-/g, ".");
  }

  if (isBusinessDay(time)) {
    const month = String(time.month).padStart(2, "0");
    const day = String(time.day).padStart(2, "0");
    return `${time.year}.${month}.${day}`;
  }

  return formatKstDateTime(time);
}

export function formatCrosshairPrice(value: number) {
  return value.toLocaleString("ko-KR");
}

export function getCrosshairPrice(data: unknown) {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  if ("value" in data && typeof data.value === "number") {
    return data.value;
  }

  if ("close" in data && typeof data.close === "number") {
    return data.close;
  }

  return undefined;
}

export function attachCrosshairTooltip(
  chart: IChartApi,
  series: ISeriesApi<SeriesType>,
  container: HTMLElement,
  isIntraday = false
) {
  const tooltip = document.createElement("div");
  tooltip.className = "chart-tooltip";
  tooltip.style.display = "none";
  container.appendChild(tooltip);

  const handler = (param: MouseEventParams) => {
    if (
      !param.time ||
      param.point === undefined ||
      param.point.x < 0 ||
      param.point.y < 0
    ) {
      tooltip.style.display = "none";
      return;
    }

    const price = getCrosshairPrice(param.seriesData.get(series));

    if (price === undefined) {
      tooltip.style.display = "none";
      return;
    }

    tooltip.style.display = "block";
    tooltip.textContent = `${formatCrosshairDate(param.time, isIntraday)} · ${formatCrosshairPrice(price)}`;

    const containerWidth = container.clientWidth;
    const tooltipWidth = tooltip.offsetWidth;
    const offset = 12;
    let left = param.point.x + offset;

    if (left + tooltipWidth > containerWidth) {
      left = param.point.x - tooltipWidth - offset;
    }

    tooltip.style.left = `${Math.max(0, left)}px`;
    tooltip.style.top = `${Math.max(0, param.point.y - 36)}px`;
  };

  chart.subscribeCrosshairMove(handler);

  return () => {
    chart.unsubscribeCrosshairMove(handler);
    tooltip.remove();
  };
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

export function getPeriodChange(data: DailyChartPoint[]) {
  if (!data.length) {
    return null;
  }

  const firstClose = data[0].close;
  const lastClose = data[data.length - 1].close;
  const diff = lastClose - firstClose;
  const rate = firstClose !== 0 ? (diff / firstClose) * 100 : 0;

  let direction: "up" | "down" | "flat" = "flat";

  if (diff > 0) {
    direction = "up";
  } else if (diff < 0) {
    direction = "down";
  }

  return { diff, rate, direction };
}

export function formatPeriodChangeSummary(
  periodLabel: string,
  data: DailyChartPoint[],
  isIntraday = false
) {
  const change = getPeriodChange(data);

  if (!change) {
    return null;
  }

  const { diff, rate, direction } = change;
  const amountText =
    diff > 0
      ? `+${Math.abs(diff).toLocaleString("ko-KR")}원`
      : diff < 0
        ? `-${Math.abs(diff).toLocaleString("ko-KR")}원`
        : "0원";
  const rateValue =
    Math.abs(rate) % 1 === 0
      ? String(Math.abs(rate))
      : Math.abs(rate).toFixed(2);
  const rateInParen =
    rate > 0
      ? `(+${rateValue}%)`
      : rate < 0
        ? `(-${rateValue}%)`
        : "(0%)";

  return {
    label: isIntraday ? "당일" : `${periodLabel}전보다`,
    valueText: `${amountText} ${rateInParen}`,
    className: getStockDirectionClass(direction),
  };
}

export function getPeriodLineColor(data: DailyChartPoint[]) {
  if (!data.length) {
    return CHART_FLAT_COLOR;
  }

  const firstClose = data[0].close;
  const lastClose = data[data.length - 1].close;

  if (lastClose >= firstClose) {
    return STOCK_UP_COLOR;
  }

  return STOCK_DOWN_COLOR;
}

export function getLineSeriesData(data: DailyChartPoint[]) {
  return data.map((item) => ({
    time: getChartPointTime(item),
    value: item.close,
  }));
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

export function getPriceChartOptions(
  options: { showTimeScale?: boolean; isIntraday?: boolean } = {}
): DeepPartial<TimeChartOptions> {
  const { showTimeScale = false, isIntraday = false } = options;

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
    crosshair: {
      horzLine: {
        labelVisible: true,
      },
      vertLine: {
        labelVisible: true,
      },
    },
    localization: {
      locale: "ko-KR",
      dateFormat: "yyyy.MM.dd",
      ...(isIntraday
        ? {
            timeFormatter: (time: Time) => formatCrosshairDate(time, true),
          }
        : {}),
    },
    rightPriceScale: {
      borderVisible: false,
    },
    timeScale: {
      borderVisible: false,
      visible: showTimeScale || isIntraday,
      ticksVisible: showTimeScale || isIntraday,
      timeVisible: isIntraday,
      secondsVisible: false,
    },
    handleScroll: false,
    handleScale: false,
  };
}

export function getVolumeChartOptions(isIntraday = false): DeepPartial<TimeChartOptions> {
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
      visible: isIntraday,
      ticksVisible: isIntraday,
      timeVisible: isIntraday,
      secondsVisible: false,
    },
    handleScroll: false,
    handleScale: false,
  };
}

export function getVolumeSeriesData(data: DailyChartPoint[]) {
  return data.map((item, index) => ({
    time: getChartPointTime(item),
    value: item.volume,
    color: getVolumeColor(getDayDirection(data, index)),
  }));
}
