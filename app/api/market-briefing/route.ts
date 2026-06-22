import {
  buildMarketBriefingPrompt,
  collectMarketBriefingInput,
} from "@/services/marketBriefing.service";
import { parseMarketBriefingResult } from "@/utils/marketBriefing";
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
    const input = await collectMarketBriefingInput();
    const { market, news } = buildMarketBriefingPrompt(input);

    const prompt = `당신은 한국 주식 전문 애널리스트입니다.

아래 데이터를 바탕으로 오늘 국내 증시를 분석해주세요.

[시장 데이터]
${market}

[뉴스]
${news}

아래 JSON 형식으로만 응답하세요.

{
  "summary": "",
  "marketAnalysis": "",
  "strongThemes": [],
  "weakThemes": [],
  "foreignTrend": "",
  "institutionTrend": "",
  "outlook": ""
}

규칙
- 모든 문장은 100자 이내
- 투자 권유 표현 금지
- 객관적인 표현 사용`;

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
        { error: "AI 시장 브리핑을 생성하지 못했습니다." },
        { status: 502 }
      );
    }

    const result = parseMarketBriefingResult(text);

    if (!result.summary) {
      return NextResponse.json(
        { error: "AI 시장 브리핑 결과가 올바르지 않습니다." },
        { status: 502 }
      );
    }

    return NextResponse.json({ input, result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "시장 브리핑 생성 실패";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
