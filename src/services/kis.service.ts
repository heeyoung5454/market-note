import type { DailyChartPoint, DailyChartSummary } from "@/types/chart.type";
import dayjs from "dayjs";

const BASE_URL = "https://openapi.koreainvestment.com:9443";

function getKstNow() {
  const kst = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .format(new Date())
    .replace(" ", "T");

  return dayjs(kst);
}

type TokenCache = {
  accessToken: string;
  refreshAt: number;
  validUntil: number;
};

let tokenCache: TokenCache | null = null;

function clearTokenCache() {
  tokenCache = null;
}

function cacheToken(accessToken: string, expiresIn: number) {
  const now = Date.now();
  tokenCache = {
    accessToken,
    // 만료 1시간 전에 갱신 (KIS 토큰 유효기간 24시간)
    refreshAt: now + (expiresIn - 3600) * 1000,
    validUntil: now + expiresIn * 1000,
  };
}

async function requestAccessToken() {
  const response = await fetch(`${BASE_URL}/oauth2/tokenP`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
      appkey: process.env.KIS_APP_KEY,
      appsecret: process.env.KIS_APP_SECRET,
    }),
  });

  const data = await response.json();

  if (!data.access_token) {
    const message =
      data.error_description ?? data.msg1 ?? JSON.stringify(data);
    throw new Error(`KIS token 발급 실패: ${message}`);
  }

  const expiresIn = Number(data.expires_in ?? 86400);
  cacheToken(data.access_token, expiresIn);

  return data;
}

export async function getAccessToken() {
  if (tokenCache && Date.now() < tokenCache.refreshAt) {
    return {
      access_token: tokenCache.accessToken,
      token_type: "Bearer",
      expires_in: Math.floor((tokenCache.validUntil - Date.now()) / 1000),
      cached: true,
    };
  }

  if (tokenCache && Date.now() < tokenCache.validUntil) {
    try {
      return await requestAccessToken();
    } catch {
      return {
        access_token: tokenCache.accessToken,
        token_type: "Bearer",
        expires_in: Math.floor((tokenCache.validUntil - Date.now()) / 1000),
        cached: true,
      };
    }
  }

  return requestAccessToken();
}

async function getValidAccessToken() {
  if (tokenCache && Date.now() < tokenCache.refreshAt) {
    return tokenCache.accessToken;
  }

  if (tokenCache && Date.now() < tokenCache.validUntil) {
    try {
      const data = await requestAccessToken();
      return data.access_token as string;
    } catch {
      return tokenCache.accessToken;
    }
  }

  const data = await requestAccessToken();
  return data.access_token as string;
}

async function fetchCurrentPrice(accessToken: string, symbol: string) {
  const response = await fetch(
    `${BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price?fid_cond_mrkt_div_code=J&fid_input_iscd=${symbol}`,
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        authorization: `Bearer ${accessToken}`,
        appkey: process.env.KIS_APP_KEY!,
        appsecret: process.env.KIS_APP_SECRET!,
        tr_id: "FHKST01010100",
      },
    }
  );

  return response.json();
}

export async function getCurrentPrice(accessToken: string, symbol: string) {
  const result = await fetchCurrentPrice(accessToken, symbol);

  if (result.rt_cd === "1" && result.msg_cd === "EGW00121") {
    clearTokenCache();
    const freshToken = await getValidAccessToken();
    return fetchCurrentPrice(freshToken, symbol);
  }

  return result;
}

export async function getStockQuote(accessToken: string, code: string) {
  const result = await getCurrentPrice(accessToken, code);

  if (result.rt_cd !== "0") {
    throw new Error(result.msg1 ?? "종목 조회 실패");
  }

  const raw = result.output ?? result.Output;
  const output = (Array.isArray(raw) ? raw[0] : raw) as Record<string, string>;

  const name =
    output?.bstp_kor_isnm ??
    output?.hts_kor_isnm ??
    output?.rprs_mrkt_kor_name;

  if (!name) {
    throw new Error("종목 정보를 찾을 수 없습니다.");
  }

  return {
    code: output.mksc_shrn_iscd ?? output.stck_shrn_iscd ?? code,
    name,
    price: Number(output.stck_prpr ?? output.prpr ?? 0),
    change: Number(output.prdy_vrss ?? 0),
    changeRate: Number(output.prdy_ctrt ?? 0),
    volume: Number(output.acml_vol ?? 0),
  };
}

