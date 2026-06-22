"use client";

import { useMarketIssue } from "@/hooks/useMarketIssue";
import type { MarketIssueItem } from "@/types/marketIssue.type";
import { getIssueImpactLabel } from "@/utils/marketIssue";
import "./market-issue.css";

function TagSection({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "theme" | "stock";
}) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="market-issue-card__section">
      <p className="market-issue-card__section-title">{title}</p>
      <div className="market-issue-card__tags">
        {items.map((item) => (
          <span
            key={item}
            className={`market-issue-card__tag market-issue-card__tag--${tone}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function IssueCard({ issue }: { issue: MarketIssueItem }) {
  return (
    <article className={`market-issue-card market-issue-card--${issue.impact}`}>
      <div className="market-issue-card__header">
        <h3 className="market-issue-card__title">{issue.title}</h3>
        <span
          className={`market-issue-card__impact market-issue-card__impact--${issue.impact}`}
        >
          {getIssueImpactLabel(issue.impact)}
        </span>
      </div>

      {issue.summary ? (
        <p className="market-issue-card__summary">{issue.summary}</p>
      ) : null}

      <TagSection title="관련 테마" items={issue.relatedThemes} tone="theme" />
      <TagSection title="관련 종목" items={issue.relatedStocks} tone="stock" />
    </article>
  );
}

export default function MarketIssueView() {
  const { data, isLoading, error } = useMarketIssue();

  if (isLoading) {
    return (
      <div className="market-issue-page__loading">
        <span className="market-issue-page__spinner" />
        <p>뉴스를 분석하는 중입니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="market-issue-page__error">
        <p>{error.message}</p>
      </div>
    );
  }

  if (!data?.result.issues.length) {
    return (
      <div className="market-issue-page__empty">
        <p>표시할 이슈가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="market-issue-page__list">
      {data.result.issues.map((issue) => (
        <IssueCard key={issue.title} issue={issue} />
      ))}
    </div>
  );
}
