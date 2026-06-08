import { create } from "zustand";

type RankType =
  | "volume"
  | "rise"
  | "amount";

interface RankState {
  selected: RankType;
  setSelected: (type: RankType) => void;
}

export const useRankStore =
  create<RankState>((set) => ({
    selected: "volume",
    setSelected: (selected) =>
      set({ selected }),
  }));