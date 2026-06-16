"use client";

import { useStockSearch } from "@/hooks/useStockSearch";
import type { StockSearchResult } from "@/types/stock.type";
import { formatChangeRate } from "@/utils/formatChangeRate";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import "./stock.css";

type StockSearchModalProps = {
  open: boolean;
  onClose: () => void;
};

function getMinQueryLength(query: string) {
  return /^[0-9A-Za-z]+$/.test(query) ? 1 : 2;
}

export default function StockSearchModal({
  open,
  onClose,
}: StockSearchModalProps) {
  const router = useRouter();
  const titleId = useId();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const submittedMinLength = getMinQueryLength(submittedQuery);
  const { data, isLoading, error, isFetching } = useStockSearch(
    submittedQuery,
    open && submittedQuery.length >= submittedMinLength
  );

  const handleClose = useCallback(() => {
    setQuery("");
    setSubmittedQuery("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleClose]);

  const handleSelect = (stock: StockSearchResult) => {
    const params = new URLSearchParams({ name: stock.name });
    router.push(`/stock/${stock.code}?${params.toString()}`);
    handleClose();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(query.trim());
  };

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setSubmittedQuery("");
  };

  if (!open) {
    return null;
  }

  const trimmedQuery = query.trim();
  const minLength = getMinQueryLength(trimmedQuery);
  const showMinLengthHint =
    trimmedQuery.length > 0 && trimmedQuery.length < minLength;
  const isSearching =
    (isLoading || isFetching) && submittedQuery.length >= submittedMinLength;

  return (
    <div
      className="stock-search-modal"
      role="presentation"
      onClick={handleClose}
    >
      <div
        className="stock-search-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="stock-search-modal__header">
          <h2 id={titleId} className="stock-search-modal__title">
            종목 검색
          </h2>
          <button
            type="button"
            className="stock-search-modal__close"
            onClick={handleClose}
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="stock-search-modal__form" onSubmit={handleSubmit}>
          <div className="stock-search-modal__input-wrap">
            <Search className="stock-search-modal__input-icon" />
            <input
              type="search"
              value={query}
              onChange={handleQueryChange}
              placeholder="종목코드 또는 종목명 입력"
              className="stock-search-modal__input"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="stock-search-modal__submit"
            disabled={trimmedQuery.length < minLength || isSearching}
          >
            검색
          </button>
        </form>

        <div className="stock-search-modal__body">
          {!trimmedQuery && (
            <p className="stock-search-modal__hint">
              전체 상장 종목에서 종목코드 또는 종목명으로 검색할 수 있습니다.
            </p>
          )}

          {showMinLengthHint && (
            <p className="stock-search-modal__hint">
              {minLength === 1
                ? "검색어를 입력해 주세요."
                : "2글자 이상 입력해 주세요."}
            </p>
          )}

          {isSearching && (
            <div className="stock-search-modal__state">
              <span className="stock-search-modal__spinner" />
              검색 중...
            </div>
          )}

          {error && submittedQuery.length >= submittedMinLength && (
            <p className="stock-search-modal__state stock-search-modal__state--error">
              {error.message}
            </p>
          )}

          {!isSearching &&
            !error &&
            submittedQuery.length >= submittedMinLength &&
            data?.length === 0 && (
              <p className="stock-search-modal__state">
                검색 결과가 없습니다.
              </p>
            )}

          {!isSearching &&
            submittedQuery.length >= submittedMinLength &&
            !!data?.length && (
              <ul className="stock-search-modal__results">
                {data.map((stock) => {
                  const change = formatChangeRate(
                    stock.changeRate !== undefined
                      ? String(stock.changeRate)
                      : undefined
                  );
                  const hasPrice = stock.price !== undefined && stock.price > 0;

                  return (
                    <li key={stock.code}>
                      <button
                        type="button"
                        className="stock-search-modal__result"
                        onClick={() => handleSelect(stock)}
                      >
                        <div className="stock-search-modal__result-main">
                          <span className="stock-search-modal__result-name">
                            {stock.name}
                          </span>
                          <span className="stock-search-modal__result-code">
                            {stock.code}
                            {stock.market ? ` · ${stock.market}` : ""}
                          </span>
                        </div>
                        {hasPrice && (
                          <div className="stock-search-modal__result-meta">
                            <span className="stock-search-modal__result-price">
                              {stock.price!.toLocaleString()}원
                            </span>
                            {stock.changeRate !== undefined && (
                              <span
                                className={`stock-search-modal__result-change ${change.className}`}
                              >
                                {change.text}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
        </div>
      </div>
    </div>
  );
}
