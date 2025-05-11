import { 
  CreateNotificationInput, 
  CreateTemplateInput, 
  NotificationChannel, 
  NotificationType,
  UpdateNotificationInput,
  UpdateTemplateInput
} from './types';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates input data for creating a new notification
 */
export function validateCreateNotification(data: CreateNotificationInput): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.type || !Object.values(NotificationType).includes(data.type)) {
    errors.type = 'סוג התראה לא חוקי';
  }
  
  if (!data.channel || !Object.values(NotificationChannel).includes(data.channel)) {
    errors.channel = 'ערוץ התראה לא חוקי';
  }
  
  // Validate that we have at least one recipient
  if (!data.recipient_id && !data.recipient_email && !data.recipient_phone && !data.recipient_device_token) {
    errors.recipient = 'נדרש לפחות פרט זיהוי אחד של הנמען (מזהה, אימייל, טלפון, או מזהה מכשיר)';
  }
  
  // Validate channel-specific recipients
  if (data.channel === NotificationChannel.EMAIL && !data.recipient_email) {
    errors.recipient_email = 'כתובת אימייל נדרשת להתראות מסוג אימייל';
  }
  
  if (data.channel === NotificationChannel.SMS && !data.recipient_phone) {
    errors.recipient_phone = 'מספר טלפון נדרש להתראות מסוג מסרון';
  }
  
  if (data.channel === NotificationChannel.WHATSAPP && !data.recipient_phone) {
    errors.recipient_phone = 'מספר טלפון נדרש להתראות מסוג וואטסאפ';
  }
  
  if (data.channel === NotificationChannel.PUSH && !data.recipient_device_token) {
    errors.recipient_device_token = 'מזהה מכשיר נדרש להתראות מסוג התראה';
  }
  
  if (!data.subject || data.subject.trim() === '') {
    errors.subject = 'נושא ההתראה הוא שדה חובה';
  }
  
  if (!data.content || data.content.trim() === '') {
    errors.content = 'תוכן ההתראה הוא שדה חובה';
  }
  
  // Validate scheduled_for is in the future
  if (data.scheduled_for) {
    const scheduledDate = data.scheduled_for instanceof Date
      ? data.scheduled_for
      : new Date(data.scheduled_for);
    
    if (isNaN(scheduledDate.getTime())) {
      errors.scheduled_for = 'תאריך תזמון לא חוקי';
    } else if (scheduledDate < new Date()) {
      errors.scheduled_for = 'תאריך התזמון חייב להיות בעתיד';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates input data for updating a notification
 */
export function validateUpdateNotification(data: UpdateNotificationInput): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.id || data.id.trim() === '') {
    errors.id = 'מזהה התראה הוא שדה חובה';
  }
  
  // Validate all date fields
  if (data.sent_at) {
    const sentDate = data.sent_at instanceof Date
      ? data.sent_at
      : new Date(data.sent_at);
    
    if (isNaN(sentDate.getTime())) {
      errors.sent_at = 'תאריך שליחה לא חוקי';
    }
  }
  
  if (data.delivered_at) {
    const deliveredDate = data.delivered_at instanceof Date
      ? data.delivered_at
      : new Date(data.delivered_at);
    
    if (isNaN(deliveredDate.getTime())) {
      errors.delivered_at = 'תאריך מסירה לא חוקי';
    }
  }
  
  if (data.read_at) {
    const readDate = data.read_at instanceof Date
      ? data.read_at
      : new Date(data.read_at);
    
    if (isNaN(readDate.getTime())) {
      errors.read_at = 'תאריך קריאה לא חוקי';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates input data for creating a notification template
 */
export function validateCreateTemplate(data: CreateTemplateInput): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.name || data.name.trim() === '') {
    errors.name = 'שם התבנית הוא שדה חובה';
  }
  
  if (!data.type || !Object.values(NotificationType).includes(data.type)) {
    errors.type = 'סוג התראה לא חוקי';
  }
  
  if (!data.channel || !Object.values(NotificationChannel).includes(data.channel)) {
    errors.channel = 'ערוץ התראה לא חוקי';
  }
  
  if (!data.subject_template || data.subject_template.trim() === '') {
    errors.subject_template = 'תבנית נושא היא שדה חובה';
  }
  
  if (!data.content_template || data.content_template.trim() === '') {
    errors.content_template = 'תבנית תוכן היא שדה חובה';
  }
  
  // Check for required template variables based on notification type
  const requiredVariables = getRequiredVariablesForType(data.type);
  
  // Check if template content includes the required variables
  for (const variable of requiredVariables) {
    const pattern = new RegExp(`\\{${variable}\\}`, 'g');
    if (!pattern.test(data.content_template)) {
      errors[`content_template_${variable}`] = `תבנית התוכן חייבת לכלול את המשתנה {${variable}}`;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates input data for updating a notification template
 */
export function validateUpdateTemplate(data: UpdateTemplateInput): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.id || data.id.trim() === '') {
    errors.id = 'מזהה תבנית הוא שדה חובה';
  }
  
  if (data.type && !Object.values(NotificationType).includes(data.type)) {
    errors.type = 'סוג התראה לא חוקי';
  }
  
  if (data.channel && !Object.values(NotificationChannel).includes(data.channel)) {
    errors.channel = 'ערוץ התראה לא חוקי';
  }
  
  if (data.subject_template && data.subject_template.trim() === '') {
    errors.subject_template = 'תבנית נושא אינה יכולה להיות ריקה';
  }
  
  if (data.content_template && data.content_template.trim() === '') {
    errors.content_template = 'תבנית תוכן אינה יכולה להיות ריקה';
  }
  
  // If both type and content template are updated, check required variables
  if (data.type && data.content_template) {
    const requiredVariables = getRequiredVariablesForType(data.type);
    
    // Check if template content includes the required variables
    for (const variable of requiredVariables) {
      const pattern = new RegExp(`\\{${variable}\\}`, 'g');
      if (!pattern.test(data.content_template)) {
        errors[`content_template_${variable}`] = `תבנית התוכן חייבת לכלול את המשתנה {${variable}}`;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Gets the required template variables for a notification type
 */
function getRequiredVariablesForType(type: NotificationType): string[] {
  switch (type) {
    case NotificationType.NEW_ORDER:
      return ['orderId', 'customerName'];
      
    case NotificationType.ORDER_STATUS_CHANGED:
      return ['orderId', 'status'];
      
    case NotificationType.NEW_INVOICE:
      return ['invoiceId', 'amount'];
      
    case NotificationType.INVOICE_OVERDUE:
      return ['invoiceId', 'amount', 'dueDate'];
      
    case NotificationType.APPOINTMENT_REMINDER:
      return ['appointmentDate', 'appointmentTime'];
      
    case NotificationType.NEW_APPOINTMENT:
    case NotificationType.APPOINTMENT_CONFIRMED:
    case NotificationType.APPOINTMENT_CANCELLED:
    case NotificationType.APPOINTMENT_RESCHEDULED:
      return ['appointmentDate', 'appointmentTime', 'appointmentAddress'];
      
    case NotificationType.TECHNICIAN_ASSIGNED:
      return ['technicianName', 'appointmentDate', 'appointmentTime', 'appointmentAddress'];
      
    default:
      return [];
  }
} 