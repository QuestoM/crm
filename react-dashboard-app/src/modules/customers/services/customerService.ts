import { customerRepository } from '../repositories/customerRepository';
import { CreateCustomerInput, Customer, CustomerFilters, UpdateCustomerInput } from '../domain/types';
import { validateCreateCustomer, validateUpdateCustomer } from '../domain/validation';
import { createTask } from '../../../services/queue/queueService';
import { supabaseClient } from '../../../services/supabase/client';

/**
 * Error class for customer validation errors
 */
export class CustomerValidationError extends Error {
  errors: Record<string, string>;
  
  constructor(message: string, errors: Record<string, string>) {
    super(message);
    this.name = 'CustomerValidationError';
    this.errors = errors;
  }
}

/**
 * Service for customer management operations
 */
export const customerService = {
  /**
   * Get customers with optional filtering and pagination
   */
  async getCustomers(
    filters?: CustomerFilters,
    page?: number,
    pageSize?: number
  ): Promise<{ customers: Customer[]; totalCount: number }> {
    return customerRepository.getCustomers(filters, page, pageSize);
  },

  /**
   * Get a single customer by ID
   */
  async getCustomerById(id: string): Promise<Customer | null> {
    return customerRepository.getCustomerById(id);
  },

  /**
   * Create a new customer with validation
   */
  async createCustomer(customerData: CreateCustomerInput): Promise<Customer> {
    // Validate the customer data
    const validation = validateCreateCustomer(customerData);
    
    if (!validation.isValid) {
      throw new CustomerValidationError('Customer validation failed', validation.errors);
    }
    
    // Create the customer in the database
    const customer = await customerRepository.createCustomer(customerData);
    
    // Queue notifications for new customer
    try {
      await createTask('new_customer_notification', {
        customerId: customer.id,
        notificationType: 'welcome'
      }, 5);
    } catch (error) {
      console.error('Failed to queue customer notification:', error);
      // We don't want to fail the customer creation if notification queueing fails
    }
    
    return customer;
  },

  /**
   * Update a customer with validation
   */
  async updateCustomer(customerData: UpdateCustomerInput): Promise<Customer> {
    // Validate the customer data
    const validation = validateUpdateCustomer(customerData);
    
    if (!validation.isValid) {
      throw new CustomerValidationError('Customer validation failed', validation.errors);
    }
    
    // Check if the customer exists
    const existingCustomer = await customerRepository.getCustomerById(customerData.id);
    
    if (!existingCustomer) {
      throw new Error(`Customer with ID ${customerData.id} not found`);
    }
    
    // Update the customer in the database
    return customerRepository.updateCustomer(customerData);
  },

  /**
   * Delete a customer by ID
   */
  async deleteCustomer(id: string): Promise<boolean> {
    // Check if the customer exists
    const existingCustomer = await customerRepository.getCustomerById(id);
    
    if (!existingCustomer) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    
    return customerRepository.deleteCustomer(id);
  },

  /**
   * Get customer orders history
   */
  async getCustomerOrders(customerId: string): Promise<any[]> {
    // Ensure customer exists
    const customer = await customerRepository.getCustomerById(customerId);
    
    if (!customer) {
      throw new Error(`Customer with ID ${customerId} not found`);
    }
    
    // Get customer orders from database
    const { data, error } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          product:product_id(*),
          package:package_id(*)
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  },

  /**
   * Get customer service history
   */
  async getCustomerServiceHistory(customerId: string): Promise<any[]> {
    // Ensure customer exists
    const customer = await customerRepository.getCustomerById(customerId);
    
    if (!customer) {
      throw new Error(`Customer with ID ${customerId} not found`);
    }
    
    // Get customer service appointments from database
    const { data, error } = await supabaseClient
      .from('service_appointments')
      .select(`
        *,
        technician:technician_id(*),
        product:product_id(*)
      `)
      .eq('customer_id', customerId)
      .order('scheduled_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  }
}; 