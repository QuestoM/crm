/**
 * Common response interface for all API services
 */
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Helper function to create a success response
 */
export function createSuccessResponse<T>(data: T): ServiceResponse<T> {
  return {
    success: true,
    data
  };
}

/**
 * Helper function to create an error response
 */
export function createErrorResponse(code: string, message: string, details?: any): ServiceResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details
    }
  };
} 