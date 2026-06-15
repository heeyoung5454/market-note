"use client";

import NewsListItem from "@/components/stock/NewsListItem";
import NewsPagination from "@/components/stock/NewsPagination";
import {
  getNewsTotalPages,
  NEWS_PAGE_SIZE,
  NAVER_NEWS_MAX_RESULTS,
} from "@/constants/newsPagination";
import { useDailyChart } from "@/hooks/useDailyChart";
import { useStockNews } from "@/hooks/useStockNews";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import "./stock.css";

type StockNewsFullProps = {
  code: string;
  name?: string;
  page: number;
};

export default function StockNewsFull({ code, name, page }: StockNewsFullProps) {
  const router = useRouter();

  const { data: chartData } = useDailyChart(code, 1);
  const summary = chartData?.summary;
  const stockName = name ?? summary?.name;
  const changeRate = summary?.changeRate;
  const displayName = stockName ?? code;

  const { data, isLoading, error, isFetching } = useStockNews(stockName, {
    page,
    pageSize: NEWS_PAGE_SIZE,
  });

  const detailHref = (() => {
    const params = new URLSearchParams();
    if (stockName) {
      params.set("name", stockName);
    }
    const query = params.toString();
    return query ? `/stock/${code}?${query}` : `/stock/${code}`;
  })();

  const buildNewsUrl = (nextPage: number) => {
    const params = new URLSearchParams();
    if (stockName) {
      params.set("name", stockName);
    }
    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }
    const query = params.toString();
    return query ? `/stock/${code}/news?${query}` : `/stock/${code}/news`;
  };

  const handlePageChange = (nextPage: number) => {
    router.push(buildNewsUrl(nextPage));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!data || !stockName) {
      return;
    }

    const totalPages = getNewsTotalPages(data.total, NEWS_PAGE_SIZE);
    if (page > totalPages) {
      handlePageChange(totalPages);
    }
  }, [data, page, stockName]);

  return (
    <main className="stock-detail-page">
      <div className="stock-detail-page__inner stock-news-page__inner">
        <Link href={detailHref} className="stock-detail__back">
          <ArrowLeft className="h-4 w-4" />
          {displayName} 상세
        </Link>

        <header className="stock-news-page__header">
          <div>
            <h1 className="stock-news-page__title">{displayName} 관련 뉴스</h1>
            <p className="stock-news-page__subtitle">
              {data
                ? `${Math.min(data.total, NAVER_NEWS_MAX_RESULTS).toLocaleString()}건`
                : "검색 결과"}
              {data && data.total > NAVER_NEWS_MAX_RESULTS
                ? ` (최대 ${NAVER_NEWS_MAX_RESULTS.toLocaleString()}건까지 조회)`
                : ""}
            </p>
          </div>
        </header>

        {!stockName && (
          <div className="stock-news-page__state">종목명을 불러오는 중...</div>
        )}

        {stockName && isLoading && (
          <div className="stock-news-page__state">
            <span className="stock-detail__spinner" />
            뉴스를 불러오는 중...
          </div>
        )}

        {stockName && error && (
          <div className="stock-news-page__state stock-news-page__state--error">
            뉴스 조회에 실패했습니다.
          </div>
        )}

        {stockName && !isLoading && !error && data?.items.length === 0 && (
          <div className="stock-news-page__state">관련 뉴스가 없습니다.</div>
        )}

        {stockName && !error && data && data.items.length > 0 && (
          <>
            <ul
              className={`stock-news-page__list${
                isFetching ? " stock-news-page__list--loading" : ""
              }`}
            >
              {data.items.map((item) => (
                <NewsListItem
                  key={`${item.link}-${item.pubDate}`}
                  item={item}
                  stockName={stockName}
                  changeRate={changeRate}
                  variant="full"
                />
              ))}
            </ul>

            <NewsPagination
              page={page}
              total={data.total}
              pageSize={NEWS_PAGE_SIZE}
              onPageChange={handlePageChange}
              isLoading={isFetching}
            />
          </>
        )}
      </div>
    </main>
  );
}
