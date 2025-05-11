/**
 * Notification type values
 */
export enum NotificationType {
  // Customer related notifications
  LEAD_CREATED = 'lead_created',
  LEAD_UPDATED = 'lead_updated',
  LEAD_CONVERTED = 'lead_converted',
  CUSTOMER_CREATED = 'customer_created',
  CUSTOMER_UPDATED = 'customer_updated',
  
  // Order related notifications
  NEW_ORDER = 'new_order',
  ORDER_STATUS_CHANGED = 'order_status_changed',
  ORDER_PAYMENT_STATUS_CHANGED = 'order_payment_status_changed',
  
  // Invoice related notifications
  NEW_INVOICE = 'new_invoice',
  INVOICE_STATUS_CHANGED = 'invoice_status_changed',
  PAYMENT_RECORDED = 'payment_recorded',
  INVOICE_OVERDUE = 'invoice_overdue',
  
  // Appointment related notifications
  NEW_APPOINTMENT = 'new_appointment',
  APPOINTMENT_CONFIRMED = 'appointment_confirmed',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_RESCHEDULED = 'appointment_rescheduled',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_COMPLETED = 'appointment_completed',
  
  // Technician related notifications
  TECHNICIAN_ASSIGNED = 'technician_assigned',
  TECHNICIAN_APPOINTMENT_CHANGED = 'technician_appointment_changed',
  
  // System notifications
  SYSTEM_ERROR = 'system_error',
  INVENTORY_LOW = 'inventory_low',
  WARRANTY_EXPIRING = 'warranty_expiring'
}

/**
 * Notification channel values
 */
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  WHATSAPP = 'whatsapp'
}

/**
 * Notification status values
 */
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read',
  CANCELLED = 'cancelled'
}

/**
 * Notification priority values
 */
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Represents a notification in the system
 */
export interface Notification {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  recipient_id?: string; // User ID (customer or technician)
  recipient_email?: string;
  recipient_phone?: string;
  recipient_device_token?: string;
  subject: string;
  content: string;
  data?: Record<string, any>; // Additional data for the notification
  status: NotificationStatus;
  priority: NotificationPriority;
  scheduled_for?: Date;
  sent_at?: Date;
  delivered_at?: Date;
  read_at?: Date;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Represents input data for creating a new notification
 */
export interface CreateNotificationInput {
  type: NotificationType;
  channel: NotificationChannel;
  recipient_id?: string;
  recipient_email?: string;
  recipient_phone?: string;
  recipient_device_token?: string;
  subject: string;
  content: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  scheduled_for?: Date;
}

/**
 * Represents input data for updating a notification
 */
export interface UpdateNotificationInput {
  id: string;
  status?: NotificationStatus;
  sent_at?: Date;
  delivered_at?: Date;
  read_at?: Date;
  error_message?: string;
}

/**
 * Represents a notification template used for generating notifications
 */
export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject_template: string;
  content_template: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Represents input data for creating a notification template
 */
export interface CreateTemplateInput {
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject_template: string;
  content_template: string;
  active?: boolean;
}

/**
 * Represents input data for updating a notification template
 */
export interface UpdateTemplateInput {
  id: string;
  name?: string;
  type?: NotificationType;
  channel?: NotificationChannel;
  subject_template?: string;
  content_template?: string;
  active?: boolean;
}

/**
 * Notification filtering options
 */
export interface NotificationFilters {
  recipient_id?: string;
  type?: NotificationType | NotificationType[];
  channel?: NotificationChannel | NotificationChannel[];
  status?: NotificationStatus | NotificationStatus[];
  priority?: NotificationPriority | NotificationPriority[];
  date_from?: Date;
  date_to?: Date;
  search?: string;
}

/**
 * Template filtering options
 */
export interface TemplateFilters {
  type?: NotificationType | NotificationType[];
  channel?: NotificationChannel | NotificationChannel[];
  active?: boolean;
  search?: string;
} 