import { supabaseClient } from '../../../services/supabase/client';
import { CreateLeadInput, Lead, LeadFilters, LeadStatus, UpdateLeadInput } from '../domain/types';
import { DEFAULT_LEAD_STATUS } from '../domain/constants';

/**
 * Repository for lead data operations
 */
export const leadRepository = {
  /**
   * Get all leads with optional filtering and pagination
   */
  async getLeads(
    filters?: LeadFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ leads: Lead[]; totalCount: number }> {
    try {
      // Initial query builder
      let query = supabaseClient
        .from('leads')
        .select('*', { count: 'exact' });

      // Apply filters if provided
      if (filters) {
        if (filters.status) {
          if (Array.isArray(filters.status)) {
            query = query.in('status', filters.status);
          } else {
            query = query.eq('status', filters.status);
          }
        }

        if (filters.lead_source) {
          query = query.eq('lead_source', filters.lead_source);
        }

        if (filters.assigned_to) {
          query = query.eq('assigned_to', filters.assigned_to);
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
        leads: (data || []) as Lead[],
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  },

  /**
   * Get a single lead by ID
   */
  async getLeadById(id: string): Promise<Lead | null> {
    try {
      const { data, error } = await supabaseClient
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          return null;
        }
        throw error;
      }

      return data as Lead;
    } catch (error) {
      console.error(`Error fetching lead with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new lead
   */
  async createLead(leadData: CreateLeadInput): Promise<Lead> {
    try {
      // Set default status if not provided
      const leadWithDefaults = {
        ...leadData,
        status: leadData.status || DEFAULT_LEAD_STATUS,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from('leads')
        .insert(leadWithDefaults)
        .select()
        .single();

      if (error) throw error;

      return data as Lead;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  },

  /**
   * Update an existing lead
   */
  async updateLead(leadData: UpdateLeadInput): Promise<Lead> {
    try {
      const updates = {
        ...leadData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from('leads')
        .update(updates)
        .eq('id', leadData.id)
        .select()
        .single();

      if (error) throw error;

      return data as Lead;
    } catch (error) {
      console.error(`Error updating lead with ID ${leadData.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a lead by ID
   */
  async deleteLead(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error(`Error deleting lead with ID ${id}:`, error);
      throw error;
    }
  }
}; 