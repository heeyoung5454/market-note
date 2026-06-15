import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function buildPrompt({
  name,
  code,
  price,
  changeRate,
  marketCap,
}: {
  name: string;
  code?: string;
  price?: string;
  changeRate?: string;
  marketCap?: string;
}) {
  const context = [
    code && `종목코드 ${code}`,
    price && `현재가 ${Number(price).toLocaleString()}원`,
    changeRate && `등락률 ${changeRate}%`,
    marketCap && `시가총액 ${Number(marketCap).toLocaleString()}억`,
  ]
    .filter(Boolean)
    .join(", ");

  return `${name}${context ? ` (${context})` : ""}의 최근 투자 포인트를 3줄로 설명해줘. 각 줄은 한 가지 핵심만 간결하게. 번호나 불릿 없이 줄바꿈으로만 구분해. 투자 권유가 아닌 정보 요약 톤으로 작성해.`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim();
  const code = searchParams.get("code")?.trim();
  const price = searchParams.get("price")?.trim();
  const changeRate = searchParams.get("changeRate")?.trim();
  const marketCap = searchParams.get("marketCap")?.trim();

  if (!name) {
    return NextResponse.json(
      { error: "name 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildPrompt({ name, code, price, changeRate, marketCap }),
    });

    const result = response.text?.trim();

    if (!result) {
      return NextResponse.json(
        { error: "AI 분석 결과를 생성하지 못했습니다." },
        { status: 502 }
      );
    }

    return NextResponse.json({ result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gemini API 요청 실패";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
