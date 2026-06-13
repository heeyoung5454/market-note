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

export function getMetricHeader(type: RankType) {
  const headers: Record<RankType, string> = {
    volume: "거래량",
    rise: "거래대금",
    amount: "거래대금순",
  };

  return headers[type];
}

export function formatMetricValue(
  type: RankType,
  stock: { volume?: string; amount?: string }
) {
  if (type === "volume") {
    return formatTradingVolume(stock.volume);
  }

  return formatTradingAmount(stock.amount);
}
