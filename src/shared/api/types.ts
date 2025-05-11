/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * Sorting parameters
 */
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter parameters - generic for different entity types
 */
export interface FilterParams {
  [key: string]: string | number | boolean | Array<string | number> | null;
}

/**
 * API query parameters
 */
export interface QueryParams extends PaginationParams {
  sort?: SortParams;
  filter?: FilterParams;
  include?: string[];
} 