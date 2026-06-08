import { getAccessToken, getRankStocks } from "@/services/kis.service";
import type { RankType } from "@/types/rank.type";

const VALID_TYPES: RankType[] = ["volume", "rise", "amount"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  if (!VALID_TYPES.includes(type as RankType)) {
    return Response.json(
      { error: `지원하지 않는 순위 타입입니다: ${type}` },
      { status: 400 }
    );
  }

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

    const result = await getRankStocks(accessToken, type as RankType);
    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "KIS API 요청 실패";

    return Response.json({ error: message }, { status: 502 });
  }
}
