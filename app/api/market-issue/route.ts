import {
  buildMarketIssuePrompt,
  collectMarketIssueInput,
} from "@/services/marketIssue.service";
import { parseMarketIssueResult } from "@/utils/marketIssue";
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
    const input = await collectMarketIssueInput();
    const news = buildMarketIssuePrompt(input);

    const prompt = `당신은 한국 증시 뉴스 분석 전문가입니다.

아래 뉴스들을 분석하여 오늘 시장에서 중요한 이슈를 추출해주세요.

${news}

JSON 형식으로만 응답하세요.

{
  "issues": [
    {
      "title": "",
      "summary": "",
      "impact": "positive",
      "relatedThemes": [],
      "relatedStocks": []
    }
  ]
}

비슷한 뉴스는 하나로 묶고 최대 10개까지만 반환하세요.`;

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
        { error: "AI 이슈 분석을 생성하지 못했습니다." },
        { status: 502 }
      );
    }

    const result = parseMarketIssueResult(text);

    if (!result.issues.length) {
      return NextResponse.json(
        { error: "AI 이슈 분석 결과가 올바르지 않습니다." },
        { status: 502 }
      );
    }

    return NextResponse.json({ input, result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "이슈 분석 생성 실패";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
