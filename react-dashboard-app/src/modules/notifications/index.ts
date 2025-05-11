// src/modules/notifications/index.ts

// Domain exports
export * from './domain/types';
export * from './domain/constants';
export * from './domain/validation';

// Repository exports
export { notificationRepository } from './repositories/notificationRepository';

// Service exports
export { notificationService, NotificationValidationError } from './services/notificationService';

// API handlers exports
export { default as getNotificationsHandler } from './api/getNotifications';
export { default as getNotificationByIdHandler } from './api/getNotificationById';
export { default as createNotificationHandler } from './api/createNotification';
export { default as updateNotificationHandler } from './api/updateNotification';
export { default as deleteNotificationHandler } from './api/deleteNotification';
export { default as markAsReadHandler } from './api/markAsRead';
export { default as getTemplatesHandler } from './api/getTemplates';
export { default as getTemplateByIdHandler } from './api/getTemplateById';
export { default as createTemplateHandler } from './api/createTemplate';
export { default as updateTemplateHandler } from './api/updateTemplate';
export { default as deleteTemplateHandler } from './api/deleteTemplate';
export { default as processPendingNotificationsHandler } from './api/processPendingNotifications';
export { default as getUserNotificationsHandler } from './api/getUserNotifications'; 