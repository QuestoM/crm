import { CreateCustomerInput, UpdateCustomerInput } from './types';
import { isValidEmail, isValidPhoneNumber } from '../../leads/domain/validation';

/**
 * Validates customer creation input
 * @returns object with validation result and any error messages
 */
export const validateCreateCustomer = (data: CreateCustomerInput): { 
  isValid: boolean; 
  errors: Record<string, string>; 
} => {
  const errors: Record<string, string> = {};

  // Required fields validation
  if (!data.first_name) {
    errors.first_name = 'שדה חובה';
  }

  if (!data.last_name) {
    errors.last_name = 'שדה חובה';
  }

  if (!data.phone_number) {
    errors.phone_number = 'שדה חובה';
  } else if (!isValidPhoneNumber(data.phone_number)) {
    errors.phone_number = 'מספר טלפון לא תקין';
  }

  // Optional fields validation
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'כתובת דוא"ל לא תקינה';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates customer update input
 * @returns object with validation result and any error messages
 */
export const validateUpdateCustomer = (data: UpdateCustomerInput): { 
  isValid: boolean; 
  errors: Record<string, string>; 
} => {
  const errors: Record<string, string> = {};

  if (!data.id) {
    errors.id = 'מזהה הלקוח חסר';
  }

  if (data.phone_number && !isValidPhoneNumber(data.phone_number)) {
    errors.phone_number = 'מספר טלפון לא תקין';
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'כתובת דוא"ל לא תקינה';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 