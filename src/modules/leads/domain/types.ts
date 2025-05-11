/**
 * Represents a lead in the system
 */
export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number: string;
  status: LeadStatus;
  lead_source: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  created_at: Date;
  updated_at: Date;
  assigned_to?: string;
  custom_fields?: Record<string, any>;
  notes?: string;
}

/**
 * Represents input data for creating a new lead
 */
export interface CreateLeadInput {
  lead_source: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  phone_number: string;
  email?: string;
  first_name: string;
  last_name: string;
  custom_fields?: Record<string, any>;
  status?: LeadStatus;
  assigned_to?: string;
}

/**
 * Represents input data for updating a lead
 */
export interface UpdateLeadInput {
  id: string;
  lead_source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  phone_number?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  custom_fields?: Record<string, any>;
  status?: LeadStatus;
  assigned_to?: string;
}

/**
 * Lead status values
 */
export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
  DORMANT = 'DORMANT'
}

/**
 * Lead filtering options
 */
export interface LeadFilters {
  status?: LeadStatus | LeadStatus[];
  lead_source?: string;
  assigned_to?: string;
  date_from?: Date;
  date_to?: Date;
  search?: string;
} 