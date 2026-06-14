import {
  getInitialRankOptions,
} from "@/constants/rankOptions";
import type { RankType } from "@/types/rank.type";
import { create } from "zustand";

interface RankState {
  selected: RankType;
  options: Record<RankType, Record<string, string>>;
  setSelected: (type: RankType) => void;
  setOption: (type: RankType, paramKey: string, value: string) => void;
}

export const useRankStore = create<RankState>((set) => ({
  selected: "volume",
  options: getInitialRankOptions(),
  setSelected: (selected) => set({ selected }),
  setOption: (type, paramKey, value) =>
    set((state) => ({
      options: {
        ...state.options,
        [type]: {
          ...state.options[type],
          [paramKey]: value,
        },
      },
    })),
}));
