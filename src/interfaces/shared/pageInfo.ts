export interface PageInfo<T> {
  page: number;
  pageSize: number;
  hasMore: boolean;
  totalItems?: number;
  Items: T[];
}
