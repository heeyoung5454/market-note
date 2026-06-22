import MarketSentimentView from "@/components/ai/MarketSentimentView";
import Link from "next/link";
import "@/components/ai/market-briefing.css";

export default function MarketSentimentPage() {
  return (
    <main className="market-briefing-page">
      <div className="market-briefing-page__inner">
        <Link href="/" className="market-briefing-page__back">
          ← 홈으로
        </Link>

        <header className="market-briefing-page__header">
          <p className="market-briefing-page__eyebrow">AI 센터</p>
          <h1 className="market-briefing-page__title">시장 심리</h1>
        </header>

        <MarketSentimentView />
      </div>
    </main>
  );
}