type RankType =
  | "volume"
  | "rise"
  | "amount"
  | "tradingAmount"
  | "investorTrade";

type InvestorType = "foreign" | "institution" | "individual";

const INVESTOR_ETC_CLS_CODE: Record<Exclude<InvestorType, "individual">, string> =
  {
    foreign: "1",
    institution: "2",
  };

const RANK_API: Record<
  RankType,
  { path: string; trId: string; params: Record<string, string> }
> = {
  volume: {
    path: "/uapi/domestic-stock/v1/quotations/volume-rank",
    trId: "FHPST01710000",
    params: {
      FID_COND_MRKT_DIV_CODE: "J",
      FID_COND_SCR_DIV_CODE: "20171",
      FID_INPUT_ISCD: "0000",
      FID_DIV_CLS_CODE: "0",
      FID_BLNG_CLS_CODE: "0",
      FID_TRGT_CLS_CODE: "111111111",
      FID_TRGT_EXLS_CLS_CODE: "0000000000",
      FID_INPUT_PRICE_1: "",
      FID_INPUT_PRICE_2: "",
      FID_VOL_CNT: "",
      FID_INPUT_DATE_1: "",
    },
  },
  amount: {
    path: "/uapi/domestic-stock/v1/ranking/market-cap",
    trId: "FHPST01740000",
    params: {
      fid_cond_mrkt_div_code: "J",
      fid_cond_scr_div_code: "20174",
      fid_div_cls_code: "0",
      fid_input_iscd: "0000",
      fid_trgt_cls_code: "0",
      fid_trgt_exls_cls_code: "0",
      fid_input_price_1: "",
      fid_input_price_2: "",
      fid_vol_cnt: "",
    },
  },
  rise: {
    path: "/uapi/domestic-stock/v1/ranking/fluctuation",
    trId: "FHPST01700000",
    params: {
      fid_cond_mrkt_div_code: "J",
      fid_cond_scr_div_code: "20170",
      fid_input_iscd: "0000",
      fid_rank_sort_cls_code: "0",
      fid_input_cnt_1: "0",
      fid_prc_cls_code: "0",
      fid_input_price_1: "",
      fid_input_price_2: "",
      fid_vol_cnt: "",
      fid_trgt_cls_code: "0",
      fid_trgt_exls_cls_code: "0",
      fid_div_cls_code: "0",
      fid_rsfl_rate1: "0",
      fid_rsfl_rate2: "30",
    },
  },
  tradingAmount: {
    path: "/uapi/domestic-stock/v1/quotations/volume-rank",
    trId: "FHPST01710000",
    params: {
      FID_COND_MRKT_DIV_CODE: "J",
      FID_COND_SCR_DIV_CODE: "20171",
      FID_INPUT_ISCD: "0000",
      FID_DIV_CLS_CODE: "0",
      FID_BLNG_CLS_CODE: "3",
      FID_TRGT_CLS_CODE: "111111111",
      FID_TRGT_EXLS_CLS_CODE: "0000000000",
      FID_INPUT_PRICE_1: "",
      FID_INPUT_PRICE_2: "",
      FID_VOL_CNT: "",
      FID_INPUT_DATE_1: "",
    },
  },
  investorTrade: {
    path: "/uapi/domestic-stock/v1/quotations/foreign-institution-total",
    trId: "FHPTJ04400000",
    params: {
      fid_cond_mrkt_div_code: "V",
      fid_cond_scr_div_code: "16449",
      fid_input_iscd: "0000",
      fid_div_cls_code: "1",
      fid_rank_sort_cls_code: "0",
      fid_etc_cls_code: "1",
    },
  },
};

type InvestorPrefix = "frgn" | "orgn" | "prsn";

function hasTradeAmount(value?: string) {
  const num = Number(value);
  return value !== undefined && value !== "" && !Number.isNaN(num) && num !== 0;
}

