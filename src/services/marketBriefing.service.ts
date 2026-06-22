import type {
  MarketBriefingInput,
  MarketIndexSnapshot,
  MarketStockSnapshot,
} from "@/types/marketBriefing.type";
import type { RankStock } from "@/types/rank.type";
import {
  getAccessToken,
  getIndexPrice,
  getInvestorRankSnapshot,
  getRankStocks,
} from "@/services/kis.service";
import { searchNews } from "@/services/naver.service";

function parseIndexSnapshot(
  data: Record<string, unknown>,
  name: string
): MarketIndexSnapshot {
  const output = (data.output ?? {}) as Record<string, string>;

  return {
    name,
    price: output.bstp_nmix_prpr ?? "0",
    changeRate: output.bstp_nmix_prdy_ctrt ?? "0",
  };
}

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
  return stocks.slice(0, 5).map((stock) => ({
    code: stock.code,
    name: stock.name,
    price: stock.price,
    changeRate: stock.changeRate,
    metric: metric?.(stock),
  }));
}

function formatStockLines(
  label: string,
  stocks: MarketStockSnapshot[]
) {
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

export function buildMarketBriefingPrompt(input: MarketBriefingInput) {
  const market = [
    `코스피: ${input.kospi.price} (${input.kospi.changeRate}%)`,
    `코스닥: ${input.kosdaq.price} (${input.kosdaq.changeRate}%)`,
    formatStockLines("거래대금 상위", input.tradingAmountTop),
    formatStockLines("상승률 상위", input.riseTop),
    formatStockLines("외국인 순매수 상위", input.foreignNetBuyTop),
    formatStockLines("기관 순매수 상위", input.institutionNetBuyTop),
  ].join("\n\n");

  const news = input.news.length
    ? input.news.map((item, index) => `${index + 1}. ${item.title}`).join("\n")
    : "주요 뉴스 없음";

  return { market, news };
}

export async function collectMarketBriefingInput(): Promise<MarketBriefingInput> {
  const tokenData = await getAccessToken();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    throw new Error("KIS access token을 발급받지 못했습니다.");
  }

  const [
    kospiRaw,
    kosdaqRaw,
    tradingAmountRaw,
    riseRaw,
    foreignRaw,
    institutionRaw,
    newsRaw,
  ] = await Promise.all([
    getIndexPrice(accessToken, "0001"),
    getIndexPrice(accessToken, "1001"),
    getRankStocks(accessToken, "tradingAmount", {}),
    getRankStocks(accessToken, "rise", { fid_rank_sort_cls_code: "0" }),
    getInvestorRankSnapshot(accessToken, "foreign"),
    getInvestorRankSnapshot(accessToken, "institution"),
    searchNews("코스피 코스닥 증시", { display: 10 }),
  ]);

  const tradingStocks = (tradingAmountRaw.output ?? []) as RankStock[];
  const riseStocks = (riseRaw.output ?? []) as RankStock[];
  const foreignStocks = foreignRaw;
  const institutionStocks = institutionRaw;

  return {
    kospi: parseIndexSnapshot(kospiRaw, "코스피"),
    kosdaq: parseIndexSnapshot(kosdaqRaw, "코스닥"),
    tradingAmountTop: toStockSnapshots(tradingStocks, (stock) => {
      if (!stock.amount) {
        return undefined;
      }

      const eok = Math.round(Number(stock.amount) / 100_000_000);
      return `거래대금 ${eok.toLocaleString()}억`;
    }),
    riseTop: toStockSnapshots(riseStocks),
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
    news: newsRaw.items.map((item) => ({ title: item.title })),
  };
}
