import { createTask } from '../../../services/queue/queueService';
import { Lead, LeadStatus } from '../domain/types';
import { leadRepository } from '../repositories/leadRepository';
import { supabaseClient } from '../../../services/supabase/client';

/**
 * Service for converting leads to customers
 */
export const leadConversionService = {
  /**
   * Convert a lead to a customer
   */
  async convertLeadToCustomer(
    leadId: string,
    additionalCustomerData: Record<string, any> = {}
  ): Promise<{ customerId: string; lead: Lead }> {
    try {
      // Get lead data
      const lead = await leadRepository.getLeadById(leadId);
      
      if (!lead) {
        throw new Error(`Lead with ID ${leadId} not found`);
      }
      
      // Create customer record
      const { data: customer, error: customerError } = await supabaseClient
        .from('customers')
        .insert({
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email,
          phone_number: lead.phone_number,
          lead_id: lead.id,
          custom_fields: {
            ...lead.custom_fields,
            ...additionalCustomerData.custom_fields
          },
          ...additionalCustomerData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (customerError) throw customerError;
      
      // Update lead status to won
      const updatedLead = await leadRepository.updateLead({
        id: leadId,
        status: LeadStatus.WON
      });
      
      // Queue task for customer welcome process
      try {
        await createTask('customer_welcome', {
          customerId: customer.id,
          leadId: updatedLead.id
        }, 5);
      } catch (error) {
        console.error('Failed to queue customer welcome task:', error);
      }
      
      return {
        customerId: customer.id,
        lead: updatedLead
      };
    } catch (error) {
      console.error(`Error converting lead ${leadId} to customer:`, error);
      throw error;
    }
  },
  
  /**
   * Get conversion rates by source for a given period
   */
  async getConversionRatesBySource(
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, { total: number; converted: number; rate: number }>> {
    try {
      // Get leads created in the period
      const { data: leads, error } = await supabaseClient
        .from('leads')
        .select('id, lead_source, status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (error) throw error;
      
      // Calculate conversion rates by source
      const sources: Record<string, { total: number; converted: number; rate: number }> = {};
      
      for (const lead of leads) {
        const source = lead.lead_source;
        
        if (!sources[source]) {
          sources[source] = { total: 0, converted: 0, rate: 0 };
        }
        
        sources[source].total++;
        
        if (lead.status === LeadStatus.WON) {
          sources[source].converted++;
        }
      }
      
      // Calculate rates
      for (const source in sources) {
        if (sources[source].total > 0) {
          sources[source].rate = sources[source].converted / sources[source].total;
        }
      }
      
      return sources;
    } catch (error) {
      console.error('Error getting conversion rates by source:', error);
      throw error;
    }
  }
}; 