import { ApiResponse, createErrorResponse } from './apiResponse';
import {
  AppError,
  DocumentNotFoundError,
  InventoryItemNotFoundError,
  ValidationError,
  WarrantyNotFoundError,
  WarrantyClaimNotFoundError,
  UnauthorizedError,
} from './errors';

/**
 * Handle API errors and return a standardized response
 */
export function handleApiError(error: unknown): ApiResponse {
  console.error('API Error:', error);

  // Handle specific application errors
  if (error instanceof AppError) {
    // Map specific error types to appropriate status codes/responses
    if (
      error instanceof DocumentNotFoundError ||
      error instanceof InventoryItemNotFoundError ||
      error instanceof WarrantyNotFoundError ||
      error instanceof WarrantyClaimNotFoundError
    ) {
      return createErrorResponse(error.message, 'NOT_FOUND');
    }

    if (error instanceof ValidationError) {
      return createErrorResponse(error.message, 'VALIDATION_ERROR', error.errors);
    }

    if (error instanceof UnauthorizedError) {
      return createErrorResponse(error.message, 'UNAUTHORIZED');
    }

    // Generic application error
    return createErrorResponse(error.message, 'APPLICATION_ERROR');
  }

  // Handle database errors (PostgreSQL/Supabase)
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    const dbError = error as { code: string; message: string; details?: string };
    
    // Handle specific database errors
    if (dbError.code === '23505') { // Unique violation
      return createErrorResponse('A record with this information already exists', 'DUPLICATE_ENTITY');
    }
    
    if (dbError.code === '23503') { // Foreign key violation
      return createErrorResponse('Unable to complete operation due to related records', 'FOREIGN_KEY_VIOLATION');
    }
    
    return createErrorResponse(
      'Database error occurred',
      'DATABASE_ERROR',
      { code: dbError.code, details: dbError.details }
    );
  }

  // Handle unexpected errors
  if (error instanceof Error) {
    return createErrorResponse('An unexpected error occurred', 'INTERNAL_ERROR', {
      message: error.message,
    });
  }

  // Fallback for completely unknown error types
  return createErrorResponse('An unknown error occurred', 'UNKNOWN_ERROR');
} 