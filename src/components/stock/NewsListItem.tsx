import HighlightStockText from "@/components/stock/HighlightStockText";
import type { NewsItem } from "@/types/news.type";
import { formatNewsDate } from "@/utils/formatNewsDate";
import { ExternalLink } from "lucide-react";

type NewsListItemProps = {
  item: NewsItem;
  stockName?: string;
  changeRate?: string;
  variant?: "compact" | "full";
};

export default function NewsListItem({
  item,
  stockName,
  changeRate,
  variant = "compact",
}: NewsListItemProps) {
  const name = stockName ?? "";

  return (
    <li
      className={
        variant === "full"
          ? "stock-news-page__item"
          : "stock-detail__news-item"
      }
    >
      <a
        href={item.originallink || item.link}
        target="_blank"
        rel="noopener noreferrer"
        className={
          variant === "full"
            ? "stock-news-page__link"
            : "stock-detail__news-link"
        }
      >
        <p
          className={
            variant === "full"
              ? "stock-news-page__item-title"
              : "stock-detail__news-item-title"
          }
        >
          <HighlightStockText
            text={item.title}
            stockName={name}
            changeRate={changeRate}
          />
        </p>
        <p
          className={
            variant === "full"
              ? "stock-news-page__item-desc"
              : "stock-detail__news-item-desc"
          }
        >
          <HighlightStockText
            text={item.description}
            stockName={name}
            changeRate={changeRate}
          />
        </p>
        <div
          className={
            variant === "full"
              ? "stock-news-page__item-meta"
              : "stock-detail__news-item-meta"
          }
        >
          <time dateTime={item.pubDate}>
            {formatNewsDate(item.pubDate, variant === "compact")}
          </time>
          <ExternalLink
            className={
              variant === "full"
                ? "stock-news-page__icon"
                : "stock-detail__news-icon"
            }
            aria-hidden
          />
        </div>
      </a>
    </li>
  );
}
