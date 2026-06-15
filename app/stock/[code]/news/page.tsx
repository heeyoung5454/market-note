"use client";

import StockNewsFull from "@/components/stock/StockNewsFull";
import { use } from "react";

export default function StockNewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ name?: string; page?: string }>;
}) {
  const { code } = use(params);
  const { name, page: pageParam } = use(searchParams);
  const page = Math.max(1, Number(pageParam ?? 1) || 1);

  return <StockNewsFull code={code} name={name} page={page} />;
}
