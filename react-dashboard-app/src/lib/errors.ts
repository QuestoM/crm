/**
 * Base error class for application-specific errors
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a document is not found
 */
export class DocumentNotFoundError extends AppError {
  constructor(documentId: string) {
    super(`Document with ID ${documentId} not found`);
  }
}

/**
 * Error thrown when an inventory item is not found
 */
export class InventoryItemNotFoundError extends AppError {
  constructor(itemId: string) {
    super(`Inventory item with ID ${itemId} not found`);
  }
}

/**
 * Error thrown when a warranty is not found
 */
export class WarrantyNotFoundError extends AppError {
  constructor(warrantyId: string) {
    super(`Warranty with ID ${warrantyId} not found`);
  }
}

/**
 * Error thrown when a warranty claim is not found
 */
export class WarrantyClaimNotFoundError extends AppError {
  constructor(claimId: string) {
    super(`Warranty claim with ID ${claimId} not found`);
  }
}

/**
 * Error thrown when a request is invalid
 */
export class ValidationError extends AppError {
  errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.errors = errors;
  }
}

/**
 * Error thrown when an unauthorized action is attempted
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message);
  }
}

/**
 * Error thrown when an entity already exists
 */
export class DuplicateEntityError extends AppError {
  constructor(entity: string, identifier: string) {
    super(`${entity} with identifier ${identifier} already exists`);
  }
} 