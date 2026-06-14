import { parseRankOverrides } from "@/constants/rankOptions";
import { getAccessToken, getRankStocks } from "@/services/kis.service";
import type { RankType } from "@/types/rank.type";

export async function handleRankRequest(request: Request, type: RankType) {
  try {
    const tokenData = await getAccessToken();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return Response.json(
        {
          error: "KIS access token을 발급받지 못했습니다.",
          detail: tokenData,
        },
        { status: 502 }
      );
    }

    const { searchParams } = new URL(request.url);
    const overrides = parseRankOverrides(type, searchParams);
    const result = await getRankStocks(accessToken, type, overrides);

    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "KIS API 요청 실패";

    return Response.json({ error: message }, { status: 502 });
  }
}
