import type { RankType } from "@/types/rank.type";

export type RankOptionDef = {
  paramKey: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue: string;
};

const MARKET_OPTIONS = [
  { value: "J", label: "KRX" },
  { value: "NX", label: "NXT" },
] as const;

const SCOPE_OPTIONS = [
  { value: "0000", label: "전체" },
  { value: "0001", label: "거래소" },
  { value: "1001", label: "코스닥" },
  { value: "2001", label: "코스피200" },
] as const;

const STOCK_TYPE_OPTIONS = [
  { value: "0", label: "전체" },
  { value: "1", label: "보통주" },
  { value: "2", label: "우선주" },
] as const;

const MARKET_VALUE_DIV_OPTIONS = [
  { value: "0", label: "전체" },
  { value: "1", label: "관리종목" },
  { value: "2", label: "투자주의" },
  { value: "3", label: "투자경고" },
  { value: "4", label: "투자위험예고" },
  { value: "5", label: "투자위험" },
  { value: "6", label: "보통주" },
  { value: "7", label: "우선주" },
] as const;

const FISCAL_YEAR_OPTIONS = Array.from({ length: 4 }, (_, index) => {
  const year = String(new Date().getFullYear() - index);
  return { value: year, label: `${year}년` };
});

const FISCAL_QUARTER_OPTIONS = [
  { value: "0", label: "1/4분기" },
  { value: "1", label: "반기" },
  { value: "2", label: "3/4분기" },
  { value: "3", label: "결산" },
] as const;

const MARKET_VALUE_SORT_OPTIONS = [
  { value: "23", label: "PER" },
  { value: "24", label: "PBR" },
  { value: "25", label: "PCR" },
  { value: "26", label: "PSR" },
  { value: "27", label: "EPS" },
  { value: "28", label: "EVA" },
  { value: "29", label: "EBITDA" },
  { value: "30", label: "EV/EBITDA" },
  { value: "31", label: "EBITDA/금융비용" },
] as const;

export const MARKET_VALUE_METRIC_LABELS: Record<string, string> =
  Object.fromEntries(
    MARKET_VALUE_SORT_OPTIONS.map((option) => [option.value, option.label])
  );

export const RANK_OPTION_DEFS: Record<RankType, RankOptionDef[]> = {
  volume: [
    {
      paramKey: "FID_COND_MRKT_DIV_CODE",
      label: "시장",
      options: [...MARKET_OPTIONS],
      defaultValue: "J",
    },
    {
      paramKey: "FID_INPUT_ISCD",
      label: "대상",
      options: [...SCOPE_OPTIONS],
      defaultValue: "0000",
    },
    {
      paramKey: "FID_DIV_CLS_CODE",
      label: "종목구분",
      options: [...STOCK_TYPE_OPTIONS],
      defaultValue: "0",
    },
    {
      paramKey: "FID_BLNG_CLS_CODE",
      label: "정렬기준",
      options: [
        { value: "0", label: "평균거래량" },
        { value: "1", label: "거래증가율" },
        { value: "2", label: "평균거래회전율" },
        { value: "3", label: "거래금액순" },
        { value: "4", label: "평균거래금액회전율" },
      ],
      defaultValue: "0",
    },
  ],
  rise: [
    {
      paramKey: "fid_cond_mrkt_div_code",
      label: "시장",
      options: [...MARKET_OPTIONS],
      defaultValue: "J",
    },
    {
      paramKey: "fid_input_iscd",
      label: "대상",
      options: [...SCOPE_OPTIONS],
      defaultValue: "0000",
    },
    {
      paramKey: "fid_rank_sort_cls_code",
      label: "정렬기준",
      options: [
        { value: "0", label: "상승률순" },
        { value: "1", label: "하락률순" },
        { value: "2", label: "시가대비상승" },
        { value: "3", label: "시가대비하락" },
        { value: "4", label: "변동율" },
      ],
      defaultValue: "0",
    },
    {
      paramKey: "fid_div_cls_code",
      label: "종목구분",
      options: [...STOCK_TYPE_OPTIONS],
      defaultValue: "0",
    },
    {
      paramKey: "fid_input_cnt_1",
      label: "누적일수",
      options: [
        { value: "0", label: "전체" },
        { value: "5", label: "5일" },
        { value: "10", label: "10일" },
        { value: "20", label: "20일" },
        { value: "60", label: "60일" },
        { value: "120", label: "120일" },
        { value: "260", label: "260일" },
      ],
      defaultValue: "0",
    },
  ],
  amount: [
    {
      paramKey: "fid_cond_mrkt_div_code",
      label: "시장",
      options: [...MARKET_OPTIONS],
      defaultValue: "J",
    },
    {
      paramKey: "fid_input_iscd",
      label: "대상",
      options: [...SCOPE_OPTIONS],
      defaultValue: "0000",
    },
    {
      paramKey: "fid_div_cls_code",
      label: "종목구분",
      options: [...STOCK_TYPE_OPTIONS],
      defaultValue: "0",
    },
  ],
  marketValue: [
    {
      paramKey: "fid_cond_mrkt_div_code",
      label: "시장",
      options: [...MARKET_OPTIONS],
      defaultValue: "J",
    },
    {
      paramKey: "fid_input_iscd",
      label: "대상",
      options: [...SCOPE_OPTIONS],
      defaultValue: "0000",
    },
    {
      paramKey: "fid_div_cls_code",
      label: "종목구분",
      options: [...MARKET_VALUE_DIV_OPTIONS],
      defaultValue: "0",
    },
    {
      paramKey: "fid_rank_sort_cls_code",
      label: "가치지표",
      options: [...MARKET_VALUE_SORT_OPTIONS],
      defaultValue: "23",
    },
    {
      paramKey: "fid_input_option_1",
      label: "회계연도",
      options: FISCAL_YEAR_OPTIONS,
      defaultValue: String(new Date().getFullYear() - 1),
    },
    {
      paramKey: "fid_input_option_2",
      label: "분기구분",
      options: [...FISCAL_QUARTER_OPTIONS],
      defaultValue: "3",
    },
  ],
};

export function getDefaultRankOptions(type: RankType) {
  return Object.fromEntries(
    RANK_OPTION_DEFS[type].map((def) => [def.paramKey, def.defaultValue])
  );
}

export function getInitialRankOptions() {
  return {
    volume: getDefaultRankOptions("volume"),
    rise: getDefaultRankOptions("rise"),
    amount: getDefaultRankOptions("amount"),
    marketValue: getDefaultRankOptions("marketValue"),
  } satisfies Record<RankType, Record<string, string>>;
}

export function parseRankOverrides(
  type: RankType,
  searchParams: URLSearchParams
) {
  const overrides: Record<string, string> = {};

  for (const def of RANK_OPTION_DEFS[type]) {
    const value = searchParams.get(def.paramKey);

    if (value === null) {
      continue;
    }

    const isValid = def.options.some((option) => option.value === value);

    if (isValid) {
      overrides[def.paramKey] = value;
    }
  }

  return overrides;
}

export function buildRankQueryString(options: Record<string, string>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value) {
      params.set(key, value);
    }
  }

  return params.toString();
}
