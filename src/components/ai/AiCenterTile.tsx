"use client";

import type { AiCenterItem } from "@/types/aiCenter.type";
import "./ai-center.css";

export default function AiCenterTile({
  item,
  onSelect,
}: {
  item: AiCenterItem;
  onSelect?: (id: AiCenterItem["id"]) => void;
}) {
  return (
    <button
      type="button"
      className="ai-center__tile"
      onClick={() => onSelect?.(item.id)}
      aria-label={item.description ?? item.label}
    >
      <span className="ai-center__tile-icon" aria-hidden="true">
        {item.icon}
      </span>
      <span className="ai-center__tile-label">{item.label}</span>
      {item.description ? (
        <span className="ai-center__tile-description">{item.description}</span>
      ) : null}
    </button>
  );
}
