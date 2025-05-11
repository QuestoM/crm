/**
 * Common error classes for the application
 */

/**
 * Base error class for application errors
 */
export class AppError extends Error {
  code: string;
  
  constructor(message: string, code: string = 'unknown_error') {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for data validation failures
 */
export class ValidationError extends AppError {
  details: any;
  
  constructor(message: string, details?: any) {
    super(message, 'validation_error');
    this.details = details;
  }
}

/**
 * Error for data not found situations
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'not_found');
  }
}

/**
 * Error for unauthorized operations
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'unauthorized');
  }
}

/**
 * Error for database operations
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 'database_error');
  }
}

/**
 * Document not found error
 */
export class DocumentNotFoundError extends NotFoundError {
  constructor(documentId?: string) {
    super(documentId ? `Document with ID ${documentId} not found` : 'Document not found');
    this.code = 'document_not_found';
  }
}

/**
 * Inventory item not found error
 */
export class InventoryItemNotFoundError extends NotFoundError {
  constructor(itemId?: string) {
    super(itemId ? `Inventory item with ID ${itemId} not found` : 'Inventory item not found');
    this.code = 'inventory_item_not_found';
  }
}

/**
 * Warranty not found error
 */
export class WarrantyNotFoundError extends NotFoundError {
  constructor(warrantyId?: string) {
    super(warrantyId ? `Warranty with ID ${warrantyId} not found` : 'Warranty not found');
    this.code = 'warranty_not_found';
  }
}

/**
 * Warranty claim not found error
 */
export class WarrantyClaimNotFoundError extends NotFoundError {
  constructor(claimId?: string) {
    super(claimId ? `Warranty claim with ID ${claimId} not found` : 'Warranty claim not found');
    this.code = 'warranty_claim_not_found';
  }
}

/**
 * Error mapper for catching and converting errors
 */
export const errorMapper = (error: any): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  
  return new AppError(
    error?.message || 'An unknown error occurred',
    error?.code || 'unknown_error'
  );
};

/**
 * Create error response object from an error
 */
export const createErrorResponse = (error: any) => {
  const mappedError = errorMapper(error);
  
  return {
    success: false,
    error: {
      code: mappedError.code,
      message: mappedError.message,
      details: (mappedError as any).details
    }
  };
}; 