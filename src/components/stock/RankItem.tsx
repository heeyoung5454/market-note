import type { RankStock } from "@/types/rank.type";
import { formatChangeRate } from "@/utils/formatChangeRate";

const RANK_STYLE: Record<number, string> = {
  1: "bg-amber-400 text-white",
  2: "bg-neutral-400 text-white",
  3: "bg-amber-700 text-white",
};

export default function RankItem({
  stock,
  rank,
}: {
  stock: RankStock;
  rank: number;
}) {
  const change = formatChangeRate(stock.changeRate);
  const rankStyle = RANK_STYLE[rank] ?? "bg-neutral-100 text-neutral-500";

  return (
    <tr className="border-b border-neutral-100 transition-colors last:border-b-0 hover:bg-neutral-50">
      <td className="align-middle py-3">
        <div className="flex items-center justify-center">
          <span
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${rankStyle}`}
          >
            {rank}
          </span>
        </div>
      </td>

      <td className="align-middle px-3 py-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-sm font-semibold text-neutral-900">
            {stock.name}
          </span>
          <span className="shrink-0 text-xs text-neutral-400">
            ({stock.code})
          </span>
        </div>
      </td>

      <td className="align-middle py-3">
        <div className="flex items-center justify-center text-sm font-semibold tabular-nums text-neutral-900">
          {Number(stock.price).toLocaleString()}
        </div>
      </td>

      <td className="align-middle py-3">
        <div
          className={`flex items-center justify-center text-sm tabular-nums ${change.className}`}
        >
          {change.text}
        </div>
      </td>
    </tr>
  );
}
