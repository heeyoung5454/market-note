import type { MarketStockSnapshot } from "@/types/marketBriefing.type";
import type { RiskStockInput } from "@/types/riskStock.type";
import type { RankStock } from "@/types/rank.type";
import { getAccessToken, getRankStocks } from "@/services/kis.service";
import { searchNews } from "@/services/naver.service";
import { formatTradingVolume } from "@/utils/formatTradingValue";

const STOCK_LIMIT = 10;

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

export function buildRiskStockPrompt(input: RiskStockInput) {
  const news = input.news.length
    ? input.news.map((item, index) => `${index + 1}. ${item.title}`).join("\n")
    : "주요 뉴스 없음";

  const stocks = [
    formatStockLines(
      "급등 종목",
      input.surgeTop.map((stock) => ({
        code: stock.code,
        name: stock.name,
        price: stock.price,
        changeRate: stock.changeRate,
        metric: stock.changeRate ? `등락률 ${stock.changeRate}%` : undefined,
      }))
    ),
    formatStockLines(
      "거래량 증가 종목",
      input.volumeIncreaseTop.map((stock) => ({
        code: stock.code,
        name: stock.name,
        price: stock.price,
        changeRate: stock.changeRate,
        metric: stock.volume
          ? `거래량 ${formatTradingVolume(stock.volume)}`
          : undefined,
      }))
    ),
  ].join("\n\n");

  return { news, stocks };
}

export async function collectRiskStockInput(): Promise<RiskStockInput> {
  const tokenData = await getAccessToken();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    throw new Error("KIS access token을 발급받지 못했습니다.");
  }

  const [surgeRaw, volumeIncreaseRaw, newsRaw] = await Promise.all([
    getRankStocks(accessToken, "rise", { fid_rank_sort_cls_code: "0" }),
    getRankStocks(accessToken, "volume", { FID_BLNG_CLS_CODE: "1" }),
    searchNews("코스피 코스닥 증시", { display: 15 }),
  ]);

  const surgeStocks = (surgeRaw.output ?? []) as RankStock[];
  const volumeIncreaseStocks = (volumeIncreaseRaw.output ?? []) as RankStock[];

  return {
    news: newsRaw.items.map((item) => ({ title: item.title })),
    surgeTop: surgeStocks.slice(0, STOCK_LIMIT).map((stock) => ({
      code: stock.code,
      name: stock.name,
      price: stock.price,
      changeRate: stock.changeRate,
    })),
    volumeIncreaseTop: volumeIncreaseStocks.slice(0, STOCK_LIMIT).map((stock) => ({
      code: stock.code,
      name: stock.name,
      price: stock.price,
      changeRate: stock.changeRate,
      volume: stock.volume,
    })),
  };
}
