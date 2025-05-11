// src/modules/customers/index.ts

// Domain exports
export * from './domain/types';
export * from './domain/validation';

// Repository exports
export { customerRepository } from './repositories/customerRepository';

// Service exports
export { customerService, CustomerValidationError } from './services/customerService';

// API handlers exports
export { default as getCustomersHandler } from './api/getCustomers';
export { default as getCustomerByIdHandler } from './api/getCustomerById';
export { default as createCustomerHandler } from './api/createCustomer';
export { default as updateCustomerHandler } from './api/updateCustomer';
export { default as deleteCustomerHandler } from './api/deleteCustomer'; 