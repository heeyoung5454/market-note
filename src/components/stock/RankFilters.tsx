"use client";

import { RANK_OPTION_DEFS } from "@/constants/rankOptions";
import { useRankStore } from "@/store/useRankStore";
import type { RankType } from "@/types/rank.type";
import "./stock.css";

export default function RankFilters({ rankType }: { rankType: RankType }) {
  const { options, setOption } = useRankStore();
  const filters = RANK_OPTION_DEFS[rankType];
  const selectedOptions = options[rankType];

  return (
    <div className="stock-filters">
      {filters.map((filter) => (
        <label key={filter.paramKey} className="stock-filters__item">
          <span className="stock-filters__label">{filter.label}</span>
          <select
            className="stock-filters__select"
            value={selectedOptions[filter.paramKey] ?? filter.defaultValue}
            onChange={(event) =>
              setOption(rankType, filter.paramKey, event.target.value)
            }
            aria-label={filter.label}
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
