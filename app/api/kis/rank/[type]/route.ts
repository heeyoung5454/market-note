import { handleRankRequest } from "@/lib/handleRankRequest";
import type { RankType } from "@/types/rank.type";

const VALID_TYPES: RankType[] = ["volume", "rise", "amount", "marketValue"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  if (!VALID_TYPES.includes(type as RankType)) {
    return Response.json(
      { error: `지원하지 않는 순위 타입입니다: ${type}` },
      { status: 400 }
    );
  }

  return handleRankRequest(request, type as RankType);
}
