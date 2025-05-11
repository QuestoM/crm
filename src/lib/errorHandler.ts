/**
 * Basic error handler for API functions
 */
export const errorHandler = {
  /**
   * Handle API errors
   */
  handleError: (error: any, message: string = 'An error occurred') => {
    console.error(message, error);
    return {
      success: false,
      error: {
        message: error?.message || message,
        code: error?.code || 'unknown_error'
      }
    };
  },

  /**
   * Create a success response
   */
  createSuccessResponse: <T>(data: T) => {
    return {
      success: true,
      data
    };
  }
};

/**
 * Handle API errors and return a structured response
 */
export const handleApiError = (error: any, message: string = 'An error occurred') => {
  console.error(message, error);
  return {
    success: false,
    error: {
      message: error?.message || message,
      code: error?.code || 'unknown_error'
    }
  };
};

export default errorHandler; 