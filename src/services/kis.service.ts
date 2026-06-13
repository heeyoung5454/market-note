import type { DailyChartPoint, DailyChartSummary } from "@/types/chart.type";
import dayjs from "dayjs";

const BASE_URL = "https://openapi.koreainvestment.com:9443";

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

type RankType = "volume" | "rise" | "amount";

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
  rise: {
    path: "/uapi/domestic-stock/v1/ranking/fluctuation",
    trId: "FHPST01700000",
    params: {
      fid_cond_mrkt_div_code: "J",
      fid_cond_scr_div_code: "20170",
      fid_input_iscd: "0000",
      fid_rank_sort_cls_code: "0",
      fid_input_cnt_1: "30",
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
};

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

export async function getRankStocks(accessToken: string, type: RankType) {
  const config = RANK_API[type];
  const result = await fetchKisApi(
    accessToken,
    config.path,
    config.trId,
    config.params
  );

  if (result.rt_cd === "1" && result.msg_cd === "EGW00121") {
    clearTokenCache();
    const freshToken = await getValidAccessToken();
    const retried = await fetchKisApi(
      freshToken,
      config.path,
      config.trId,
      config.params
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

export async function getDailyChart(
  accessToken: string,
  symbol: string,
  days = 90
) {
  const toDate = dayjs().format("YYYYMMDD");
  const fromDate = dayjs().subtract(days, "day").format("YYYYMMDD");
  const result = await fetchDailyChart(
    accessToken,
    symbol,
    fromDate,
    toDate
  );

  if (result.rt_cd === "1" && result.msg_cd === "EGW00121") {
    clearTokenCache();
    const freshToken = await getValidAccessToken();
    const retried = await fetchDailyChart(
      freshToken,
      symbol,
      fromDate,
      toDate
    );
    return normalizeDailyChart(retried);
  }

  return normalizeDailyChart(result);
}