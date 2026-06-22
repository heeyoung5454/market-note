import type { MarketSentimentInput } from "@/types/marketSentiment.type";
import {
  getAccessToken,
  getIndexPrice,
  getInvestorRankSnapshot,
} from "@/services/kis.service";
import { searchNews } from "@/services/naver.service";

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
    return 0;
  }

  return Math.round(value / 100);
}

function formatForeignNetBuy(stocks: { name: string; netBuyAmount?: string }[]) {
  const netBuyStocks = stocks.filter((stock) => Number(stock.netBuyAmount) > 0);

  if (!netBuyStocks.length) {
    return "외국인 순매수 데이터 없음";
  }

  const totalEok = netBuyStocks.reduce(
    (sum, stock) => sum + formatAmountInEok(stock.netBuyAmount),
    0
  );

  const topLines = netBuyStocks
    .slice(0, 5)
    .map((stock, index) => {
      const amount = formatAmountInEok(stock.netBuyAmount);
      return `${index + 1}. ${stock.name} ${amount.toLocaleString()}억`;
    })
    .join("\n");

  return `상위 종목 합계 ${totalEok.toLocaleString()}억\n${topLines}`;
}

export function buildMarketSentimentPrompt(input: MarketSentimentInput) {
  const news = input.news.length
    ? input.news.map((item, index) => `${index + 1}. ${item.title}`).join("\n")
    : "주요 뉴스 없음";

  return [
    `[뉴스]\n${news}`,
    `[시장 데이터]`,
    `상승 종목 수: ${input.risingStockCount.toLocaleString()}개`,
    `하락 종목 수: ${input.fallingStockCount.toLocaleString()}개`,
    `외국인 순매수:\n${input.foreignNetBuy}`,
  ].join("\n\n");
}

export async function collectMarketSentimentInput(): Promise<MarketSentimentInput> {
  const tokenData = await getAccessToken();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    throw new Error("KIS access token을 발급받지 못했습니다.");
  }

  const [kospiRaw, kosdaqRaw, foreignStocks, newsRaw] = await Promise.all([
    getIndexPrice(accessToken, "0001"),
    getIndexPrice(accessToken, "1001"),
    getInvestorRankSnapshot(accessToken, "foreign"),
    searchNews("코스피 코스닥 증시", { display: 15 }),
  ]);

  const kospiBreadth = parseMarketBreadth(kospiRaw);
  const kosdaqBreadth = parseMarketBreadth(kosdaqRaw);

  return {
    news: newsRaw.items.map((item) => ({ title: item.title })),
    risingStockCount: kospiBreadth.rising + kosdaqBreadth.rising,
    fallingStockCount: kospiBreadth.falling + kosdaqBreadth.falling,
    foreignNetBuy: formatForeignNetBuy(foreignStocks),
  };
}
