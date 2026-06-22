"use client";

import {
  AI_CENTER_BRIEFING,
  AI_CENTER_GRID_ITEMS,
} from "@/constants/aiCenter";
import type { AiCenterItemId } from "@/types/aiCenter.type";
import AiCenterTile from "./AiCenterTile";
import "./ai-center.css";

export default function AiCenter({
  onSelectItem,
}: {
  onSelectItem?: (id: AiCenterItemId) => void;
}) {
  return (
    <section className="ai-center-section" aria-labelledby="ai-center-heading">
      <p id="ai-center-heading" className="ai-center-section__label">
        AI 투자 분석
      </p>

      <div className="ai-center">
        <div className="ai-center__header">
          <h2 className="ai-center__title">
            <span className="ai-center__title-icon" aria-hidden="true">
              🧠
            </span>
            AI 센터
          </h2>
        </div>

        <div className="ai-center__briefing">
          <button
            type="button"
            className="ai-center__briefing-button"
            onClick={() => onSelectItem?.(AI_CENTER_BRIEFING.id)}
          >
            {AI_CENTER_BRIEFING.label}
          </button>
        </div>

        <div className="ai-center__divider" aria-hidden="true" />

        <div className="ai-center__grid">
          {AI_CENTER_GRID_ITEMS.map((item) => (
            <AiCenterTile
              key={item.id}
              item={item}
              onSelect={onSelectItem}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
