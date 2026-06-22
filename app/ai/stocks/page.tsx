import StockPickView from "@/components/ai/StockPickView";
import Link from "next/link";
import "@/components/ai/market-briefing.css";

export default function StockPickPage() {
  return (
    <main className="market-briefing-page">
      <div className="market-briefing-page__inner">
        <Link href="/" className="market-briefing-page__back">
          ← 홈으로
        </Link>

        <header className="market-briefing-page__header">
          <p className="market-briefing-page__eyebrow">AI 센터</p>
          <h1 className="market-briefing-page__title">관심 종목</h1>
        </header>

        <StockPickView />
      </div>
    </main>
  );
}
