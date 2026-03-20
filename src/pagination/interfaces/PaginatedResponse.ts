export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}
