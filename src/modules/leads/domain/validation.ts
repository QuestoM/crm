import { CreateLeadInput, LeadStatus, UpdateLeadInput } from './types';

/**
 * Validates email format
 */
export const isValidEmail = (email?: string): boolean => {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates Israeli phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Israeli phone number format (allows international format +972 or local format)
  const phoneRegex = /^(\+972|0)([23489]|5[02-9]|77)[0-9]{7}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates lead creation input
 * @returns object with validation result and any error messages
 */
export const validateCreateLead = (data: CreateLeadInput): { 
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

  if (!data.lead_source) {
    errors.lead_source = 'שדה חובה';
  }

  // Optional fields validation
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'כתובת דוא"ל לא תקינה';
  }

  // Validate status is a valid enum value if provided
  if (data.status && !Object.values(LeadStatus).includes(data.status)) {
    errors.status = 'סטטוס לא תקין';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates lead update input
 * @returns object with validation result and any error messages
 */
export const validateUpdateLead = (data: UpdateLeadInput): { 
  isValid: boolean; 
  errors: Record<string, string>; 
} => {
  const errors: Record<string, string> = {};

  if (!data.id) {
    errors.id = 'מזהה הליד חסר';
  }

  if (data.phone_number && !isValidPhoneNumber(data.phone_number)) {
    errors.phone_number = 'מספר טלפון לא תקין';
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'כתובת דוא"ל לא תקינה';
  }

  // Validate status is a valid enum value if provided
  if (data.status && !Object.values(LeadStatus).includes(data.status)) {
    errors.status = 'סטטוס לא תקין';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 