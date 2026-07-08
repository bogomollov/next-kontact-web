const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));

  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function paginate<T>(data: T[], total: number, { page, limit }: PaginationParams) {
  return { data, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
