import { searchStockMaster } from "@/lib/stockMaster";
import { getAccessToken, getStockQuote } from "@/services/kis.service";

export const runtime = "nodejs";

const STOCK_CODE_PATTERN = /^[0-9A-Za-z]{6}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return Response.json({ results: [] });
  }

  const isNumericQuery = /^[0-9A-Za-z]+$/.test(query);
  const minLength = isNumericQuery ? 1 : 2;

  if (query.length < minLength) {
    return Response.json({ results: [] });
  }

  try {
    const matches = await searchStockMaster(query, 20);
    const results = matches.map((entry) => ({
      code: entry.code,
      name: entry.name,
      market: entry.market,
    }));

    const isExactCode =
      STOCK_CODE_PATTERN.test(query) &&
      results.length > 0 &&
      results[0].code.toUpperCase() === query.toUpperCase();

    if (!isExactCode) {
      return Response.json({ results });
    }

    try {
      const tokenData = await getAccessToken();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        return Response.json({ results });
      }

      const quote = await getStockQuote(accessToken, query.toUpperCase());

      return Response.json({
        results: [
          {
            ...quote,
            name: results[0].name,
          },
        ],
      });
    } catch {
      return Response.json({ results });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "종목 검색에 실패했습니다.";

    return Response.json({ message }, { status: 500 });
  }
}
