/**
 * Invoice status values
 */
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

/**
 * Represents an invoice in the system
 */
export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  amount: number;
  due_date: Date;
  paid_at?: Date;
  created_at: Date;
  order?: any; // Order details when included
  payments?: InvoicePayment[]; // Payments when included
}

/**
 * Represents input data for creating a new invoice
 */
export interface CreateInvoiceInput {
  order_id: string;
  status?: InvoiceStatus;
  amount?: number; // If not provided, calculated from order
  due_date?: Date; // If not provided, calculated as current date + payment terms
}

/**
 * Represents input data for updating an invoice
 */
export interface UpdateInvoiceInput {
  id: string;
  status?: InvoiceStatus;
  amount?: number;
  due_date?: Date;
  paid_at?: Date;
}

/**
 * Represents a payment made against an invoice
 */
export interface InvoicePayment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  payment_date: Date;
  reference?: string;
  notes?: string;
  created_at: Date;
}

/**
 * Represents input data for recording a payment
 */
export interface RecordPaymentInput {
  invoice_id: string;
  amount: number;
  payment_method: string;
  payment_date?: Date;
  reference?: string;
  notes?: string;
}

/**
 * Invoice filtering options
 */
export interface InvoiceFilters {
  order_id?: string;
  status?: InvoiceStatus | InvoiceStatus[];
  date_from?: Date;
  date_to?: Date;
  due_from?: Date;
  due_to?: Date;
  min_amount?: number;
  max_amount?: number;
  search?: string;
} 