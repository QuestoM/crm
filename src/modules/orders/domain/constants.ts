import { OrderStatus, PaymentMethod, PaymentStatus } from './types';

/**
 * Default order status for new orders
 */
export const DEFAULT_ORDER_STATUS = OrderStatus.DRAFT;

/**
 * Default payment status for new orders
 */
export const DEFAULT_PAYMENT_STATUS = PaymentStatus.PENDING;

/**
 * Default payment method for new orders
 */
export const DEFAULT_PAYMENT_METHOD = PaymentMethod.CREDIT_CARD;

/**
 * Default tax rate (as decimal)
 */
export const DEFAULT_TAX_RATE = 0.17; // 17% VAT in Israel

/**
 * Map of order status values to Hebrew display text
 */
export const ORDER_STATUS_DISPLAY: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: 'טיוטה',
  [OrderStatus.PENDING]: 'ממתין',
  [OrderStatus.PROCESSING]: 'בתהליך',
  [OrderStatus.COMPLETED]: 'הושלם',
  [OrderStatus.CANCELLED]: 'בוטל'
};

/**
 * Map of payment status values to Hebrew display text
 */
export const PAYMENT_STATUS_DISPLAY: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'ממתין לתשלום',
  [PaymentStatus.PARTIAL]: 'שולם חלקית',
  [PaymentStatus.PAID]: 'שולם',
  [PaymentStatus.REFUNDED]: 'הוחזר',
  [PaymentStatus.FAILED]: 'נכשל'
};

/**
 * Map of payment method values to Hebrew display text
 */
export const PAYMENT_METHOD_DISPLAY: Record<PaymentMethod, string> = {
  [PaymentMethod.CREDIT_CARD]: 'כרטיס אשראי',
  [PaymentMethod.BANK_TRANSFER]: 'העברה בנקאית',
  [PaymentMethod.CASH]: 'מזומן',
  [PaymentMethod.CHECK]: "צ'ק",
  [PaymentMethod.OTHER]: 'אחר'
}; 