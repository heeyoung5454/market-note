"use client";

import NewsListItem from "@/components/stock/NewsListItem";
import { NEWS_SIDEBAR_SIZE } from "@/constants/newsPagination";
import { useStockNews } from "@/hooks/useStockNews";
import Link from "next/link";

type StockNewsListProps = {
  code: string;
  query?: string;
  stockName?: string;
  changeRate?: string;
};

export default function StockNewsList({
  code,
  query,
  stockName,
  changeRate,
}: StockNewsListProps) {
  const { data, isLoading, error } = useStockNews(query, {
    pageSize: NEWS_SIDEBAR_SIZE,
  });

  const moreHref = (() => {
    const params = new URLSearchParams();
    if (stockName ?? query) {
      params.set("name", stockName ?? query ?? "");
    }
    const search = params.toString();
    return search
      ? `/stock/${code}/news?${search}`
      : `/stock/${code}/news`;
  })();

  return (
    <aside className="stock-detail__news">
      <div className="stock-detail__news-header">
        <div className="stock-detail__news-header-left">
          <p className="stock-detail__news-title">관련 뉴스</p>
          {data && (
            <span className="stock-detail__news-count">
              {data.total.toLocaleString()}건
            </span>
          )}
        </div>
        {query && (
          <Link href={moreHref} className="stock-detail__news-more">
            더보기
          </Link>
        )}
      </div>

      {!query && (
        <div className="stock-detail__news-state">
          종목명을 불러오는 중...
        </div>
      )}

      {query && isLoading && (
        <div className="stock-detail__news-state">
          <span className="stock-detail__spinner" />
          뉴스를 불러오는 중...
        </div>
      )}

      {query && error && (
        <div className="stock-detail__news-state stock-detail__news-state--error">
          뉴스 조회에 실패했습니다.
        </div>
      )}

      {query && !isLoading && !error && data?.items.length === 0 && (
        <div className="stock-detail__news-state">
          관련 뉴스가 없습니다.
        </div>
      )}

      {query && !isLoading && !error && data && data.items.length > 0 && (
        <ul className="stock-detail__news-list">
          {data.items.map((item) => (
            <NewsListItem
              key={`${item.link}-${item.pubDate}`}
              item={item}
              stockName={stockName ?? query}
              changeRate={changeRate}
            />
          ))}
        </ul>
      )}
    </aside>
  );
}
