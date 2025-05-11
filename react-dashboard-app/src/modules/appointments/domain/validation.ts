import { AppointmentPriority, AppointmentStatus, AvailabilityCheckInput, CreateAppointmentInput, ServiceType, UpdateAppointmentInput } from './types';
import { AVAILABLE_TIME_SLOTS } from './constants';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates input data for creating a new appointment
 */
export function validateCreateAppointment(data: CreateAppointmentInput): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.customer_id || data.customer_id.trim() === '') {
    errors.customer_id = 'מזהה לקוח הוא שדה חובה';
  }
  
  if (!data.service_type || !Object.values(ServiceType).includes(data.service_type)) {
    errors.service_type = 'סוג שירות לא חוקי';
  }
  
  if (data.status && !Object.values(AppointmentStatus).includes(data.status)) {
    errors.status = 'סטטוס פגישה לא חוקי';
  }
  
  if (data.priority && !Object.values(AppointmentPriority).includes(data.priority)) {
    errors.priority = 'עדיפות פגישה לא חוקית';
  }
  
  if (!data.scheduled_date) {
    errors.scheduled_date = 'תאריך פגישה הוא שדה חובה';
  } else {
    const scheduledDate = data.scheduled_date instanceof Date 
      ? data.scheduled_date 
      : new Date(data.scheduled_date);
    
    if (isNaN(scheduledDate.getTime())) {
      errors.scheduled_date = 'תאריך פגישה לא חוקי';
    } else if (scheduledDate < new Date()) {
      errors.scheduled_date = 'תאריך פגישה חייב להיות בעתיד';
    }
  }
  
  if (!data.scheduled_time_slot || data.scheduled_time_slot.trim() === '') {
    errors.scheduled_time_slot = 'שעת פגישה היא שדה חובה';
  } else if (!AVAILABLE_TIME_SLOTS.includes(data.scheduled_time_slot)) {
    errors.scheduled_time_slot = 'משבצת זמן לא חוקית';
  }
  
  if (data.duration_minutes !== undefined && (isNaN(data.duration_minutes) || data.duration_minutes <= 0)) {
    errors.duration_minutes = 'משך פגישה חייב להיות מספר חיובי';
  }
  
  if (!data.address || data.address.trim() === '') {
    errors.address = 'כתובת היא שדה חובה';
  }
  
  if (!data.city || data.city.trim() === '') {
    errors.city = 'עיר היא שדה חובה';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates input data for updating an appointment
 */
export function validateUpdateAppointment(data: UpdateAppointmentInput): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.id || data.id.trim() === '') {
    errors.id = 'מזהה פגישה הוא שדה חובה';
  }
  
  if (data.service_type && !Object.values(ServiceType).includes(data.service_type)) {
    errors.service_type = 'סוג שירות לא חוקי';
  }
  
  if (data.status && !Object.values(AppointmentStatus).includes(data.status)) {
    errors.status = 'סטטוס פגישה לא חוקי';
  }
  
  if (data.priority && !Object.values(AppointmentPriority).includes(data.priority)) {
    errors.priority = 'עדיפות פגישה לא חוקית';
  }
  
  if (data.scheduled_date) {
    const scheduledDate = data.scheduled_date instanceof Date 
      ? data.scheduled_date 
      : new Date(data.scheduled_date);
    
    if (isNaN(scheduledDate.getTime())) {
      errors.scheduled_date = 'תאריך פגישה לא חוקי';
    } else if (scheduledDate < new Date() && data.status !== AppointmentStatus.COMPLETED) {
      // Allow past dates for completed appointments
      errors.scheduled_date = 'תאריך פגישה חייב להיות בעתיד';
    }
  }
  
  if (data.scheduled_time_slot && !AVAILABLE_TIME_SLOTS.includes(data.scheduled_time_slot)) {
    errors.scheduled_time_slot = 'משבצת זמן לא חוקית';
  }
  
  if (data.duration_minutes !== undefined && (isNaN(data.duration_minutes) || data.duration_minutes <= 0)) {
    errors.duration_minutes = 'משך פגישה חייב להיות מספר חיובי';
  }
  
  if (data.completed_at) {
    const completedAt = data.completed_at instanceof Date
      ? data.completed_at
      : new Date(data.completed_at);
    
    if (isNaN(completedAt.getTime())) {
      errors.completed_at = 'תאריך סיום לא חוקי';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates input data for checking availability
 */
export function validateAvailabilityCheck(data: AvailabilityCheckInput): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.date) {
    errors.date = 'תאריך הוא שדה חובה';
  } else {
    const date = data.date instanceof Date 
      ? data.date 
      : new Date(data.date);
    
    if (isNaN(date.getTime())) {
      errors.date = 'תאריך לא חוקי';
    } else if (date < new Date()) {
      errors.date = 'תאריך חייב להיות בעתיד';
    }
  }
  
  if (data.service_type && !Object.values(ServiceType).includes(data.service_type)) {
    errors.service_type = 'סוג שירות לא חוקי';
  }
  
  if (data.duration_minutes !== undefined && (isNaN(data.duration_minutes) || data.duration_minutes <= 0)) {
    errors.duration_minutes = 'משך פגישה חייב להיות מספר חיובי';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
} 