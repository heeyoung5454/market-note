export function formatChangeRate(rate?: string) {
  if (!rate) {
    return { text: "-", className: "text-neutral-400" };
  }

  const value = Number(rate);

  if (Number.isNaN(value)) {
    return { text: "-", className: "text-neutral-400" };
  }

  if (value > 0) {
    return {
      text: `+${value.toFixed(2)}%`,
      className: "font-semibold text-[#F04452]",
    };
  }

  if (value < 0) {
    return {
      text: `${value.toFixed(2)}%`,
      className: "font-semibold text-[#3182F6]",
    };
  }

  return {
    text: "0.00%",
    className: "text-neutral-400",
  };
}
