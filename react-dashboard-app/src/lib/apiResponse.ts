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
 * Create a successful API response
 */
export function createSuccessResponse<T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  message: string, 
  code?: string, 
  details?: any
): ApiResponse {
  return {
    success: false,
    error: {
      message,
      ...(code ? { code } : {}),
      ...(details ? { details } : {}),
    },
  };
} 