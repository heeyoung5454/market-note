import { searchNews } from "@/services/naver.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();
  const display = Number(searchParams.get("display") ?? 10);
  const start = Number(searchParams.get("start") ?? 1);

  if (!query) {
    return Response.json({ error: "query 파라미터가 필요합니다." }, { status: 400 });
  }

  try {
    const result = await searchNews(query, {
      display: Number.isNaN(display) ? 10 : Math.min(display, 100),
      start: Number.isNaN(start) ? 1 : start,
    });
    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "네이버 뉴스 API 요청 실패";

    return Response.json({ error: message }, { status: 502 });
  }
}
