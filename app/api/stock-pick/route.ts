import {
  buildStockPickPrompt,
  collectStockPickInput,
} from "@/services/stockPick.service";
import { parseStockPickResult } from "@/utils/stockPick";
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
    const input = await collectStockPickInput();
    const { news, stocks } = buildStockPickPrompt(input);

    const prompt = `당신은 한국 주식 퀀트 애널리스트입니다.

아래 종목 데이터를 분석하여 관심 종목을 선정하세요.

[뉴스]
${news}

[종목 데이터]
${stocks}

JSON 형식으로만 응답하세요.

{
  "stocks": [
    {
      "name": "",
      "score": 0,
      "reason": "",
      "positiveFactors": [],
      "riskFactors": []
    }
  ]
}

최대 20개 종목만 반환하세요.
점수는 100점 만점입니다.`;

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
        { error: "AI 관심 종목 분석을 생성하지 못했습니다." },
        { status: 502 }
      );
    }

    const result = parseStockPickResult(text);

    if (!result.stocks.length) {
      return NextResponse.json(
        { error: "AI 관심 종목 분석 결과가 올바르지 않습니다." },
        { status: 502 }
      );
    }

    return NextResponse.json({ input, result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "관심 종목 분석 생성 실패";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
