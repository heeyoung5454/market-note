import { getNewsTotalPages } from "@/constants/newsPagination";

type NewsPaginationProps = {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
};

function getVisiblePages(page: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, page]);

  for (let offset = -1; offset <= 1; offset += 1) {
    const value = page + offset;
    if (value > 1 && value < totalPages) {
      pages.add(value);
    }
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];

  sorted.forEach((value, index) => {
    const prev = sorted[index - 1];
    if (prev !== undefined && value - prev > 1) {
      result.push("ellipsis");
    }
    result.push(value);
  });

  return result;
}

export default function NewsPagination({
  page,
  total,
  pageSize,
  onPageChange,
  isLoading = false,
}: NewsPaginationProps) {
  const totalPages = getNewsTotalPages(total, pageSize);
  const visiblePages = getVisiblePages(page, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="news-pagination" aria-label="뉴스 페이지">
      <button
        type="button"
        className="news-pagination__button"
        disabled={page <= 1 || isLoading}
        onClick={() => onPageChange(page - 1)}
      >
        이전
      </button>

      <div className="news-pagination__pages">
        {visiblePages.map((value, index) =>
          value === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="news-pagination__ellipsis">
              …
            </span>
          ) : (
            <button
              key={value}
              type="button"
              className={`news-pagination__page${
                value === page ? " news-pagination__page--active" : ""
              }`}
              disabled={isLoading}
              aria-current={value === page ? "page" : undefined}
              onClick={() => onPageChange(value)}
            >
              {value}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="news-pagination__button"
        disabled={page >= totalPages || isLoading}
        onClick={() => onPageChange(page + 1)}
      >
        다음
      </button>
    </nav>
  );
}
