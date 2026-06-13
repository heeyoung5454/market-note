"use client";

import ItemDetail from "@/components/stock/itemDetail";
import { use } from "react";

export default function StockDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { code } = use(params);
  const { name } = use(searchParams);

  return <ItemDetail code={code} name={name} />;
}
