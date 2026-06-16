"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import StockSearchModal from "./StockSearchModal";
import "./stock.css";

export default function StockSearchTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="stock-search-trigger"
        onClick={() => setOpen(true)}
        aria-label="종목 검색"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="stock-search-trigger__text">종목 검색</span>
      </button>

      <StockSearchModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
