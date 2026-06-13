import type { RankStock, RankType } from "@/types/rank.type";
import { formatChangeRate } from "@/utils/formatChangeRate";
import { formatMetricValue } from "@/utils/formatTradingValue";
import { Heart } from "lucide-react";

export default function RankItem({
  stock,
  rank,
  rankType,
}: {
  stock: RankStock;
  rank: number;
  rankType: RankType;
}) {
  const change = formatChangeRate(stock.changeRate);
  const metric = formatMetricValue(rankType, stock);

  return (
    <tr>
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
      </td>

      <td className="stock-table__cell--numeric">
        <span className="stock-table__price">
          {Number(stock.price).toLocaleString()}원
        </span>
      </td>

      <td className="stock-table__cell--numeric">
        <span className={`stock-table__change ${change.className}`}>
          {change.text}
        </span>
      </td>

      <td className="stock-table__cell--numeric">
        <span className="stock-table__metric">{metric}</span>
      </td>
    </tr>
  );
}
