import { create } from "zustand";

interface WatchlistState {
  symbols: string[];
  addSymbol: (symbol: string) => void;
}

export const useWatchlistStore = create<WatchlistState>((set) => ({
  symbols: [],
  addSymbol: (symbol) =>
    set((state) => ({
      symbols: [...state.symbols, symbol],
    })),
}));