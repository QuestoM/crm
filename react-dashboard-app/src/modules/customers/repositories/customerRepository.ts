import { supabaseClient } from '../../../services/supabase/client';
import { Customer, CreateCustomerInput, CustomerFilters, UpdateCustomerInput } from '../domain/types';

/**
 * Repository for customer data operations
 */
export const customerRepository = {
  /**
   * Get all customers with optional filtering and pagination
   */
  async getCustomers(
    filters?: CustomerFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ customers: Customer[]; totalCount: number }> {
    try {
      // Initial query builder
      let query = supabaseClient
        .from('customers')
        .select('*', { count: 'exact' });

      // Apply filters if provided
      if (filters) {
        if (filters.city) {
          query = query.eq('city', filters.city);
        }

        if (filters.date_from) {
          query = query.gte('created_at', filters.date_from.toISOString());
        }

        if (filters.date_to) {
          query = query.lte('created_at', filters.date_to.toISOString());
        }

        if (filters.search) {
          query = query.or(
            `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%`
          );
        }

        // Complex filters that require joins
        if (filters.has_orders) {
          // First get the customer IDs that have orders
          const { data: ordersData } = await supabaseClient
            .from('orders')
            .select('customer_id');
          
          // Extract unique customer IDs
          const customerIds = ordersData ? 
            [...new Set(ordersData.map(item => item.customer_id))] : 
            [];
          
          if (customerIds.length > 0) {
            query = query.in('id', customerIds);
          } else if (filters.has_orders) {
            // If we're looking for customers with orders but none exist
            return { customers: [], totalCount: 0 };
          }
        }

        if (filters.has_warranty) {
          // First get the customer IDs that have warranties
          const { data: warrantiesData } = await supabaseClient
            .from('warranties')
            .select('customer_id');
          
          // Extract unique customer IDs
          const customerIds = warrantiesData ? 
            [...new Set(warrantiesData.map(item => item.customer_id))] : 
            [];
          
          if (customerIds.length > 0) {
            query = query.in('id', customerIds);
          } else if (filters.has_warranty) {
            // If we're looking for customers with warranties but none exist
            return { customers: [], totalCount: 0 };
          }
        }
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        customers: (data || []) as Customer[],
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  /**
   * Get a single customer by ID
   */
  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabaseClient
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          return null;
        }
        throw error;
      }

      return data as Customer;
    } catch (error) {
      console.error(`Error fetching customer with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new customer
   */
  async createCustomer(customerData: CreateCustomerInput): Promise<Customer> {
    try {
      const customerWithDefaults = {
        ...customerData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from('customers')
        .insert(customerWithDefaults)
        .select()
        .single();

      if (error) throw error;

      return data as Customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  /**
   * Update an existing customer
   */
  async updateCustomer(customerData: UpdateCustomerInput): Promise<Customer> {
    try {
      const updates = {
        ...customerData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from('customers')
        .update(updates)
        .eq('id', customerData.id)
        .select()
        .single();

      if (error) throw error;

      return data as Customer;
    } catch (error) {
      console.error(`Error updating customer with ID ${customerData.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a customer by ID
   */
  async deleteCustomer(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error(`Error deleting customer with ID ${id}:`, error);
      throw error;
    }
  }
}; 