function buildInvestorTradeAmounts(
  data: Record<string, string>,
  prefix: InvestorPrefix
) {
  const net = Number(data[`${prefix}_ntby_tr_pbmn`]);
  const grossBuy = data[`${prefix}_shnu_tr_pbmn`];
  const grossSell = data[`${prefix}_seln_tr_pbmn`];

  if (Number.isNaN(net) || net === 0) {
    return {
      netBuyAmount: hasTradeAmount(grossBuy) ? grossBuy : undefined,
      netSellAmount: hasTradeAmount(grossSell) ? grossSell : undefined,
    };
  }

  if (net > 0) {
    return {
      netBuyAmount: String(net),
      netSellAmount: hasTradeAmount(grossSell) ? grossSell : undefined,
    };
  }

  return {
    netBuyAmount: hasTradeAmount(grossBuy) ? grossBuy : undefined,
    netSellAmount: String(Math.abs(net)),
  };
}

async function enrichInvestorRankOutput(
  accessToken: string,
  data: Record<string, unknown>,
  prefix: Exclude<InvestorPrefix, "prsn">
) {
  const items = (data.output ?? data.Output ?? []) as Record<
    string,
    string
  >[];
  const qtyKey =
    prefix === "frgn" ? "frgn_ntby_qty" : "orgn_ntby_qty";
  const amountKey =
    prefix === "frgn" ? "frgn_ntby_tr_pbmn" : "orgn_ntby_tr_pbmn";

  const output = await Promise.all(
    items.slice(0, 20).map(async (item) => {
      const code = item.mksc_shrn_iscd ?? "";
      const result = await fetchInvestorTrade(accessToken, code);
      const today = ((result.output ?? result.Output ?? []) as Record<
        string,
        string
      >[])[0];
      const amounts = today
        ? buildInvestorTradeAmounts(today, prefix)
        : (() => {
            const net = Number(item[amountKey]);
            if (net > 0) {
              return { netBuyAmount: String(net), netSellAmount: undefined };
            }
            if (net < 0) {
              return {
                netBuyAmount: undefined,
                netSellAmount: String(Math.abs(net)),
              };
            }
            return { netBuyAmount: undefined, netSellAmount: undefined };
          })();

      return {
        code,
        name: item.hts_kor_isnm ?? "",
        price: item.stck_prpr ?? "0",
        changeRate: item.prdy_ctrt,
        netBuyAmount: amounts.netBuyAmount,
        netSellAmount: amounts.netSellAmount,
        netBuyQty: item[qtyKey],
      };
    })
  );

  return {
    ...data,
    output,
  };
}

function normalizeRankOutput(data: Record<string, unknown>) {
  const items = (data.output ?? data.Output ?? []) as Record<
    string,
    string
  >[];

  return {
    ...data,
    output: items.map((item) => ({
      code: item.stck_shrn_iscd ?? item.mksc_shrn_iscd ?? "",
      name: item.hts_kor_isnm ?? item.stk_nm ?? "",
      price: item.stck_prpr ?? item.prpr ?? "0",
      changeRate: item.prdy_ctrt,
      volume: item.acml_vol,
      amount: item.acml_tr_pbmn,
      marketCap: item.stck_avls ?? item.hts_avls,
      per: item.per,
      pbr: item.pbr,
      pcr: item.pcr,
      psr: item.psr,
      eps: item.eps,
      eva: item.eva,
      ebitda: item.ebitda,
      pvDivEbitda: item.pv_div_ebitda,
      ebitdaDivFnncExpn: item.ebitda_div_fnnc_expn,
    })),
  };
}

async function fetchKisApi(
  accessToken: string,
  path: string,
  trId: string,
  params: Record<string, string>
) {
  const query = new URLSearchParams(params).toString();

  const response = await fetch(`${BASE_URL}${path}?${query}`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      authorization: `Bearer ${accessToken}`,
      appkey: process.env.KIS_APP_KEY!,
      appsecret: process.env.KIS_APP_SECRET!,
      tr_id: trId,
      custtype: "P",
    },
  });

  return response.json();
}

