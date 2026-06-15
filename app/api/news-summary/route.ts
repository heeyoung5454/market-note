import type { NewsSummaryResult } from "@/types/newsSummary.type";
import { parseNewsSummaryResult } from "@/utils/newsSummary";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { stockName, titles } = await req.json();

  if (!stockName?.trim()) {
    return NextResponse.json(
      { error: "stockName이 필요합니다." },
      { status: 400 }
    );
  }

  if (!Array.isArray(titles) || titles.length === 0) {
    return NextResponse.json(
      { error: "titles 배열이 필요합니다." },
      { status: 400 }
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const newsList = titles
    .slice(0, 10)
    .map((title: string, index: number) => `${index + 1}. ${title}`)
    .join("\n");

  const prompt = `
종목명: ${stockName}

관련 뉴스:
${newsList}

위 뉴스를 분석해서 아래 JSON 형식으로만 응답해.

{
  "points": [
    "핵심 이슈 한 줄 요약",
    "주가 영향 한 줄 요약",
    "투자 포인트 한 줄 요약"
  ],
  "recommendationPercent": 뉴스 기반 투자 매력도 (0~100 정수, 높을수록 긍정적),
  "riskPercent": 투자 위험도 (0~100 정수, 높을수록 위험)
}

투자 권유가 아닌 정보 요약 톤으로 작성해. points는 정확히 3개 항목이어야 해.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim();

    if (!text) {
      return NextResponse.json(
        { error: "AI 요약을 생성하지 못했습니다." },
        { status: 502 }
      );
    }

    const result: NewsSummaryResult = parseNewsSummaryResult(text);

    if (result.points.length === 0) {
      return NextResponse.json(
        { error: "AI 요약 결과가 올바르지 않습니다." },
        { status: 502 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gemini API 요청 실패";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
