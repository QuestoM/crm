import { supabase } from '../supabase/client';
import { mapField } from '../supabase/schemaMap';
import { ServiceResponse } from './supabaseService';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  source: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
}

export interface LeadFilters {
  status?: string;
  source?: string;
  search?: string;
  assignedTo?: string;
}

export interface LeadListResponse {
  leads: Lead[];
  total: number;
}

// Helper function to convert from DB fields to our application model
function mapDbToLead(leadData: any): Lead {
  // Check for custom_fields JSON
  const customFields = leadData.custom_fields || {};
  
  return {
    id: leadData.id,
    firstName: leadData.first_name,
    lastName: leadData.last_name,
    email: leadData.email,
    phone: leadData.phone_number,
    source: leadData.lead_source,
    status: leadData.status,
    notes: customFields.notes,
    createdAt: leadData.created_at,
    updatedAt: leadData.updated_at,
    assignedTo: leadData.assigned_to,
    utmSource: leadData.utm_source,
    utmMedium: leadData.utm_medium,
    utmCampaign: leadData.utm_campaign,
    utmContent: leadData.utm_content
  };
}

// Helper function to convert our model to DB fields
function mapLeadToDb(lead: Partial<Lead>): any {
  // Extract notes from our model to place into custom_fields JSON
  const { notes, ...leadData } = lead;
  
  // Build the DB object
  const dbLead: any = {};
  
  // Map each field to its DB equivalent
  if (lead.firstName !== undefined) dbLead.first_name = lead.firstName;
  if (lead.lastName !== undefined) dbLead.last_name = lead.lastName;
  if (lead.email !== undefined) dbLead.email = lead.email;
  if (lead.phone !== undefined) dbLead.phone_number = lead.phone;
  if (lead.source !== undefined) dbLead.lead_source = lead.source;
  if (lead.status !== undefined) dbLead.status = lead.status;
  if (lead.assignedTo !== undefined) dbLead.assigned_to = lead.assignedTo;
  if (lead.utmSource !== undefined) dbLead.utm_source = lead.utmSource;
  if (lead.utmMedium !== undefined) dbLead.utm_medium = lead.utmMedium;
  if (lead.utmCampaign !== undefined) dbLead.utm_campaign = lead.utmCampaign;
  if (lead.utmContent !== undefined) dbLead.utm_content = lead.utmContent;
  
  // Handle custom fields
  if (notes) {
    dbLead.custom_fields = { ...dbLead.custom_fields, notes };
  }
  
  return dbLead;
}

/**
 * Get leads with pagination and filtering
 */
export async function getLeads(
  page = 1, 
  pageSize = 10, 
  filters: LeadFilters = {},
  sortBy = 'createdAt',
  sortDirection: 'asc' | 'desc' = 'desc'
): Promise<ServiceResponse<LeadListResponse>> {
  try {
    // Map application sort field to DB field
    const dbSortField = mapField('lead', sortBy);
    
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.source) {
      query = query.eq('lead_source', filters.source);
    }
    
    if (filters.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }
    
    if (filters.search) {
      // Search in first_name, last_name, email, and phone
      query = query.or(
        `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%`
      );
    }
    
    // Apply sorting
    query = query.order(dbSortField, { ascending: sortDirection === 'asc' });
    
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
    
    // Convert DB objects to our Lead model
    const leads = (data || []).map(mapDbToLead);
    
    return {
      success: true,
      data: {
        leads,
        total: count || 0
      }
    };
  } catch (err) {
    console.error('Error fetching leads:', err);
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
 * Get a single lead by ID
 */
export async function getLead(id: string): Promise<ServiceResponse<Lead>> {
  try {
    const { data, error } = await supabase
      .from('leads')
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
          message: 'Lead not found'
        }
      };
    }
    
    return {
      success: true,
      data: mapDbToLead(data)
    };
  } catch (err) {
    console.error('Error fetching lead:', err);
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
 * Create a new lead
 */
export async function createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<Lead>> {
  try {
    const dbLead = mapLeadToDb(lead);
    
    const { data, error } = await supabase
      .from('leads')
      .insert(dbLead)
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
      data: mapDbToLead(data)
    };
  } catch (err) {
    console.error('Error creating lead:', err);
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
 * Update an existing lead
 */
export async function updateLead(id: string, updates: Partial<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ServiceResponse<Lead>> {
  try {
    const dbUpdates = mapLeadToDb(updates);
    
    const { data, error } = await supabase
      .from('leads')
      .update(dbUpdates)
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
      data: mapDbToLead(data)
    };
  } catch (err) {
    console.error('Error updating lead:', err);
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
 * Delete a lead
 */
export async function deleteLead(id: string): Promise<ServiceResponse<void>> {
  try {
    const { error } = await supabase
      .from('leads')
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
    console.error('Error deleting lead:', err);
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
 * Convert a lead to a customer
 */
export async function convertLeadToCustomer(id: string): Promise<ServiceResponse<{customerId: string}>> {
  try {
    // First get the lead data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();
    
    if (leadError || !lead) {
      return {
        success: false,
        error: {
          code: 'query_error',
          message: leadError?.message || 'Lead not found'
        }
      };
    }
    
    // Create a new customer from the lead data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        phone_number: lead.phone_number,
        custom_fields: lead.custom_fields,
        lead_id: lead.id
      })
      .select()
      .single();
    
    if (customerError) {
      return {
        success: false,
        error: {
          code: 'insert_error',
          message: customerError.message
        }
      };
    }
    
    // Update the lead status to 'converted'
    const { error: updateError } = await supabase
      .from('leads')
      .update({ status: 'converted' })
      .eq('id', id);
    
    if (updateError) {
      console.error('Error updating lead status after conversion:', updateError);
      // We don't return an error here since the customer was created successfully
    }
    
    return {
      success: true,
      data: {
        customerId: customer.id
      }
    };
  } catch (err) {
    console.error('Error converting lead to customer:', err);
    return {
      success: false,
      error: {
        code: 'unexpected_error',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    };
  }
} 