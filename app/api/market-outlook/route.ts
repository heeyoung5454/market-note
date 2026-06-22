import {
  buildMarketOutlookPrompt,
  collectMarketOutlookInput,
} from "@/services/marketOutlook.service";
import { parseMarketOutlookResult } from "@/utils/marketOutlook";
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
    const input = await collectMarketOutlookInput();
    const { market, news } = buildMarketOutlookPrompt(input);

    const prompt = `당신은 한국 주식 전략 애널리스트입니다.

오늘 시장 상황과 뉴스들을 분석하여 단기 전망을 작성해주세요.

[시장 데이터]
${market}

[뉴스]
${news}

JSON 형식으로만 응답하세요.

{
  "tomorrow": "",
  "strongThemes": [],
  "watchStocks": [],
  "risks": [],
  "strategy": "",
  "summary": ""
}

규칙
- 투자 권유 표현 금지
- 객관적인 전망만 작성
- 모든 문장은 100자 이내`;

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
        { error: "AI 시장 전망을 생성하지 못했습니다." },
        { status: 502 }
      );
    }

    const result = parseMarketOutlookResult(text);

    if (!result.summary) {
      return NextResponse.json(
        { error: "AI 시장 전망 결과가 올바르지 않습니다." },
        { status: 502 }
      );
    }

    return NextResponse.json({ input, result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "시장 전망 생성 실패";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
