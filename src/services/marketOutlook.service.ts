import type {
  MarketIndexSnapshot,
  MarketStockSnapshot,
} from "@/types/marketBriefing.type";
import type { MarketOutlookInput } from "@/types/marketOutlook.type";
import type { RankStock } from "@/types/rank.type";
import {
  getAccessToken,
  getIndexPrice,
  getInvestorRankSnapshot,
  getRankStocks,
} from "@/services/kis.service";
import { searchNews } from "@/services/naver.service";

const STOCK_LIMIT = 5;

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

function parseMarketBreadth(data: Record<string, unknown>) {
  const output = (data.output ?? {}) as Record<string, string>;

  return {
    rising: Number(output.ascn_issu_cnt ?? 0),
    falling: Number(output.down_issu_cnt ?? 0),
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

function formatForeignFlow(stocks: { name: string; netBuyAmount?: string }[]) {
  const netBuyStocks = stocks.filter((stock) => Number(stock.netBuyAmount) > 0);
  const netSellStocks = stocks.filter((stock) => Number(stock.netBuyAmount) < 0);

  if (!netBuyStocks.length && !netSellStocks.length) {
    return "외국인 수급 데이터 없음";
  }

  const lines: string[] = [];

  if (netBuyStocks.length) {
    const topBuy = netBuyStocks
      .slice(0, 5)
      .map((stock, index) => {
        const amount = formatAmountInEok(stock.netBuyAmount);
        return `${index + 1}. ${stock.name} 순매수 ${amount ?? "-"}`;
      })
      .join("\n");
    lines.push(`[순매수 상위]\n${topBuy}`);
  }

  if (netSellStocks.length) {
    const topSell = netSellStocks
      .slice(0, 3)
      .map((stock, index) => {
        const amount = formatAmountInEok(
          stock.netBuyAmount ? String(Math.abs(Number(stock.netBuyAmount))) : undefined
        );
        return `${index + 1}. ${stock.name} 순매도 ${amount ?? "-"}`;
      })
      .join("\n");
    lines.push(`[순매도 상위]\n${topSell}`);
  }

  return lines.join("\n\n");
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

function formatNewsLines(label: string, news: { title: string }[]) {
  if (!news.length) {
    return `${label}: 데이터 없음`;
  }

  return `${label}:\n${news.map((item, index) => `${index + 1}. ${item.title}`).join("\n")}`;
}

export function buildMarketOutlookPrompt(input: MarketOutlookInput) {
  const market = [
    `코스피: ${input.kospi.price} (${input.kospi.changeRate}%)`,
    `코스닥: ${input.kosdaq.price} (${input.kosdaq.changeRate}%)`,
    `상승 종목 수: ${input.risingStockCount.toLocaleString()}개`,
    `하락 종목 수: ${input.fallingStockCount.toLocaleString()}개`,
    formatStockLines("거래대금 상위", input.tradingAmountTop),
    formatStockLines("상승률 상위", input.riseTop),
    `외국인 수급:\n${input.foreignFlow}`,
    formatNewsLines("미국 증시 동향", input.usMarketNews),
  ].join("\n\n");

  const news = input.news.length
    ? input.news.map((item, index) => `${index + 1}. ${item.title}`).join("\n")
    : "주요 뉴스 없음";

  return { market, news };
}

export async function collectMarketOutlookInput(): Promise<MarketOutlookInput> {
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
    foreignStocks,
    newsRaw,
    usNewsRaw,
  ] = await Promise.all([
    getIndexPrice(accessToken, "0001"),
    getIndexPrice(accessToken, "1001"),
    getRankStocks(accessToken, "tradingAmount", {}),
    getRankStocks(accessToken, "rise", { fid_rank_sort_cls_code: "0" }),
    getInvestorRankSnapshot(accessToken, "foreign"),
    searchNews("코스피 코스닥 증시", { display: 15 }),
    searchNews("미국 증시 나스닥 다우", { display: 10 }),
  ]);

  const tradingStocks = (tradingAmountRaw.output ?? []) as RankStock[];
  const riseStocks = (riseRaw.output ?? []) as RankStock[];
  const kospiBreadth = parseMarketBreadth(kospiRaw);
  const kosdaqBreadth = parseMarketBreadth(kosdaqRaw);

  return {
    kospi: parseIndexSnapshot(kospiRaw, "코스피"),
    kosdaq: parseIndexSnapshot(kosdaqRaw, "코스닥"),
    risingStockCount: kospiBreadth.rising + kosdaqBreadth.rising,
    fallingStockCount: kospiBreadth.falling + kosdaqBreadth.falling,
    tradingAmountTop: toStockSnapshots(tradingStocks, (stock) => {
      if (!stock.amount) {
        return undefined;
      }

      const eok = Math.round(Number(stock.amount) / 100_000_000);
      return `거래대금 ${eok.toLocaleString()}억`;
    }),
    riseTop: toStockSnapshots(riseStocks),
    foreignFlow: formatForeignFlow(foreignStocks),
    usMarketNews: usNewsRaw.items.map((item) => ({ title: item.title })),
    news: newsRaw.items.map((item) => ({ title: item.title })),
  };
}
