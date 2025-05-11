// src/modules/invoices/index.ts

// Domain exports
export * from './domain/types';
export * from './domain/constants';
export * from './domain/validation';

// Repository exports
export { invoiceRepository } from './repositories/invoiceRepository';

// Service exports
export { invoiceService, InvoiceValidationError } from './services/invoiceService';

// API handlers exports
export { default as getInvoicesHandler } from './api/getInvoices';
export { default as getInvoiceByIdHandler } from './api/getInvoiceById';
export { default as getInvoiceByOrderIdHandler } from './api/getInvoiceByOrderId';
export { default as createInvoiceHandler } from './api/createInvoice';
export { default as updateInvoiceHandler } from './api/updateInvoice';
export { default as deleteInvoiceHandler } from './api/deleteInvoice';
export { default as recordPaymentHandler } from './api/recordPayment';
export { default as getInvoiceStatsHandler } from './api/getInvoiceStats';
export { default as processOverdueInvoicesHandler } from './api/processOverdueInvoices'; 