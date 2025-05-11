/**
 * Represents a customer in the system
 */
export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number: string;
  address?: string;
  city?: string;
  custom_fields?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  lead_id?: string;
}

/**
 * Represents input data for creating a new customer
 */
export interface CreateCustomerInput {
  first_name: string;
  last_name: string;
  email?: string;
  phone_number: string;
  address?: string;
  city?: string;
  custom_fields?: Record<string, any>;
  lead_id?: string;
}

/**
 * Represents input data for updating a customer
 */
export interface UpdateCustomerInput {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  custom_fields?: Record<string, any>;
}

/**
 * Customer filtering options
 */
export interface CustomerFilters {
  search?: string;
  city?: string;
  date_from?: Date;
  date_to?: Date;
  has_orders?: boolean;
  has_warranty?: boolean;
} 