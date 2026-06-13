"use client";

import type { RankStock } from "@/types/rank.type";
import RankItem from "./RankItem";

export default function RankList({
  stocks,
  isLoading,
  error,
}: {
  stocks?: RankStock[];
  isLoading: boolean;
  error: Error | null;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-neutral-400">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-500" />
        순위를 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-red-500">
        조회에 실패했습니다. 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  if (!stocks?.length) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-neutral-400">
        표시할 종목이 없습니다.
      </div>
    );
  }

  return (
    <table className="w-full border-collapse">
      <colgroup>
        <col style={{ width: "4rem" }} />
        <col />
        <col style={{ width: "6.5rem" }} />
        <col style={{ width: "5.5rem" }} />
      </colgroup>
      <thead className="sticky top-0 z-10 bg-neutral-50">
        <tr className="border-b border-neutral-200 text-xs font-medium text-neutral-400">
          <th className="align-middle py-2.5 font-medium">
            <div className="flex items-center justify-center">순위</div>
          </th>
          <th className="align-middle px-3 py-2.5 text-left font-medium">
            종목
          </th>
          <th className="align-middle py-2.5 font-medium">
            <div className="flex items-center justify-center">현재가</div>
          </th>
          <th className="align-middle py-2.5 font-medium">
            <div className="flex items-center justify-center">등락률</div>
          </th>
        </tr>
      </thead>
      <tbody>
        {stocks.map((stock, index) => (
          <RankItem key={stock.code} stock={stock} rank={index + 1} />
        ))}
      </tbody>
    </table>
  );
}
