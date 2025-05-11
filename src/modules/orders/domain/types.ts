/**
 * Order status values
 */
export enum OrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Payment status values
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed'
}

/**
 * Payment method values
 */
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  CHECK = 'check',
  OTHER = 'other'
}

/**
 * Represents an order in the system
 */
export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  created_at: Date;
  updated_at: Date;
  items?: OrderItem[];
  customer?: any; // Customer details when included
}

/**
 * Represents an order item
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  package_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: any; // Product details when included
  package?: any; // Package details when included
}

/**
 * Represents input data for creating a new order
 */
export interface CreateOrderInput {
  customer_id: string;
  items: Array<{
    product_id?: string;
    package_id?: string;
    quantity: number;
    unit_price: number;
  }>;
  status?: OrderStatus;
  discount?: number;
  tax?: number;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
}

/**
 * Represents input data for updating an order
 */
export interface UpdateOrderInput {
  id: string;
  status?: OrderStatus;
  discount?: number;
  tax?: number;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
}

/**
 * Represents input data for creating an order item
 */
export interface CreateOrderItemInput {
  order_id: string;
  product_id?: string;
  package_id?: string;
  quantity: number;
  unit_price: number;
}

/**
 * Represents input data for updating an order item
 */
export interface UpdateOrderItemInput {
  id: string;
  quantity?: number;
  unit_price?: number;
}

/**
 * Order filtering options
 */
export interface OrderFilters {
  customer_id?: string;
  status?: OrderStatus | OrderStatus[];
  payment_status?: PaymentStatus | PaymentStatus[];
  date_from?: Date;
  date_to?: Date;
  min_total?: number;
  max_total?: number;
  search?: string;
} 