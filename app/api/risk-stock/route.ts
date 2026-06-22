import {
  buildRiskStockPrompt,
  collectRiskStockInput,
} from "@/services/riskStock.service";
import { parseRiskStockResult } from "@/utils/riskStock";
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
    const input = await collectRiskStockInput();
    const { news, stocks } = buildRiskStockPrompt(input);

    const prompt = `당신은 리스크 분석 전문가입니다.

아래 데이터를 분석하여 변동성이 높거나 과열 가능성이 있는 종목을 찾아주세요.

[뉴스]
${news}

[종목 데이터]
${stocks}

JSON 형식으로만 응답하세요.

{
  "riskStocks": [
    {
      "name": "",
      "riskLevel": "high",
      "reason": "",
      "warnings": []
    }
  ]
}

최대 10개 종목만 반환하세요.`;

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
        { error: "AI 위험 종목 분석을 생성하지 못했습니다." },
        { status: 502 }
      );
    }

    const result = parseRiskStockResult(text);

    if (!result.riskStocks.length) {
      return NextResponse.json(
        { error: "AI 위험 종목 분석 결과가 올바르지 않습니다." },
        { status: 502 }
      );
    }

    return NextResponse.json({ input, result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "위험 종목 분석 생성 실패";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
