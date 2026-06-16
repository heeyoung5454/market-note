"use client";

import { MessageSquare, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import "./stock.css";

type StockMemo = {
  id: string;
  stockName: string;
  stockCode: string;
  account?: string;
  averagePrice: number;
  quantity: number;
  createdAt: string;
};

type MemoForm = {
  stockName: string;
  stockCode: string;
  account: string;
  averagePrice: string;
  quantity: string;
};

type StockMemoQuote = {
  price?: number;
  isLoading?: boolean;
  error?: string;
};

const STOCK_MEMO_STORAGE_KEY = "market-note.stock-memos";

const INITIAL_FORM: MemoForm = {
  stockName: "",
  stockCode: "",
  account: "",
  averagePrice: "",
  quantity: "",
};

function readStoredMemos() {
  try {
    const raw = window.localStorage.getItem(STOCK_MEMO_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StockMemo[]) : [];
  } catch {
    return [];
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatReturnRate(rate: number) {
  const sign = rate > 0 ? "+" : "";
  return `${sign}${rate.toFixed(2)}%`;
}

function getMemoFormValidity(form: MemoForm) {
  const averagePrice = Number(form.averagePrice);
  const quantity = Number(form.quantity);

  return Boolean(
    form.stockName.trim() &&
      form.stockCode.trim() &&
      form.account.trim() &&
      Number.isFinite(averagePrice) &&
      averagePrice > 0 &&
      Number.isFinite(quantity) &&
      quantity > 0
  );
}

function memoToForm(memo: StockMemo): MemoForm {
  return {
    stockName: memo.stockName,
    stockCode: memo.stockCode,
    account: memo.account ?? "",
    averagePrice: String(memo.averagePrice),
    quantity: String(memo.quantity),
  };
}

export default function StockMemoWidget() {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [memos, setMemos] = useState<StockMemo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState<MemoForm>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MemoForm>(INITIAL_FORM);
  const [quotes, setQuotes] = useState<Record<string, StockMemoQuote>>({});
  const memoStockCodes = useMemo(
    () =>
      Array.from(
        new Set(
          memos
            .map((memo) => memo.stockCode.trim().toUpperCase())
            .filter(Boolean)
        )
      ),
    [memos]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMemos(readStoredMemos());
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    window.localStorage.setItem(STOCK_MEMO_STORAGE_KEY, JSON.stringify(memos));
  }, [loaded, memos]);

  useEffect(() => {
    if (!open || !loaded || memoStockCodes.length === 0) {
      return;
    }

    const controller = new AbortController();

    Promise.all(
      memoStockCodes.map(async (code) => {
        try {
          const response = await fetch(`/api/kis/stock/${code}`, {
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error("현재가 조회 실패");
          }

          const data = await response.json();
          const price = Number(data.price);

          if (!Number.isFinite(price) || price <= 0) {
            throw new Error("현재가 조회 실패");
          }

          return {
            code,
            quote: {
              price,
              isLoading: false,
            },
          };
        } catch (error) {
          if (controller.signal.aborted) {
            return null;
          }

          return {
            code,
            quote: {
              isLoading: false,
              error:
                error instanceof Error ? error.message : "현재가 조회 실패",
            },
          };
        }
      })
    ).then((results) => {
      if (controller.signal.aborted) {
        return;
      }

      setQuotes((prev) => {
        const next = { ...prev };

        for (const result of results) {
          if (result) {
            next[result.code] = result.quote;
          }
        }

        return next;
      });
    });

    return () => controller.abort();
  }, [loaded, memoStockCodes, open]);

  const averagePrice = Number(form.averagePrice);
  const quantity = Number(form.quantity);
  const canSave = getMemoFormValidity(form);
  const canUpdate = getMemoFormValidity(editForm);

  const handleChange =
    (field: keyof MemoForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleEditChange =
    (field: keyof MemoForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setEditForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSave) {
      return;
    }

    const nextMemo: StockMemo = {
      id: crypto.randomUUID(),
      stockName: form.stockName.trim(),
      stockCode: form.stockCode.trim().toUpperCase(),
      account: form.account.trim(),
      averagePrice,
      quantity,
      createdAt: new Date().toISOString(),
    };

    setMemos((prev) => [nextMemo, ...prev]);
    setForm(INITIAL_FORM);
  };

  const handleDelete = (id: string) => {
    setMemos((prev) => prev.filter((memo) => memo.id !== id));

    if (editingId === id) {
      handleEditCancel();
    }
  };

  const handleEditStart = (memo: StockMemo) => {
    setEditingId(memo.id);
    setEditForm(memoToForm(memo));
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm(INITIAL_FORM);
  };

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingId || !canUpdate) {
      return;
    }

    const nextAveragePrice = Number(editForm.averagePrice);
    const nextQuantity = Number(editForm.quantity);

    setMemos((prev) =>
      prev.map((memo) =>
        memo.id === editingId
          ? {
              ...memo,
              stockName: editForm.stockName.trim(),
              stockCode: editForm.stockCode.trim().toUpperCase(),
              account: editForm.account.trim(),
              averagePrice: nextAveragePrice,
              quantity: nextQuantity,
            }
          : memo
      )
    );
    handleEditCancel();
  };

  return (
    <div className="stock-memo">
      <button
        type="button"
        className="stock-memo__trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="메모 열기"
        aria-expanded={open}
      >
        <MessageSquare className="h-5 w-5" />
      </button>

      {open && (
        <section
          className="stock-memo__panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
        >
          <header className="stock-memo__header">
            <div>
              <h2 id={titleId} className="stock-memo__title">
                주식 메모
              </h2>
              <p className="stock-memo__subtitle">
                localStorage에 저장됩니다.
              </p>
            </div>
            <button
              type="button"
              className="stock-memo__close"
              onClick={() => setOpen(false)}
              aria-label="메모 닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="stock-memo__list">
            {memos.length === 0 ? (
              <p className="stock-memo__empty">저장된 메모가 없습니다.</p>
            ) : (
              memos.map((memo) => {
                const isEditing = editingId === memo.id;
                const quote = quotes[memo.stockCode.trim().toUpperCase()];
                const currentPrice = quote?.price;
                const returnRate =
                  currentPrice !== undefined
                    ? ((currentPrice - memo.averagePrice) / memo.averagePrice) *
                      100
                    : undefined;
                const profitColorClass =
                  returnRate === undefined || returnRate === 0
                    ? "stock-memo__return--neutral"
                    : returnRate > 0
                      ? "stock-memo__return--positive"
                      : "stock-memo__return--negative";

                return (
                  <article
                    key={memo.id}
                    className={`stock-memo__item ${
                      isEditing ? "stock-memo__item--editing" : ""
                    }`}
                  >
                    {isEditing ? (
                      <form
                        className="stock-memo__edit-form"
                        onSubmit={handleEditSubmit}
                      >
                        <label className="stock-memo__field">
                          <span>종목명</span>
                          <input
                            value={editForm.stockName}
                            onChange={handleEditChange("stockName")}
                            placeholder="삼성전자"
                          />
                        </label>
                        <label className="stock-memo__field">
                          <span>계좌(출처)</span>
                          <input
                            value={editForm.account}
                            onChange={handleEditChange("account")}
                            placeholder="키움증권 / ISA"
                          />
                        </label>
                        <label className="stock-memo__field">
                          <span>종목코드</span>
                          <input
                            value={editForm.stockCode}
                            onChange={handleEditChange("stockCode")}
                            placeholder="005930"
                            maxLength={6}
                          />
                        </label>
                        <label className="stock-memo__field">
                          <span>내 주식 평균가</span>
                          <input
                            type="number"
                            min="0"
                            inputMode="numeric"
                            value={editForm.averagePrice}
                            onChange={handleEditChange("averagePrice")}
                            placeholder="70000"
                          />
                        </label>
                        <label className="stock-memo__field">
                          <span>보유 수량</span>
                          <input
                            type="number"
                            min="0"
                            inputMode="numeric"
                            value={editForm.quantity}
                            onChange={handleEditChange("quantity")}
                            placeholder="10"
                          />
                        </label>
                        <div className="stock-memo__edit-actions">
                          <button
                            type="button"
                            className="stock-memo__edit-button stock-memo__edit-button--secondary"
                            onClick={handleEditCancel}
                          >
                            취소
                          </button>
                          <button
                            type="submit"
                            className="stock-memo__edit-button stock-memo__edit-button--primary"
                            disabled={!canUpdate}
                          >
                            저장
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="stock-memo__item-header">
                          <div>
                            <strong className="stock-memo__item-name">
                              {memo.stockName}
                            </strong>
                            <span className="stock-memo__item-code">
                              {memo.stockCode}
                              {memo.account ? ` · ${memo.account}` : ""}
                            </span>
                          </div>
                          <div className="stock-memo__item-actions">
                            <button
                              type="button"
                              className="stock-memo__icon-button"
                              onClick={() => handleEditStart(memo)}
                              aria-label={`${memo.stockName} 메모 수정`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              className="stock-memo__icon-button"
                              onClick={() => handleDelete(memo.id)}
                              aria-label={`${memo.stockName} 메모 삭제`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <dl className="stock-memo__metrics">
                          <div>
                            <dt>평균가</dt>
                            <dd>{formatNumber(memo.averagePrice)}원</dd>
                          </div>
                          <div>
                            <dt>현재가</dt>
                            <dd className={profitColorClass}>
                              {quote?.isLoading
                                ? "조회 중"
                                : currentPrice !== undefined
                                  ? `${formatNumber(currentPrice)}원`
                                  : "-"}
                            </dd>
                          </div>
                          <div>
                            <dt>수량</dt>
                            <dd>{formatNumber(memo.quantity)}주</dd>
                          </div>
                          <div>
                            <dt>수익률</dt>
                            <dd className={profitColorClass}>
                              {quote?.isLoading
                                ? "조회 중"
                                : returnRate !== undefined
                                  ? formatReturnRate(returnRate)
                                  : quote?.error
                                    ? "조회 실패"
                                    : "-"}
                            </dd>
                          </div>
                        </dl>
                      </>
                    )}
                  </article>
                );
              })
            )}
          </div>

          <form className="stock-memo__form" onSubmit={handleSubmit}>
            <div className="stock-memo__field-row">
              <label className="stock-memo__field">
                <span>종목명</span>
                <input
                  value={form.stockName}
                  onChange={handleChange("stockName")}
                  placeholder="삼성전자"
                />
              </label>
              <label className="stock-memo__field">
                <span>계좌(출처)</span>
                <input
                  value={form.account}
                  onChange={handleChange("account")}
                  placeholder="키움증권 / ISA"
                />
              </label>
            </div>
            <div className="stock-memo__field-row">
              <label className="stock-memo__field">
                <span>종목코드</span>
                <input
                  value={form.stockCode}
                  onChange={handleChange("stockCode")}
                  placeholder="005930"
                  maxLength={6}
                />
              </label>
              <label className="stock-memo__field">
                <span>내 주식 평균가</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={form.averagePrice}
                  onChange={handleChange("averagePrice")}
                  placeholder="70000"
                />
              </label>
              <label className="stock-memo__field">
                <span>보유 수량</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={form.quantity}
                  onChange={handleChange("quantity")}
                  placeholder="10"
                />
              </label>
            </div>
            <button
              type="submit"
              className="stock-memo__save"
              disabled={!canSave}
            >
              저장
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
