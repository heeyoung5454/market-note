export type StockDirection = "up" | "down" | "flat";

export const STOCK_UP_COLOR = "#F04452";
export const STOCK_DOWN_COLOR = "#3182F6";

export function getStockDirection(rate?: string): StockDirection {
  if (!rate) {
    return "flat";
  }

  const value = Number(rate);

  if (Number.isNaN(value)) {
    return "flat";
  }

  if (value > 0) {
    return "up";
  }

  if (value < 0) {
    return "down";
  }

  return "flat";
}

export function getStockDirectionClass(direction: StockDirection) {
  return `stock-direction--${direction}`;
}

export function formatChangeRate(rate?: string) {
  const direction = getStockDirection(rate);

  if (direction === "flat" && !rate) {
    return { text: "-", className: getStockDirectionClass("flat") };
  }

  const value = Number(rate);

  if (Number.isNaN(value)) {
    return { text: "-", className: getStockDirectionClass("flat") };
  }

  if (direction === "up") {
    return {
      text: `+${value.toFixed(2)}%`,
      className: getStockDirectionClass("up"),
    };
  }

  if (direction === "down") {
    return {
      text: `${value.toFixed(2)}%`,
      className: getStockDirectionClass("down"),
    };
  }

  return {
    text: "0.00%",
    className: getStockDirectionClass("flat"),
  };
}
