import {
    getAccessToken,
    getCurrentPrice,
  } from "@/services/kis.service";
  
  export async function GET(
    _request: Request,
    { params }: { params: Promise<{ symbol: string }> }
  ) {
    const { symbol } = await params;

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

      const result = await getCurrentPrice(accessToken, symbol);
      return Response.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "KIS API 요청 실패";

      return Response.json({ error: message }, { status: 502 });
    }
  }