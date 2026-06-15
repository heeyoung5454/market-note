export type NewsItem = {
  title: string;
  description: string;
  link: string;
  originallink: string;
  pubDate: string;
};

export type NewsSearchResponse = {
  total: number;
  start: number;
  display: number;
  items: NewsItem[];
};
