// src/modules/appointments/index.ts

// Domain exports
export * from './domain/types';
export * from './domain/constants';
export * from './domain/validation';

// Repository exports
export { appointmentRepository } from './repositories/appointmentRepository';

// Service exports
export { appointmentService, AppointmentValidationError } from './services/appointmentService';

// API handlers exports
export { default as getAppointmentsHandler } from './api/getAppointments';
export { default as getAppointmentByIdHandler } from './api/getAppointmentById';
export { default as getAppointmentsByDayHandler } from './api/getAppointmentsByDay';
export { default as createAppointmentHandler } from './api/createAppointment';
export { default as updateAppointmentHandler } from './api/updateAppointment';
export { default as deleteAppointmentHandler } from './api/deleteAppointment';
export { default as checkAvailabilityHandler } from './api/checkAvailability';
export { default as getAppointmentStatsHandler } from './api/getAppointmentStats';
export { default as sendAppointmentRemindersHandler } from './api/sendAppointmentReminders'; 