import { supabase } from '../supabase/client';

/**
 * Lead interface representing a lead in the system
 */
export interface Lead {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'converted';
  created_at: string;
}

/**
 * Filters for lead queries
 */
export interface LeadFilters {
  status?: string;
  source?: string;
  search?: string;
}

/**
 * Response format for lead list queries
 */
export interface LeadListResponse {
  leads: Lead[];
  total: number;
}

/**
 * API response interface
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
}

/**
 * Get leads with filtering, pagination and sorting
 */
export async function getLeads(
  page: number = 1,
  pageSize: number = 10,
  filters: LeadFilters = {},
  sortBy: string = 'created_at',
  sortDirection: 'asc' | 'desc' = 'desc'
): Promise<ApiResponse<LeadListResponse>> {
  try {
    // Calculate offset based on page and pageSize
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Start building the query
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.source) {
      query = query.eq('source', filters.source);
    }

    if (filters.search) {
      // Search by name, email or company
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
    }

    // Add sorting
    query = query.order(sortBy, { ascending: sortDirection === 'asc' });

    // Add pagination
    query = query.range(from, to);

    // Execute the query
    const { data: leads, count, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: {
        leads: leads as Lead[],
        total: count || 0
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch leads',
        details: error
      }
    };
  }
}

/**
 * Get a single lead by id
 */
export async function getLead(id: string): Promise<ApiResponse<Lead>> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: data as Lead
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch lead',
        details: error
      }
    };
  }
}

/**
 * Create a new lead
 */
export async function createLead(
  leadData: Omit<Lead, 'id' | 'created_at'>
): Promise<ApiResponse<Lead>> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: data as Lead
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to create lead',
        details: error
      }
    };
  }
}

/**
 * Update an existing lead
 */
export async function updateLead(
  id: string,
  leadData: Partial<Omit<Lead, 'id' | 'created_at'>>
): Promise<ApiResponse<Lead>> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update(leadData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: data as Lead
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to update lead',
        details: error
      }
    };
  }
}

/**
 * Convert a lead to a customer
 * This function will:
 * 1. Create a new customer record
 * 2. Update the lead status to 'converted'
 * 3. Return the customer ID
 */
export async function convertLeadToCustomer(
  leadId: string
): Promise<ApiResponse<{ customerId: string }>> {
  try {
    // Start a Supabase transaction
    // First, get the lead data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      throw new Error(leadError?.message || 'Lead not found');
    }

    // Create a new customer from the lead data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        first_name: lead.name.split(' ')[0] || lead.name,
        last_name: lead.name.split(' ').slice(1).join(' ') || '',
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        status: 'active',
        total_orders: 0,
        total_spent: 0,
        source: lead.source
      })
      .select('id')
      .single();

    if (customerError || !customer) {
      throw new Error(customerError?.message || 'Failed to create customer');
    }

    // Update the lead status to 'converted'
    const { error: updateError } = await supabase
      .from('leads')
      .update({ status: 'converted' })
      .eq('id', leadId);

    if (updateError) {
      // Note: If this update fails, we still want to return the customer ID
      console.error('Failed to update lead status:', updateError);
    }

    return {
      success: true,
      data: {
        customerId: customer.id
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error 
          ? error.message 
          : 'Failed to convert lead to customer',
        details: error
      }
    };
  }
}

/**
 * Delete a lead
 */
export async function deleteLead(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete lead',
        details: error
      }
    };
  }
} 