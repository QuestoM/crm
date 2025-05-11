/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
  };
}

/**
 * Query parameters for API requests
 */
export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, any>;
  [key: string]: any;
}

/**
 * API client interface
 */
export interface ApiClient {
  get: <T>(url: string, params?: QueryParams) => Promise<ApiResponse<T>>;
  post: <T>(url: string, data: any) => Promise<ApiResponse<T>>;
  put: <T>(url: string, data: any) => Promise<ApiResponse<T>>;
  patch: <T>(url: string, data: any) => Promise<ApiResponse<T>>;
  delete: <T>(url: string) => Promise<ApiResponse<T>>;
} 