async function fetchInvestorTrade(
  accessToken: string,
  symbol: string
) {
  return fetchKisApi(
    accessToken,
    "/uapi/domestic-stock/v1/quotations/inquire-investor",
    "FHKST01010900",
    {
      FID_COND_MRKT_DIV_CODE: "J",
      FID_INPUT_ISCD: symbol,
    }
  );
}

async function getIndividualInvestorRank(
  accessToken: string,
  overrides: Record<string, string> = {}
) {
  const scope = overrides.fid_input_iscd ?? "0000";
  const isBuyRank = (overrides.fid_rank_sort_cls_code ?? "0") === "0";
  const tradingConfig = RANK_API.tradingAmount;
  const tradingParams = {
    ...tradingConfig.params,
    FID_INPUT_ISCD: scope,
  };
  const tradingResult = await fetchKisApi(
    accessToken,
    tradingConfig.path,
    tradingConfig.trId,
    tradingParams
  );
  const candidates = normalizeRankOutput(tradingResult).output.slice(0, 50);

  const ranked = (
    await Promise.all(
      candidates.map(async (stock) => {
        const result = await fetchInvestorTrade(accessToken, stock.code);
        const today = ((result.output ?? result.Output ?? []) as Record<
          string,
          string
        >[])[0];

        if (!today) {
          return null;
        }

        const netAmount = Number(today.prsn_ntby_tr_pbmn);

        if (Number.isNaN(netAmount) || netAmount === 0) {
          return null;
        }

        if (isBuyRank && netAmount <= 0) {
          return null;
        }

        if (!isBuyRank && netAmount >= 0) {
          return null;
        }

        const amounts = buildInvestorTradeAmounts(today, "prsn");

        return {
          code: stock.code,
          name: stock.name,
          price: stock.price,
          changeRate: stock.changeRate,
          netBuyAmount: amounts.netBuyAmount,
          netSellAmount: amounts.netSellAmount,
          netBuyQty: today.prsn_ntby_qty,
        };
      })
    )
  )
    .filter((stock): stock is NonNullable<typeof stock> => stock !== null)
    .sort((a, b) => {
      const aValue = Number(a.netBuyAmount ?? a.netSellAmount ?? 0);
      const bValue = Number(b.netBuyAmount ?? b.netSellAmount ?? 0);
      return bValue - aValue;
    })
    .slice(0, 20);

  return { output: ranked };
}

async function getInvestorTradeRank(
  accessToken: string,
  overrides: Record<string, string> = {}
) {
  const investorType = (overrides.investor_type ?? "foreign") as InvestorType;

  if (investorType === "individual") {
    return getIndividualInvestorRank(accessToken, overrides);
  }

  const config = RANK_API.investorTrade;
  const params = {
    ...config.params,
    fid_input_iscd: overrides.fid_input_iscd ?? config.params.fid_input_iscd,
    fid_rank_sort_cls_code:
      overrides.fid_rank_sort_cls_code ?? config.params.fid_rank_sort_cls_code,
    fid_etc_cls_code: INVESTOR_ETC_CLS_CODE[investorType],
  };
  const result = await fetchKisApi(
    accessToken,
    config.path,
    config.trId,
    params
  );

  const investorField = investorType === "foreign" ? "frgn" : "orgn";

  if (result.rt_cd === "1" && result.msg_cd === "EGW00121") {
    clearTokenCache();
    const freshToken = await getValidAccessToken();
    const retried = await fetchKisApi(
      freshToken,
      config.path,
      config.trId,
      params
    );
    return enrichInvestorRankOutput(freshToken, retried, investorField);
  }

  return enrichInvestorRankOutput(accessToken, result, investorField);
}

export async function getRankStocks(
  accessToken: string,
  type: RankType,
  overrides: Record<string, string> = {}
) {
  if (type === "investorTrade") {
    return getInvestorTradeRank(accessToken, overrides);
  }

  const config = RANK_API[type];
  const params = { ...config.params, ...overrides };
  const result = await fetchKisApi(
    accessToken,
    config.path,
    config.trId,
    params
  );

  if (result.rt_cd === "1" && result.msg_cd === "EGW00121") {
    clearTokenCache();
    const freshToken = await getValidAccessToken();
    const retried = await fetchKisApi(
      freshToken,
      config.path,
      config.trId,
      params
    );
    return normalizeRankOutput(retried);
  }

  return normalizeRankOutput(result);
}

