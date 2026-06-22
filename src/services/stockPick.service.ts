import type { MarketStockSnapshot } from "@/types/marketBriefing.type";
import type { StockPickInput } from "@/types/stockPick.type";
import type { RankStock } from "@/types/rank.type";
import {
  getAccessToken,
  getInvestorRankSnapshot,
  getRankStocks,
} from "@/services/kis.service";
import { searchNews } from "@/services/naver.service";
import { formatTradingVolume } from "@/utils/formatTradingValue";

const STOCK_LIMIT = 10;

function formatAmountInEok(amount?: string) {
  const value = Number(amount);

  if (!amount || Number.isNaN(value) || value === 0) {
    return undefined;
  }

  const eok = Math.round(value / 100);
  return eok > 0 ? `${eok.toLocaleString()}억` : `${value.toLocaleString()}백만`;
}

function toStockSnapshots(
  stocks: RankStock[],
  metric?: (stock: RankStock) => string | undefined
): MarketStockSnapshot[] {
  return stocks.slice(0, STOCK_LIMIT).map((stock) => ({
    code: stock.code,
    name: stock.name,
    price: stock.price,
    changeRate: stock.changeRate,
    metric: metric?.(stock),
  }));
}

function formatStockLines(label: string, stocks: MarketStockSnapshot[]) {
  if (!stocks.length) {
    return `${label}: 데이터 없음`;
  }

  const lines = stocks.map((stock, index) => {
    const change = stock.changeRate ? `, 등락률 ${stock.changeRate}%` : "";
    const metric = stock.metric ? `, ${stock.metric}` : "";
    return `${index + 1}. ${stock.name}(${stock.code}) 현재가 ${Number(stock.price).toLocaleString()}원${change}${metric}`;
  });

  return `${label}:\n${lines.join("\n")}`;
}

export function buildStockPickPrompt(input: StockPickInput) {
  const news = input.news.length
    ? input.news.map((item, index) => `${index + 1}. ${item.title}`).join("\n")
    : "주요 뉴스 없음";

  const stocks = [
    formatStockLines("거래량 증가율 상위", input.volumeIncreaseTop),
    formatStockLines("거래대금 상위", input.tradingAmountTop),
    formatStockLines("상승률 상위", input.riseTop),
    formatStockLines("외국인 순매수 상위", input.foreignNetBuyTop),
    formatStockLines("기관 순매수 상위", input.institutionNetBuyTop),
  ].join("\n\n");

  return { news, stocks };
}

export async function collectStockPickInput(): Promise<StockPickInput> {
  const tokenData = await getAccessToken();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    throw new Error("KIS access token을 발급받지 못했습니다.");
  }

  const [
    volumeIncreaseRaw,
    tradingAmountRaw,
    riseRaw,
    foreignStocks,
    institutionStocks,
    newsRaw,
  ] = await Promise.all([
    getRankStocks(accessToken, "volume", { FID_BLNG_CLS_CODE: "1" }),
    getRankStocks(accessToken, "tradingAmount", {}),
    getRankStocks(accessToken, "rise", { fid_rank_sort_cls_code: "0" }),
    getInvestorRankSnapshot(accessToken, "foreign"),
    getInvestorRankSnapshot(accessToken, "institution"),
    searchNews("코스피 코스닥 증시", { display: 15 }),
  ]);

  const volumeIncreaseStocks = (volumeIncreaseRaw.output ?? []) as RankStock[];
  const tradingStocks = (tradingAmountRaw.output ?? []) as RankStock[];
  const riseStocks = (riseRaw.output ?? []) as RankStock[];

  return {
    news: newsRaw.items.map((item) => ({ title: item.title })),
    volumeIncreaseTop: toStockSnapshots(volumeIncreaseStocks, (stock) => {
      const volume = stock.volume ? formatTradingVolume(stock.volume) : undefined;
      return volume ? `거래량 ${volume}` : undefined;
    }),
    tradingAmountTop: toStockSnapshots(tradingStocks, (stock) => {
      if (!stock.amount) {
        return undefined;
      }

      const eok = Math.round(Number(stock.amount) / 100_000_000);
      return `거래대금 ${eok.toLocaleString()}억`;
    }),
    riseTop: toStockSnapshots(riseStocks, (stock) =>
      stock.changeRate ? `등락률 ${stock.changeRate}%` : undefined
    ),
    foreignNetBuyTop: toStockSnapshots(foreignStocks, (stock) =>
      stock.netBuyAmount
        ? `순매수 ${formatAmountInEok(stock.netBuyAmount)}`
        : undefined
    ),
    institutionNetBuyTop: toStockSnapshots(institutionStocks, (stock) =>
      stock.netBuyAmount
        ? `순매수 ${formatAmountInEok(stock.netBuyAmount)}`
        : undefined
    ),
  };
}
