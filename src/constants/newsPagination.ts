export const NEWS_SIDEBAR_SIZE = 10;
export const NEWS_PAGE_SIZE = 20;
export const NAVER_NEWS_MAX_RESULTS = 1000;

export function getNewsTotalPages(total: number, pageSize: number) {
  const cappedTotal = Math.min(total, NAVER_NEWS_MAX_RESULTS);
  return Math.max(1, Math.ceil(cappedTotal / pageSize));
}

export function getNewsStart(page: number, pageSize: number) {
  return (page - 1) * pageSize + 1;
}