function normalizeDailyChart(data: Record<string, unknown>) {
  const items = (data.output2 ?? []) as Record<string, string>[];
  const summaryRaw = (data.output1 ?? data.output ?? null) as
    | Record<string, string>
    | Record<string, string>[]
    | null;

  const summarySource = Array.isArray(summaryRaw)
    ? summaryRaw[0]
    : summaryRaw;

  const output: DailyChartPoint[] = items
    .map((item) => ({
      date: item.stck_bsop_date ?? "",
      open: Number(item.stck_oprc),
      high: Number(item.stck_hgpr),
      low: Number(item.stck_lwpr),
      close: Number(item.stck_clpr),
      volume: Number(item.acml_vol),
    }))
    .filter((item) => item.date && !Number.isNaN(item.close))
    .sort((a, b) => a.date.localeCompare(b.date));

  const summary: DailyChartSummary | null = summarySource
    ? {
        name: summarySource.hts_kor_isnm ?? summarySource.stk_nm,
        code: summarySource.stck_shrn_iscd ?? summarySource.mksc_shrn_iscd,
        price: summarySource.stck_prpr ?? summarySource.prpr,
        changeRate: summarySource.prdy_ctrt,
        volume: summarySource.acml_vol,
        amount: summarySource.acml_tr_pbmn,
        marketCap: summarySource.hts_avls,
      }
    : null;

  return { output, summary };
}

async function fetchDailyChart(
  accessToken: string,
  symbol: string,
  fromDate: string,
  toDate: string
) {
  return fetchKisApi(
    accessToken,
    "/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice",
    "FHKST03010100",
    {
      FID_COND_MRKT_DIV_CODE: "J",
      FID_INPUT_ISCD: symbol,
      FID_INPUT_DATE_1: fromDate,
      FID_INPUT_DATE_2: toDate,
      FID_PERIOD_DIV_CODE: "D",
      FID_ORG_ADJ_PRC: "0",
    }
  );
}

async function fetchDailyChartWithRetry(
  accessToken: string,
  symbol: string,
  fromDate: string,
  toDate: string
) {
  let result = await fetchDailyChart(accessToken, symbol, fromDate, toDate);

  if (result.rt_cd === "1" && result.msg_cd === "EGW00121") {
    clearTokenCache();
    const freshToken = await getValidAccessToken();
    result = await fetchDailyChart(freshToken, symbol, fromDate, toDate);
  }

  return result;
}

