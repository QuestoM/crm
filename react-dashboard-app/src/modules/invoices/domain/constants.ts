import { InvoiceStatus } from './types';

/**
 * Default invoice status for new invoices
 */
export const DEFAULT_INVOICE_STATUS = InvoiceStatus.DRAFT;

/**
 * Default payment terms in days
 */
export const DEFAULT_PAYMENT_TERMS_DAYS = 30;

/**
 * Invoice number prefix
 */
export const INVOICE_NUMBER_PREFIX = 'INV-';

/**
 * Map of invoice status values to Hebrew display text
 */
export const INVOICE_STATUS_DISPLAY: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: 'טיוטה',
  [InvoiceStatus.SENT]: 'נשלח',
  [InvoiceStatus.PAID]: 'שולם',
  [InvoiceStatus.OVERDUE]: 'באיחור',
  [InvoiceStatus.CANCELLED]: 'בוטל'
};

/**
 * Available payment methods
 */
export const PAYMENT_METHODS = [
  'credit_card',
  'bank_transfer',
  'cash',
  'check',
  'other'
] as const;

/**
 * Map of payment methods to Hebrew display text
 */
export const PAYMENT_METHOD_DISPLAY: Record<string, string> = {
  'credit_card': 'כרטיס אשראי',
  'bank_transfer': 'העברה בנקאית',
  'cash': 'מזומן',
  'check': "צ'ק",
  'other': 'אחר'
}; 