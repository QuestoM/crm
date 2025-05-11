import { 
  CreatePackageInput, 
  CreateProductInput, 
  UpdatePackageInput, 
  UpdateProductInput 
} from './types';
import { PRODUCT_CATEGORIES } from './constants';

/**
 * Validates that a value is a positive number
 */
export const isPositiveNumber = (value: any): boolean => {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
};

/**
 * Validates that a value is a positive integer
 */
export const isPositiveInteger = (value: any): boolean => {
  return Number.isInteger(value) && value >= 0;
};

/**
 * Validates product creation input
 * @returns object with validation result and any error messages
 */
export const validateCreateProduct = (data: CreateProductInput): { 
  isValid: boolean; 
  errors: Record<string, string>; 
} => {
  const errors: Record<string, string> = {};

  // Required fields validation
  if (!data.name) {
    errors.name = 'שדה חובה';
  }

  if (!data.sku) {
    errors.sku = 'שדה חובה';
  }

  if (!data.description) {
    errors.description = 'שדה חובה';
  }

  if (data.price === undefined || data.price === null) {
    errors.price = 'שדה חובה';
  } else if (!isPositiveNumber(data.price)) {
    errors.price = 'יש להזין מספר חיובי';
  }

  if (data.cost === undefined || data.cost === null) {
    errors.cost = 'שדה חובה';
  } else if (!isPositiveNumber(data.cost)) {
    errors.cost = 'יש להזין מספר חיובי';
  }

  if (!data.category) {
    errors.category = 'שדה חובה';
  } else if (!PRODUCT_CATEGORIES.includes(data.category as any)) {
    errors.category = 'קטגוריה לא חוקית';
  }

  if (data.warranty_months === undefined || data.warranty_months === null) {
    errors.warranty_months = 'שדה חובה';
  } else if (!isPositiveInteger(data.warranty_months)) {
    errors.warranty_months = 'יש להזין מספר שלם חיובי';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates product update input
 * @returns object with validation result and any error messages
 */
export const validateUpdateProduct = (data: UpdateProductInput): { 
  isValid: boolean; 
  errors: Record<string, string>; 
} => {
  const errors: Record<string, string> = {};

  if (!data.id) {
    errors.id = 'מזהה המוצר חסר';
  }

  if (data.price !== undefined && !isPositiveNumber(data.price)) {
    errors.price = 'יש להזין מספר חיובי';
  }

  if (data.cost !== undefined && !isPositiveNumber(data.cost)) {
    errors.cost = 'יש להזין מספר חיובי';
  }

  if (data.category && !PRODUCT_CATEGORIES.includes(data.category as any)) {
    errors.category = 'קטגוריה לא חוקית';
  }

  if (data.warranty_months !== undefined && !isPositiveInteger(data.warranty_months)) {
    errors.warranty_months = 'יש להזין מספר שלם חיובי';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates package creation input
 * @returns object with validation result and any error messages
 */
export const validateCreatePackage = (data: CreatePackageInput): { 
  isValid: boolean; 
  errors: Record<string, string>; 
} => {
  const errors: Record<string, string> = {};

  // Required fields validation
  if (!data.name) {
    errors.name = 'שדה חובה';
  }

  if (!data.description) {
    errors.description = 'שדה חובה';
  }

  if (data.base_price === undefined || data.base_price === null) {
    errors.base_price = 'שדה חובה';
  } else if (!isPositiveNumber(data.base_price)) {
    errors.base_price = 'יש להזין מספר חיובי';
  }

  // Validate package items
  if (!data.items || data.items.length === 0) {
    errors.items = 'החבילה חייבת להכיל לפחות מוצר אחד';
  } else {
    // Validate each package item
    const itemErrors: Record<string, string>[] = [];
    
    data.items.forEach((item, index) => {
      const itemError: Record<string, string> = {};
      
      if (!item.product_id) {
        itemError.product_id = 'שדה חובה';
      }
      
      if (item.quantity === undefined || item.quantity === null) {
        itemError.quantity = 'שדה חובה';
      } else if (!isPositiveInteger(item.quantity) || item.quantity === 0) {
        itemError.quantity = 'יש להזין מספר שלם חיובי';
      }
      
      if (item.price_override !== undefined && !isPositiveNumber(item.price_override)) {
        itemError.price_override = 'יש להזין מספר חיובי';
      }
      
      if (Object.keys(itemError).length > 0) {
        itemErrors[index] = itemError;
      }
    });
    
    if (itemErrors.length > 0) {
      errors.items = JSON.stringify(itemErrors);
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates package update input
 * @returns object with validation result and any error messages
 */
export const validateUpdatePackage = (data: UpdatePackageInput): { 
  isValid: boolean; 
  errors: Record<string, string>; 
} => {
  const errors: Record<string, string> = {};

  if (!data.id) {
    errors.id = 'מזהה החבילה חסר';
  }

  if (data.base_price !== undefined && !isPositiveNumber(data.base_price)) {
    errors.base_price = 'יש להזין מספר חיובי';
  }

  // Validate package items if provided
  if (data.items && data.items.length === 0) {
    errors.items = 'החבילה חייבת להכיל לפחות מוצר אחד';
  } else if (data.items) {
    // Validate each package item
    const itemErrors: Record<string, string>[] = [];
    
    data.items.forEach((item, index) => {
      const itemError: Record<string, string> = {};
      
      if (!item.product_id) {
        itemError.product_id = 'שדה חובה';
      }
      
      if (item.quantity === undefined || item.quantity === null) {
        itemError.quantity = 'שדה חובה';
      } else if (!isPositiveInteger(item.quantity) || item.quantity === 0) {
        itemError.quantity = 'יש להזין מספר שלם חיובי';
      }
      
      if (item.price_override !== undefined && !isPositiveNumber(item.price_override)) {
        itemError.price_override = 'יש להזין מספר חיובי';
      }
      
      if (Object.keys(itemError).length > 0) {
        itemErrors[index] = itemError;
      }
    });
    
    if (itemErrors.length > 0) {
      errors.items = JSON.stringify(itemErrors);
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 