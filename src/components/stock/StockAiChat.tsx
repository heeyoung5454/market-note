"use client";

import { useAnimatedValue } from "@/hooks/useAnimatedValue";
import { useNewsSummary } from "@/hooks/useNewsSummary";
import { useSequentialTyping } from "@/hooks/useSequentialTyping";
import { getRiskLabel } from "@/utils/newsSummary";
import { Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

type StockAiChatProps = {
  stockName?: string;
};

const SUMMARY_LABELS = ["핵심 이슈", "주가 영향", "투자 포인트"];

export default function StockAiChat({ stockName }: StockAiChatProps) {
  const [open, setOpen] = useState(false);
  const [animateBars, setAnimateBars] = useState(false);

  const { data, isLoading, error, hasNews } = useNewsSummary(
    stockName,
    open
  );

  const points = data?.points ?? [];
  const recommendationPercent = data?.recommendationPercent ?? 0;
  const riskPercent = data?.riskPercent ?? 0;
  const riskLabel = getRiskLabel(riskPercent);

  const showContent = open && !isLoading && !error && points.length > 0;

  const animatedRecommend = useAnimatedValue(
    recommendationPercent,
    showContent
  );
  const animatedRisk = useAnimatedValue(riskPercent, showContent);

  const { typedLines, typingIndex } = useSequentialTyping(
    points,
    showContent
  );

  useEffect(() => {
    if (!showContent) {
      setAnimateBars(false);
      return;
    }

    setAnimateBars(false);
    const frame = requestAnimationFrame(() => setAnimateBars(true));
    return () => cancelAnimationFrame(frame);
  }, [showContent, data]);

  return (
    <>
      <button
        type="button"
        className={`ai-chat-fab${open ? " ai-chat-fab--hidden" : ""}`}
        onClick={() => setOpen(true)}
        aria-label="AI 뉴스 요약 열기"
      >
        <Sparkles className="ai-chat-fab__icon" aria-hidden />
        <span className="ai-chat-fab__label">AI 요약</span>
      </button>

      {open && (
        <div className="ai-chat-panel" role="dialog" aria-label="AI 뉴스 요약">
          <header className="ai-chat-panel__header">
            <div className="ai-chat-panel__header-title">
              <Sparkles className="ai-chat-panel__header-icon" aria-hidden />
              <span>AI 뉴스 요약</span>
            </div>
            <button
              type="button"
              className="ai-chat-panel__close"
              onClick={() => setOpen(false)}
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="ai-chat-panel__body">
            {!stockName && (
              <p className="ai-chat-panel__message ai-chat-panel__message--system">
                종목 정보를 불러오는 중...
              </p>
            )}

            {stockName && isLoading && (
              <div className="ai-chat-panel__loading">
                <span className="stock-detail__spinner" />
                <p>뉴스 수집 및 AI 요약 생성 중...</p>
              </div>
            )}

            {stockName && !isLoading && error && (
              <p className="ai-chat-panel__message ai-chat-panel__message--error">
                AI 요약을 불러오지 못했습니다.
              </p>
            )}

            {stockName && !isLoading && !error && !hasNews && (
              <p className="ai-chat-panel__message ai-chat-panel__message--system">
                요약할 관련 뉴스가 없습니다.
              </p>
            )}

            {showContent && (
              <>
                <div className="ai-chat-panel__bubble ai-chat-panel__bubble--metrics">
                  <div className="ai-chat-panel__metrics">
                    <div className="ai-chat-panel__metric">
                      <div className="ai-chat-panel__metric-header">
                        <span>투자 추천</span>
                        <strong>{animatedRecommend}%</strong>
                      </div>
                      <div className="ai-chat-panel__metric-bar">
                        <div
                          className="ai-chat-panel__metric-fill ai-chat-panel__metric-fill--recommend"
                          style={{
                            width: animateBars
                              ? `${recommendationPercent}%`
                              : "0%",
                          }}
                        />
                      </div>
                    </div>

                    <div className="ai-chat-panel__metric">
                      <div className="ai-chat-panel__metric-header">
                        <span>투자 위험도</span>
                        <strong>
                          {animatedRisk}%{" "}
                          <em>{riskLabel}</em>
                        </strong>
                      </div>
                      <div className="ai-chat-panel__metric-bar">
                        <div
                          className="ai-chat-panel__metric-fill ai-chat-panel__metric-fill--risk"
                          style={{
                            width: animateBars ? `${riskPercent}%` : "0%",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {typedLines.map((line, index) => {
                  if (!line && typingIndex < index) {
                    return null;
                  }

                  return (
                    <div
                      key={index}
                      className="ai-chat-panel__bubble ai-chat-panel__bubble--text"
                    >
                      {SUMMARY_LABELS[index] && (
                        <span className="ai-chat-panel__label">
                          {SUMMARY_LABELS[index]}
                        </span>
                      )}
                      <p className="ai-chat-panel__text">
                        {line}
                        {typingIndex === index && (
                          <span className="ai-chat-panel__cursor" aria-hidden>
                            |
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <footer className="ai-chat-panel__footer">
            네이버 뉴스 기반 AI 생성 요약이며 투자 권유가 아닙니다.
          </footer>
        </div>
      )}
    </>
  );
}
