import { MARKET_VALUE_METRIC_LABELS } from "@/constants/rankOptions";
import type { RankType } from "@/types/rank.type";

export function formatTradingAmount(amount?: string) {
  if (!amount) {
    return "-";
  }

  const value = Number(amount);

  if (Number.isNaN(value) || value === 0) {
    return "-";
  }

  const eok = Math.round(value / 100_000_000);
  return `${eok.toLocaleString()}억원`;
}

export function formatTradingVolume(volume?: string) {
  if (!volume) {
    return "-";
  }

  const value = Number(volume);

  if (Number.isNaN(value) || value === 0) {
    return "-";
  }

  if (value >= 10_000) {
    return `${Math.round(value / 10_000).toLocaleString()}만주`;
  }

  return `${value.toLocaleString()}주`;
}

export function formatMarketCap(marketCap?: string) {
  if (!marketCap) {
    return "-";
  }

  const value = Number(marketCap);

  if (Number.isNaN(value) || value === 0) {
    return "-";
  }

  return `${value.toLocaleString()}억`;
}

export function formatIndicatorValue(value?: string) {
  if (!value) {
    return "-";
  }

  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return "-";
  }

  return numeric.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

export function getMetricHeader(
  type: RankType,
  marketValueSortCode?: string
) {
  const headers: Record<RankType, string> = {
    volume: "거래량",
    rise: "거래대금",
    amount: "시가총액",
    marketValue:
      MARKET_VALUE_METRIC_LABELS[marketValueSortCode ?? "23"] ?? "가치지표",
  };

  return headers[type];
}

const MARKET_VALUE_FIELD_MAP: Record<
  string,
  keyof {
    per?: string;
    pbr?: string;
    pcr?: string;
    psr?: string;
    eps?: string;
    eva?: string;
    ebitda?: string;
    pvDivEbitda?: string;
    ebitdaDivFnncExpn?: string;
  }
> = {
  "23": "per",
  "24": "pbr",
  "25": "pcr",
  "26": "psr",
  "27": "eps",
  "28": "eva",
  "29": "ebitda",
  "30": "pvDivEbitda",
  "31": "ebitdaDivFnncExpn",
};

export function formatMetricValue(
  type: RankType,
  stock: {
    volume?: string;
    amount?: string;
    marketCap?: string;
    per?: string;
    pbr?: string;
    pcr?: string;
    psr?: string;
    eps?: string;
    eva?: string;
    ebitda?: string;
    pvDivEbitda?: string;
    ebitdaDivFnncExpn?: string;
  },
  marketValueSortCode?: string
) {
  if (type === "volume") {
    return formatTradingVolume(stock.volume);
  }

  if (type === "amount") {
    return formatMarketCap(stock.marketCap);
  }

  if (type === "marketValue") {
    const field =
      MARKET_VALUE_FIELD_MAP[marketValueSortCode ?? "23"] ?? "per";
    return formatIndicatorValue(stock[field]);
  }

  return formatTradingAmount(stock.amount);
}
