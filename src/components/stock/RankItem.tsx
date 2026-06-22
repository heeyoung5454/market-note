"use client";

import type { RankStock, RankType } from "@/types/rank.type";
import { formatChangeRate } from "@/utils/formatChangeRate";
import {
  formatMetricValue,
  formatNetTradeAmount,
  isInvestorRankType,
} from "@/utils/formatTradingValue";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RankItem({
  stock,
  rank,
  rankType,
}: {
  stock: RankStock;
  rank: number;
  rankType: RankType;
}) {
  const router = useRouter();
  const change = formatChangeRate(stock.changeRate);
  const metric = formatMetricValue(rankType, stock);
  const isInvestorTable = isInvestorRankType(rankType);

  const handleClick = () => {
    const params = new URLSearchParams({ name: stock.name });
    router.push(`/stock/${stock.code}?${params.toString()}`);
  };

  return (
    <tr className="stock-table__row--clickable" onClick={handleClick}>
      <td className="stock-table__cell--rank">
        <div className="stock-table__rank">
          <Heart
            className="h-[18px] w-[18px] shrink-0 fill-neutral-200 stroke-neutral-300"
            strokeWidth={1.5}
          />
          <span className="stock-table__rank-number">{rank}</span>
        </div>
      </td>

      <td className="stock-table__cell--name">
        <span className="stock-table__name">{stock.name}</span>
        <span className="stock-table__code">{stock.code}</span>
      </td>

      <td className="stock-table__cell--numeric">
        <span className={`stock-table__price ${change.className}`}>
          {Number(stock.price).toLocaleString()}원
        </span>
      </td>

      <td className="stock-table__cell--numeric">
        <span className={`stock-table__change ${change.className}`}>
          {change.text}
        </span>
      </td>

      {isInvestorTable ? (
        <>
          <td className="stock-table__cell--numeric">
            <span className="stock-table__metric stock-direction--up">
              {formatNetTradeAmount(stock.netBuyAmount)}
            </span>
          </td>
          <td className="stock-table__cell--numeric">
            <span className="stock-table__metric stock-direction--down">
              {formatNetTradeAmount(stock.netSellAmount)}
            </span>
          </td>
        </>
      ) : (
        <td className="stock-table__cell--numeric">
          <span className="stock-table__metric">{metric}</span>
        </td>
      )}
    </tr>
  );
}
