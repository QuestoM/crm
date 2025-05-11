import { leadRepository } from '../repositories/leadRepository';
import { CreateLeadInput, Lead, LeadFilters, UpdateLeadInput } from '../domain/types';
import { validateCreateLead, validateUpdateLead } from '../domain/validation';
import { createTask } from '../../../services/queue/queueService';

/**
 * Error class for lead validation errors
 */
export class LeadValidationError extends Error {
  errors: Record<string, string>;
  
  constructor(message: string, errors: Record<string, string>) {
    super(message);
    this.name = 'LeadValidationError';
    this.errors = errors;
  }
}

/**
 * Service for lead management operations
 */
export const leadService = {
  /**
   * Get leads with optional filtering and pagination
   */
  async getLeads(
    filters?: LeadFilters,
    page?: number,
    pageSize?: number
  ): Promise<{ leads: Lead[]; totalCount: number }> {
    return leadRepository.getLeads(filters, page, pageSize);
  },

  /**
   * Get a single lead by ID
   */
  async getLeadById(id: string): Promise<Lead | null> {
    return leadRepository.getLeadById(id);
  },

  /**
   * Create a new lead with validation
   */
  async createLead(leadData: CreateLeadInput): Promise<Lead> {
    // Validate the lead data
    const validation = validateCreateLead(leadData);
    
    if (!validation.isValid) {
      throw new LeadValidationError('Lead validation failed', validation.errors);
    }
    
    // Create the lead in the database
    const lead = await leadRepository.createLead(leadData);
    
    // Queue notifications for new lead
    try {
      await createTask('new_lead_notification', {
        leadId: lead.id,
        notificationType: 'new_lead'
      }, 5);
    } catch (error) {
      console.error('Failed to queue lead notification:', error);
      // We don't want to fail the lead creation if notification queueing fails
    }
    
    return lead;
  },

  /**
   * Update a lead with validation
   */
  async updateLead(leadData: UpdateLeadInput): Promise<Lead> {
    // Validate the lead data
    const validation = validateUpdateLead(leadData);
    
    if (!validation.isValid) {
      throw new LeadValidationError('Lead validation failed', validation.errors);
    }
    
    // Check if the lead exists
    const existingLead = await leadRepository.getLeadById(leadData.id);
    
    if (!existingLead) {
      throw new Error(`Lead with ID ${leadData.id} not found`);
    }
    
    // Update the lead in the database
    const updatedLead = await leadRepository.updateLead(leadData);
    
    // Queue status change notification if status changed
    if (leadData.status && leadData.status !== existingLead.status) {
      try {
        await createTask('lead_status_changed', {
          leadId: updatedLead.id,
          newStatus: updatedLead.status,
          oldStatus: existingLead.status
        }, 3);
      } catch (error) {
        console.error('Failed to queue status change notification:', error);
      }
    }
    
    return updatedLead;
  },

  /**
   * Delete a lead by ID
   */
  async deleteLead(id: string): Promise<boolean> {
    // Check if the lead exists
    const existingLead = await leadRepository.getLeadById(id);
    
    if (!existingLead) {
      throw new Error(`Lead with ID ${id} not found`);
    }
    
    return leadRepository.deleteLead(id);
  },

  /**
   * Assign a lead to a user
   */
  async assignLead(leadId: string, userId: string): Promise<Lead> {
    const lead = await leadRepository.getLeadById(leadId);
    
    if (!lead) {
      throw new Error(`Lead with ID ${leadId} not found`);
    }
    
    const updatedLead = await leadRepository.updateLead({
      id: leadId,
      assigned_to: userId
    });
    
    // Queue assignment notification
    try {
      await createTask('lead_assigned', {
        leadId,
        userId
      }, 3);
    } catch (error) {
      console.error('Failed to queue lead assignment notification:', error);
    }
    
    return updatedLead;
  }
}; 