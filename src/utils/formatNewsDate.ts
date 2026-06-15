export function formatNewsDate(pubDate: string, short = false) {
  const date = new Date(pubDate);
  if (Number.isNaN(date.getTime())) {
    return pubDate;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    ...(short ? {} : { year: "numeric" }),
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
