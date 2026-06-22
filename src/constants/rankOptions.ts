import type { InvestorType, RankType } from "@/types/rank.type";

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

const INVESTOR_SCOPE_OPTIONS = [
  { value: "0000", label: "전체" },
  { value: "0001", label: "코스피" },
  { value: "1001", label: "코스닥" },
] as const;

const INVESTOR_RANK_OPTION_DEFS: RankOptionDef[] = [
  {
    paramKey: "fid_rank_sort_cls_code",
    label: "구분",
    options: [
      { value: "0", label: "매수" },
      { value: "1", label: "매도" },
    ],
    defaultValue: "0",
  },
  {
    paramKey: "fid_input_iscd",
    label: "대상",
    options: [...INVESTOR_SCOPE_OPTIONS],
    defaultValue: "0000",
  },
];

export const INVESTOR_TYPES: InvestorType[] = [
  "foreign",
  "institution",
  "individual",
];

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
  tradingAmount: [
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
  ],
  investorTrade: INVESTOR_RANK_OPTION_DEFS,
};

export function getDefaultRankOptions(type: RankType) {
  const options = Object.fromEntries(
    RANK_OPTION_DEFS[type].map((def) => [def.paramKey, def.defaultValue])
  );

  if (type === "investorTrade") {
    return {
      investor_type: "foreign",
      ...options,
    };
  }

  return options;
}

export function getInitialRankOptions() {
  return {
    volume: getDefaultRankOptions("volume"),
    rise: getDefaultRankOptions("rise"),
    amount: getDefaultRankOptions("amount"),
    tradingAmount: getDefaultRankOptions("tradingAmount"),
    investorTrade: getDefaultRankOptions("investorTrade"),
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

  if (type === "investorTrade") {
    const investorType = searchParams.get("investor_type");

    if (
      investorType &&
      INVESTOR_TYPES.includes(investorType as InvestorType)
    ) {
      overrides.investor_type = investorType;
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
