import { getStockNameByCode } from "@/lib/stockMaster";
import { getAccessToken, getStockQuote } from "@/services/kis.service";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!/^[0-9A-Za-z]{6}$/.test(code)) {
    return Response.json(
      { message: "올바른 종목코드(6자리)를 입력해 주세요." },
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

    const normalizedCode = code.toUpperCase();
    const [result, masterName] = await Promise.all([
      getStockQuote(accessToken, normalizedCode),
      getStockNameByCode(normalizedCode),
    ]);

    return Response.json({
      ...result,
      name: masterName ?? result.name,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "종목 조회에 실패했습니다.";

    return Response.json({ message }, { status: 500 });
  }
}
