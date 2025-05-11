import { CreateInvoiceInput, InvoiceStatus, RecordPaymentInput, UpdateInvoiceInput } from './types';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates input data for creating a new invoice
 */
export function validateCreateInvoice(data: CreateInvoiceInput): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.order_id || data.order_id.trim() === '') {
    errors.order_id = 'מזהה הזמנה הוא שדה חובה';
  }
  
  if (data.status && !Object.values(InvoiceStatus).includes(data.status)) {
    errors.status = 'סטטוס חשבונית לא חוקי';
  }
  
  if (data.amount !== undefined && (isNaN(data.amount) || data.amount < 0)) {
    errors.amount = 'סכום חשבונית חייב להיות מספר חיובי';
  }
  
  if (data.due_date && isNaN(new Date(data.due_date).getTime())) {
    errors.due_date = 'תאריך תשלום לא חוקי';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates input data for updating an invoice
 */
export function validateUpdateInvoice(data: UpdateInvoiceInput): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.id || data.id.trim() === '') {
    errors.id = 'מזהה חשבונית הוא שדה חובה';
  }
  
  if (data.status && !Object.values(InvoiceStatus).includes(data.status)) {
    errors.status = 'סטטוס חשבונית לא חוקי';
  }
  
  if (data.amount !== undefined && (isNaN(data.amount) || data.amount < 0)) {
    errors.amount = 'סכום חשבונית חייב להיות מספר חיובי';
  }
  
  if (data.due_date && isNaN(new Date(data.due_date).getTime())) {
    errors.due_date = 'תאריך תשלום לא חוקי';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates input data for recording a payment
 */
export function validateRecordPayment(data: RecordPaymentInput): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.invoice_id || data.invoice_id.trim() === '') {
    errors.invoice_id = 'מזהה חשבונית הוא שדה חובה';
  }
  
  if (isNaN(data.amount) || data.amount <= 0) {
    errors.amount = 'סכום תשלום חייב להיות מספר חיובי';
  }
  
  if (!data.payment_method || data.payment_method.trim() === '') {
    errors.payment_method = 'שיטת תשלום היא שדה חובה';
  }
  
  if (data.payment_date && isNaN(new Date(data.payment_date).getTime())) {
    errors.payment_date = 'תאריך תשלום לא חוקי';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
} 