function mergeChartPoints(
  existing: DailyChartPoint[],
  batch: DailyChartPoint[]
) {
  const map = new Map(existing.map((point) => [point.date, point]));

  for (const point of batch) {
    map.set(point.date, point);
  }

  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function isWeekend(date: dayjs.Dayjs) {
  const day = date.day();
  return day === 0 || day === 6;
}

function getPreviousTradingDay(date: dayjs.Dayjs) {
  let tradingDay = date.subtract(1, "day");

  while (isWeekend(tradingDay)) {
    tradingDay = tradingDay.subtract(1, "day");
  }

  return tradingDay;
}

function resolveDailyChartDateRange(days: number) {
  const today = dayjs();
  const endDate = today.format("YYYYMMDD");

  if (days > 1) {
    const fromDate = today.subtract(days, "day").format("YYYYMMDD");
    return { fetchFromDate: fromDate, displayFromDate: fromDate, endDate };
  }

  const yesterday = today.subtract(1, "day");

  if (!isWeekend(yesterday)) {
    const fromDate = yesterday.format("YYYYMMDD");
    return { fetchFromDate: fromDate, displayFromDate: fromDate, endDate };
  }

  const lastTradingDay = getPreviousTradingDay(today);
  const priorTradingDay = getPreviousTradingDay(lastTradingDay);
  const fromDate = priorTradingDay.format("YYYYMMDD");

  return { fetchFromDate: fromDate, displayFromDate: fromDate, endDate };
}

function resolveIntradayQuery() {
  const today = getKstNow();

  if (isWeekend(today)) {
    const lastTradingDay = getPreviousTradingDay(today);

    return {
      targetDate: lastTradingDay.format("YYYYMMDD"),
      isToday: false,
    };
  }

  return {
    targetDate: today.format("YYYYMMDD"),
    isToday: true,
  };
}

function getIntradayCursor(isToday: boolean) {
  if (!isToday) {
    return "153000";
  }

  const time = getKstNow().format("HHmmss");

  if (time < "090000") {
    return "090000";
  }

  if (time > "153000") {
    return "153000";
  }

  return time;
}

function normalizeMinuteChartOutput(data: Record<string, unknown>) {
  const items = (data.output2 ?? []) as Record<string, string>[];
  const summaryRaw = (data.output1 ?? null) as
    | Record<string, string>
    | Record<string, string>[]
    | null;

  const summarySource = Array.isArray(summaryRaw)
    ? summaryRaw[0]
    : summaryRaw;

  const output = items
    .map((item) => ({
      date: item.stck_bsop_date ?? "",
      time: (item.stck_cntg_hour ?? "").padStart(6, "0"),
      open: Number(item.stck_oprc),
      high: Number(item.stck_hgpr),
      low: Number(item.stck_lwpr),
      close: Number(item.stck_prpr),
      volume: Number(item.cntg_vol),
    }))
    .filter(
      (item) =>
        item.date &&
        item.time &&
        !Number.isNaN(item.close) &&
        !Number.isNaN(item.open)
    )
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
    );

  const summary: DailyChartSummary | null = summarySource
    ? {
        name: summarySource.hts_kor_isnm ?? summarySource.stk_nm,
        code: summarySource.stck_shrn_iscd ?? summarySource.mksc_shrn_iscd,
        price: summarySource.stck_prpr ?? summarySource.prpr,
        changeRate: summarySource.prdy_ctrt,
        volume: summarySource.acml_vol,
        amount: summarySource.acml_tr_pbmn,
        marketCap: summarySource.hts_avls,
      }
    : null;

  return { output, summary };
}

type MinuteBar = DailyChartPoint & { time: string };

function getFiveMinuteBucketTime(time: string) {
  const hours = Number(time.slice(0, 2));
  const minutes = Number(time.slice(2, 4));
  const bucketMinutes = Math.floor(minutes / 5) * 5;

  return `${String(hours).padStart(2, "0")}${String(bucketMinutes).padStart(2, "0")}00`;
}

function aggregateToFiveMinuteBars(minutes: MinuteBar[]) {
  const groups = new Map<string, MinuteBar[]>();

  for (const bar of minutes) {
    if (bar.time < "090000") {
      continue;
    }

    const bucketKey = `${bar.date}${getFiveMinuteBucketTime(bar.time)}`;
    const bucket = groups.get(bucketKey) ?? [];
    bucket.push(bar);
    groups.set(bucketKey, bucket);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, bars]) => {
      const sorted = [...bars].sort((a, b) => a.time.localeCompare(b.time));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const bucketTime = getFiveMinuteBucketTime(first.time);

      return {
        date: first.date,
        time: bucketTime,
        open: first.open,
        high: Math.max(...sorted.map((bar) => bar.high)),
        low: Math.min(...sorted.map((bar) => bar.low)),
        close: last.close,
        volume: sorted.reduce((sum, bar) => sum + bar.volume, 0),
      };
    });
}

function getPreviousMinuteTime(time: string) {
  const hours = Number(time.slice(0, 2));
  const minutes = Number(time.slice(2, 4));
  const seconds = time.length >= 6 ? time.slice(4, 6) : "00";
  const totalMinutes = hours * 60 + minutes;

  if (totalMinutes <= 9 * 60) {
    return "090000";
  }

  const previous = totalMinutes - 1;
  const previousHours = Math.floor(previous / 60);
  const previousMinutes = previous % 60;

  return `${String(previousHours).padStart(2, "0")}${String(previousMinutes).padStart(2, "0")}${seconds}`;
}

