"use client";

import { useThemeAnalysis } from "@/hooks/useThemeAnalysis";
import type { ThemeAnalysisItem } from "@/types/themeAnalysis.type";
import {
  getThemeStrengthLabel,
} from "@/utils/themeAnalysis";
import "./theme-analysis.css";

function ThemeCard({ theme }: { theme: ThemeAnalysisItem }) {
  return (
    <article className={`theme-card theme-card--${theme.strength}`}>
      <div className="theme-card__header">
        <h3 className="theme-card__name">{theme.name}</h3>
        <span className={`theme-card__strength theme-card__strength--${theme.strength}`}>
          {getThemeStrengthLabel(theme.strength)}
        </span>
      </div>

      {theme.summary ? (
        <p className="theme-card__summary">{theme.summary}</p>
      ) : null}

      {theme.stocks.length > 0 ? (
        <div className="theme-card__stocks">
          {theme.stocks.map((stock) => (
            <span key={stock} className="theme-card__stock">
              {stock}
            </span>
          ))}
        </div>
      ) : null}

      {theme.reason ? (
        <p className="theme-card__reason">{theme.reason}</p>
      ) : null}
    </article>
  );
}

export default function ThemeAnalysisView() {
  const { data, isLoading, error } = useThemeAnalysis();

  if (isLoading) {
    return (
      <div className="theme-analysis-page__loading">
        <span className="theme-analysis-page__spinner" />
        <p>뉴스와 종목 데이터를 분석하는 중입니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="theme-analysis-page__error">
        <p>{error.message}</p>
      </div>
    );
  }

  if (!data?.result.themes.length) {
    return (
      <div className="theme-analysis-page__empty">
        <p>표시할 테마가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="theme-analysis-page__list">
      {data.result.themes.map((theme) => (
        <ThemeCard key={theme.name} theme={theme} />
      ))}
    </div>
  );
}
