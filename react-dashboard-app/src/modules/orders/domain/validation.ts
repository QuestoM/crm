import { 
  CreateOrderInput, 
  CreateOrderItemInput, 
  OrderStatus, 
  PaymentMethod, 
  PaymentStatus, 
  UpdateOrderInput, 
  UpdateOrderItemInput 
} from './types';
import { isPositiveNumber } from '../../products/domain/validation';

/**
 * Validates order creation input
 * @returns object with validation result and any error messages
 */
export const validateCreateOrder = (data: CreateOrderInput): { 
  isValid: boolean; 
  errors: Record<string, string>; 
} => {
  const errors: Record<string, string> = {};

  // Required fields validation
  if (!data.customer_id) {
    errors.customer_id = 'שדה חובה';
  }

  if (!data.items || data.items.length === 0) {
    errors.items = 'ההזמנה חייבת להכיל לפחות פריט אחד';
  } else {
    // Validate each order item
    const itemErrors: Record<string, string>[] = [];
    
    data.items.forEach((item, index) => {
      const itemError: Record<string, string> = {};
      
      if (!item.product_id && !item.package_id) {
        itemError.product_or_package = 'יש לבחור מוצר או חבילה';
      }
      
      if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        itemError.quantity = 'יש להזין מספר שלם חיובי';
      }
      
      if (!isPositiveNumber(item.unit_price)) {
        itemError.unit_price = 'יש להזין מחיר חיובי';
      }
      
      if (Object.keys(itemError).length > 0) {
        itemErrors[index] = itemError;
      }
    });
    
    if (itemErrors.length > 0) {
      errors.items = JSON.stringify(itemErrors);
    }
  }

  // Optional fields validation
  if (data.status && !Object.values(OrderStatus).includes(data.status)) {
    errors.status = 'סטטוס הזמנה לא חוקי';
  }

  if (data.payment_method && !Object.values(PaymentMethod).includes(data.payment_method)) {
    errors.payment_method = 'אמצעי תשלום לא חוקי';
  }

  if (data.payment_status && !Object.values(PaymentStatus).includes(data.payment_status)) {
    errors.payment_status = 'סטטוס תשלום לא חוקי';
  }

  if (data.discount !== undefined && !isPositiveNumber(data.discount)) {
    errors.discount = 'יש להזין ערך חיובי';
  }

  if (data.tax !== undefined && !isPositiveNumber(data.tax)) {
    errors.tax = 'יש להזין ערך חיובי';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates order update input
 * @returns object with validation result and any error messages
 */
export const validateUpdateOrder = (data: UpdateOrderInput): { 
  isValid: boolean; 
  errors: Record<string, string>; 
} => {
  const errors: Record<string, string> = {};

  if (!data.id) {
    errors.id = 'מזהה ההזמנה חסר';
  }

  if (data.status && !Object.values(OrderStatus).includes(data.status)) {
    errors.status = 'סטטוס הזמנה לא חוקי';
  }

  if (data.payment_method && !Object.values(PaymentMethod).includes(data.payment_method)) {
    errors.payment_method = 'אמצעי תשלום לא חוקי';
  }

  if (data.payment_status && !Object.values(PaymentStatus).includes(data.payment_status)) {
    errors.payment_status = 'סטטוס תשלום לא חוקי';
  }

  if (data.discount !== undefined && !isPositiveNumber(data.discount)) {
    errors.discount = 'יש להזין ערך חיובי';
  }

  if (data.tax !== undefined && !isPositiveNumber(data.tax)) {
    errors.tax = 'יש להזין ערך חיובי';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates order item creation input
 * @returns object with validation result and any error messages
 */
export const validateCreateOrderItem = (data: CreateOrderItemInput): { 
  isValid: boolean; 
  errors: Record<string, string>; 
} => {
  const errors: Record<string, string> = {};

  if (!data.order_id) {
    errors.order_id = 'מזהה ההזמנה חסר';
  }

  if (!data.product_id && !data.package_id) {
    errors.product_or_package = 'יש לבחור מוצר או חבילה';
  }

  if (data.quantity <= 0 || !Number.isInteger(data.quantity)) {
    errors.quantity = 'יש להזין מספר שלם חיובי';
  }

  if (!isPositiveNumber(data.unit_price)) {
    errors.unit_price = 'יש להזין מחיר חיובי';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates order item update input
 * @returns object with validation result and any error messages
 */
export const validateUpdateOrderItem = (data: UpdateOrderItemInput): { 
  isValid: boolean; 
  errors: Record<string, string>; 
} => {
  const errors: Record<string, string> = {};

  if (!data.id) {
    errors.id = 'מזהה הפריט חסר';
  }

  if (data.quantity !== undefined && (data.quantity <= 0 || !Number.isInteger(data.quantity))) {
    errors.quantity = 'יש להזין מספר שלם חיובי';
  }

  if (data.unit_price !== undefined && !isPositiveNumber(data.unit_price)) {
    errors.unit_price = 'יש להזין מחיר חיובי';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 