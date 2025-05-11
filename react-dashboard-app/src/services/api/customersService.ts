import { supabase } from '../supabase/client';
import { ServiceResponse } from './supabaseService';

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive' | 'prospect';
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export interface CustomerFilters {
  status?: string;
  search?: string;
  minOrders?: number;
  minSpent?: number;
}

export interface CustomerListResponse {
  customers: Customer[];
  total: number;
}

/**
 * Get customers with pagination and filtering
 */
export async function getCustomers(
  page = 1, 
  pageSize = 10, 
  filters: CustomerFilters = {},
  sortBy = 'created_at',
  sortDirection: 'asc' | 'desc' = 'desc'
): Promise<ServiceResponse<CustomerListResponse>> {
  try {
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }
    
    if (filters.minOrders !== undefined) {
      query = query.gte('total_orders', filters.minOrders);
    }
    
    if (filters.minSpent !== undefined) {
      query = query.gte('total_spent', filters.minSpent);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortDirection === 'asc' });
    
    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) {
      return {
        success: false,
        error: {
          code: 'query_error',
          message: error.message
        }
      };
    }
    
    return {
      success: true,
      data: {
        customers: data as Customer[],
        total: count || 0
      }
    };
  } catch (err) {
    console.error('Error fetching customers:', err);
    return {
      success: false,
      error: {
        code: 'unexpected_error',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    };
  }
}

/**
 * Get a single customer by ID
 */
export async function getCustomer(id: string): Promise<ServiceResponse<Customer>> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return {
        success: false,
        error: {
          code: 'query_error',
          message: error.message
        }
      };
    }
    
    if (!data) {
      return {
        success: false,
        error: {
          code: 'not_found',
          message: 'Customer not found'
        }
      };
    }
    
    return {
      success: true,
      data: data as Customer
    };
  } catch (err) {
    console.error('Error fetching customer:', err);
    return {
      success: false,
      error: {
        code: 'unexpected_error',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    };
  }
}

/**
 * Create a new customer
 */
export async function createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'total_orders' | 'total_spent'>): Promise<ServiceResponse<Customer>> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        ...customer,
        total_orders: 0,
        total_spent: 0
      })
      .select()
      .single();
    
    if (error) {
      return {
        success: false,
        error: {
          code: 'insert_error',
          message: error.message
        }
      };
    }
    
    return {
      success: true,
      data: data as Customer
    };
  } catch (err) {
    console.error('Error creating customer:', err);
    return {
      success: false,
      error: {
        code: 'unexpected_error',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    };
  }
}

/**
 * Update an existing customer
 */
export async function updateCustomer(id: string, updates: Partial<Omit<Customer, 'id' | 'created_at'>>): Promise<ServiceResponse<Customer>> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return {
        success: false,
        error: {
          code: 'update_error',
          message: error.message
        }
      };
    }
    
    return {
      success: true,
      data: data as Customer
    };
  } catch (err) {
    console.error('Error updating customer:', err);
    return {
      success: false,
      error: {
        code: 'unexpected_error',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    };
  }
}

/**
 * Delete a customer
 */
export async function deleteCustomer(id: string): Promise<ServiceResponse<void>> {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) {
      return {
        success: false,
        error: {
          code: 'delete_error',
          message: error.message
        }
      };
    }
    
    return {
      success: true
    };
  } catch (err) {
    console.error('Error deleting customer:', err);
    return {
      success: false,
      error: {
        code: 'unexpected_error',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    };
  }
} 