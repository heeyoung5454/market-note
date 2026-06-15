import {
  getStockDirection,
  getStockDirectionClass,
} from "@/utils/formatChangeRate";

type HighlightStockTextProps = {
  text: string;
  stockName?: string;
  changeRate?: string;
};

export default function HighlightStockText({
  text,
  stockName,
  changeRate,
}: HighlightStockTextProps) {
  if (!stockName) {
    return <>{text}</>;
  }

  const direction = getStockDirection(changeRate);
  const className = getStockDirectionClass(direction);
  const escaped = stockName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "g"));

  return (
    <>
      {parts.map((part, index) =>
        part === stockName ? (
          <span key={index} className={className}>
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}
