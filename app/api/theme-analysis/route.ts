import {
  buildThemeAnalysisPrompt,
  collectThemeAnalysisInput,
} from "@/services/themeAnalysis.service";
import { parseThemeAnalysisResult } from "@/utils/themeAnalysis";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function GET() {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const input = await collectThemeAnalysisInput();
    const { news, stocks } = buildThemeAnalysisPrompt(input);

    const prompt = `당신은 한국 주식 테마 분석 전문가입니다.

뉴스와 종목 데이터를 분석하여 오늘 시장에서 주목받는 테마를 추출하세요.

[뉴스]
${news}

[종목 데이터]
${stocks}

아래 JSON 형식으로만 응답하세요.

{
  "themes": [
    {
      "name": "",
      "summary": "",
      "strength": "strong",
      "stocks": [],
      "reason": ""
    }
  ]
}

최대 10개 테마만 반환하세요.
비슷한 테마는 하나로 묶으세요.`;

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
        { error: "AI 테마 분석을 생성하지 못했습니다." },
        { status: 502 }
      );
    }

    const result = parseThemeAnalysisResult(text);

    if (!result.themes.length) {
      return NextResponse.json(
        { error: "AI 테마 분석 결과가 올바르지 않습니다." },
        { status: 502 }
      );
    }

    return NextResponse.json({ input, result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "테마 분석 생성 실패";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
