// src/modules/leads/index.ts

// Domain exports
export * from './domain/types';
export * from './domain/constants';
export * from './domain/validation';

// Repository exports
export { leadRepository } from './repositories/leadRepository';

// Service exports
export { leadService, LeadValidationError } from './services/leadService';
export { leadConversionService } from './services/leadConversionService';

// API handlers exports
export { default as getLeadsHandler } from './api/getLeads';
export { default as getLeadByIdHandler } from './api/getLeadById';
export { default as createLeadHandler } from './api/createLead';
export { default as updateLeadHandler } from './api/updateLead';
export { default as deleteLeadHandler } from './api/deleteLead'; 