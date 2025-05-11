import { AppointmentPriority, AppointmentStatus, ServiceType } from './types';

/**
 * Default appointment status for new appointments
 */
export const DEFAULT_APPOINTMENT_STATUS = AppointmentStatus.SCHEDULED;

/**
 * Default appointment priority for new appointments
 */
export const DEFAULT_APPOINTMENT_PRIORITY = AppointmentPriority.MEDIUM;

/**
 * Default appointment duration in minutes
 */
export const DEFAULT_APPOINTMENT_DURATION = 60;

/**
 * Map of service types to Hebrew display text
 */
export const SERVICE_TYPE_DISPLAY: Record<ServiceType, string> = {
  [ServiceType.INSTALLATION]: 'התקנה',
  [ServiceType.MAINTENANCE]: 'תחזוקה',
  [ServiceType.REPAIR]: 'תיקון',
  [ServiceType.REPLACEMENT]: 'החלפה',
  [ServiceType.INSPECTION]: 'בדיקה',
  [ServiceType.CONSULTATION]: 'ייעוץ'
};

/**
 * Map of appointment status values to Hebrew display text
 */
export const APPOINTMENT_STATUS_DISPLAY: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'מתוזמן',
  [AppointmentStatus.CONFIRMED]: 'מאושר',
  [AppointmentStatus.IN_PROGRESS]: 'בביצוע',
  [AppointmentStatus.COMPLETED]: 'הושלם',
  [AppointmentStatus.CANCELLED]: 'בוטל',
  [AppointmentStatus.NO_SHOW]: 'לא הגיע'
};

/**
 * Map of appointment priority values to Hebrew display text
 */
export const APPOINTMENT_PRIORITY_DISPLAY: Record<AppointmentPriority, string> = {
  [AppointmentPriority.LOW]: 'נמוכה',
  [AppointmentPriority.MEDIUM]: 'בינונית',
  [AppointmentPriority.HIGH]: 'גבוהה',
  [AppointmentPriority.URGENT]: 'דחופה'
};

/**
 * List of available appointment time slots
 */
export const AVAILABLE_TIME_SLOTS = [
  '08:00-10:00',
  '10:00-12:00',
  '12:00-14:00',
  '14:00-16:00',
  '16:00-18:00'
];

/**
 * Default business hours for scheduling appointments
 */
export const BUSINESS_HOURS = {
  start: '08:00',
  end: '18:00'
};

/**
 * Maximum appointments allowed per technician per day
 */
export const MAX_APPOINTMENTS_PER_TECHNICIAN = 5;

/**
 * Business days for scheduling appointments (0 = Sunday, 6 = Saturday)
 */
export const BUSINESS_DAYS = [0, 1, 2, 3, 4]; // Sunday to Thursday in Israel 