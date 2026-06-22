import {
  buildMarketSentimentPrompt,
  collectMarketSentimentInput,
} from "@/services/marketSentiment.service";
import { parseMarketSentimentResult } from "@/utils/marketSentiment";
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
    const input = await collectMarketSentimentInput();
    const data = buildMarketSentimentPrompt(input);

    const prompt = `당신은 시장 심리 분석 전문가입니다.

아래 데이터를 기반으로 오늘 시장 분위기를 분석해주세요.

${data}

JSON 형식으로만 응답하세요.

{
  "sentiment": "positive",
  "score": 74,
  "positiveFactors": [],
  "negativeFactors": [],
  "summary": ""
}

score는 0~100 사이 값입니다.`;

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
        { error: "AI 시장 심리 분석을 생성하지 못했습니다." },
        { status: 502 }
      );
    }

    const result = parseMarketSentimentResult(text);

    if (!result.summary) {
      return NextResponse.json(
        { error: "AI 시장 심리 분석 결과가 올바르지 않습니다." },
        { status: 502 }
      );
    }

    return NextResponse.json({ input, result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "시장 심리 분석 생성 실패";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
