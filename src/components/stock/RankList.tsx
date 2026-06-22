"use client";

import type { RankStock, RankType } from "@/types/rank.type";
import dayjs from "dayjs";
import RankFilters from "./RankFilters";
import RankItem from "./RankItem";
import {
  getMetricHeader,
  isInvestorRankType,
} from "@/utils/formatTradingValue";
import "./stock.css";

function RankTableBody({
  stocks,
  isLoading,
  error,
  rankType,
}: {
  stocks?: RankStock[];
  isLoading: boolean;
  error: Error | null;
  rankType: RankType;
}) {
  const columnCount = isInvestorRankType(rankType) ? 6 : 5;

  if (isLoading) {
    return (
      <tbody>
        <tr>
          <td colSpan={columnCount}>
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-neutral-400">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-500" />
              순위를 불러오는 중...
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (error) {
    return (
      <tbody>
        <tr>
          <td colSpan={columnCount}>
            <div className="flex items-center justify-center py-16 text-sm text-red-500">
              조회에 실패했습니다. 잠시 후 다시 시도해 주세요.
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (!stocks?.length) {
    return (
      <tbody>
        <tr>
          <td colSpan={columnCount}>
            <div className="flex items-center justify-center py-16 text-sm text-neutral-400">
              표시할 종목이 없습니다.
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {stocks.map((stock, index) => (
        <RankItem
          key={stock.code}
          stock={stock}
          rank={index + 1}
          rankType={rankType}
        />
      ))}
    </tbody>
  );
}

export default function RankList({
  stocks,
  isLoading,
  error,
  rankType,
}: {
  stocks?: RankStock[];
  isLoading: boolean;
  error: Error | null;
  rankType: RankType;
}) {
  const updatedAt = dayjs().format("HH:mm");
  const metricHeader = getMetricHeader(rankType);
  const isInvestorTable = isInvestorRankType(rankType);

  return (
    <div className="stock-table-wrap">
      <p className="stock-table__meta">오늘 {updatedAt} 기준</p>
      <RankFilters rankType={rankType} />

      <table className="stock-table">
        <colgroup>
          <col className="w-14" />
          <col />
          <col className="w-[5.5rem]" />
          <col className="w-[4.5rem]" />
          {isInvestorTable ? (
            <>
              <col className="w-[4.5rem]" />
              <col className="w-[4.5rem]" />
            </>
          ) : (
            <col className="w-[5.5rem]" />
          )}
        </colgroup>
        <thead>
          <tr>
            <th colSpan={2} className="stock-table__head--meta">
              순위
            </th>
            <th className="stock-table__head--numeric">현재가</th>
            <th className="stock-table__head--numeric">등락률</th>
            {isInvestorTable ? (
              <>
                <th className="stock-table__head--numeric">순매수</th>
                <th className="stock-table__head--numeric">순매도</th>
              </>
            ) : (
              <th className="stock-table__head--numeric">{metricHeader}</th>
            )}
          </tr>
        </thead>
        <RankTableBody
          stocks={stocks}
          isLoading={isLoading}
          error={error}
          rankType={rankType}
        />
      </table>
    </div>
  );
}