async function fetchMinuteChartPage(
  accessToken: string,
  symbol: string,
  targetDate: string,
  hour: string,
  isToday: boolean
) {
  const path = isToday
    ? "/uapi/domestic-stock/v1/quotations/inquire-time-itemchartprice"
    : "/uapi/domestic-stock/v1/quotations/inquire-time-dailychartprice";
  const trId = isToday ? "FHKST03010200" : "FHKST03010230";

  const params: Record<string, string> = {
    FID_COND_MRKT_DIV_CODE: "J",
    FID_INPUT_ISCD: symbol,
    FID_INPUT_HOUR_1: hour,
  };

  if (isToday) {
    params.FID_ETC_CLS_CODE = "";
    params.FID_PW_DATA_INCU_YN = "Y";
  } else {
    params.FID_INPUT_DATE_1 = targetDate;
    params.FID_PW_DATA_INCU_YN = "Y";
    params.FID_FAKE_TICK_INCU_YN = "";
  }

  let result = await fetchKisApi(accessToken, path, trId, params);

  if (result.rt_cd === "1" && result.msg_cd === "EGW00121") {
    clearTokenCache();
    const freshToken = await getValidAccessToken();
    result = await fetchKisApi(freshToken, path, trId, params);
  }

  return result;
}

async function getIntradayMinuteBars(
  accessToken: string,
  symbol: string,
  targetDate: string,
  isToday: boolean
) {
  let cursor = getIntradayCursor(isToday);
  const seen = new Set<string>();
  const minutes: MinuteBar[] = [];
  let summary: DailyChartSummary | null = null;

  for (let page = 0; page < 40; page++) {
    const result = await fetchMinuteChartPage(
      accessToken,
      symbol,
      targetDate,
      cursor,
      isToday
    );

    if (result.rt_cd !== "0") {
      break;
    }

    const normalized = normalizeMinuteChartOutput(result);

    if (normalized.summary) {
      summary = normalized.summary;
    }

    if (!normalized.output.length) {
      break;
    }

    for (const bar of normalized.output) {
      if (bar.date !== targetDate) {
        continue;
      }

      const key = `${bar.date}${bar.time}`;

      if (!seen.has(key)) {
        seen.add(key);
        minutes.push(bar as MinuteBar);
      }
    }

    const dayBars = normalized.output.filter((bar) => bar.date === targetDate);

    if (!dayBars.length) {
      break;
    }

    const earliest = dayBars[0].time;

    if (earliest <= "090000") {
      break;
    }

    const nextCursor = getPreviousMinuteTime(earliest);

    if (nextCursor === cursor) {
      break;
    }

    cursor = nextCursor;
  }

  minutes.sort(
    (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
  );

  return {
    minutes,
    summary,
  };
}

async function getIntradayFiveMinuteChart(
  accessToken: string,
  symbol: string
) {
  const { targetDate, isToday } = resolveIntradayQuery();

  const { minutes, summary } = await getIntradayMinuteBars(
    accessToken,
    symbol,
    targetDate,
    isToday
  );

  return {
    output: aggregateToFiveMinuteBars(minutes),
    summary,
    granularity: "5min" as const,
    tradingDate: targetDate,
  };
}

export async function getDailyChart(
  accessToken: string,
  symbol: string,
  days = 1
) {
  if (days === 1) {
    return getIntradayFiveMinuteChart(accessToken, symbol);
  }

  let { fetchFromDate, displayFromDate, endDate } =
    resolveDailyChartDateRange(days);
  let output: DailyChartPoint[] = [];
  let summary: DailyChartSummary | null = null;

  for (let page = 0; page < 20; page++) {
    const result = await fetchDailyChartWithRetry(
      accessToken,
      symbol,
      fetchFromDate,
      endDate
    );
    const normalized = normalizeDailyChart(result);

    if (normalized.summary) {
      summary = normalized.summary;
    }

    if (!normalized.output.length) {
      break;
    }

    output = mergeChartPoints(output, normalized.output);

    const oldestDate = normalized.output[0].date;

    if (oldestDate <= fetchFromDate || normalized.output.length < 100) {
      break;
    }

    endDate = dayjs(oldestDate, "YYYYMMDD")
      .subtract(1, "day")
      .format("YYYYMMDD");
  }

  return {
    output: output.filter((point) => point.date >= displayFromDate),
    summary,
    granularity: "day" as const,
  };
}