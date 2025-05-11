import { NotificationChannel, NotificationPriority, NotificationStatus, NotificationType } from './types';

/**
 * Default notification priority
 */
export const DEFAULT_NOTIFICATION_PRIORITY = NotificationPriority.NORMAL;

/**
 * Default notification status for new notifications
 */
export const DEFAULT_NOTIFICATION_STATUS = NotificationStatus.PENDING;

/**
 * Map of notification types to Hebrew display text
 */
export const NOTIFICATION_TYPE_DISPLAY: Record<NotificationType, string> = {
  // Customer related notifications
  [NotificationType.LEAD_CREATED]: 'ליד חדש נוצר',
  [NotificationType.LEAD_UPDATED]: 'ליד עודכן',
  [NotificationType.LEAD_CONVERTED]: 'ליד הומר ללקוח',
  [NotificationType.CUSTOMER_CREATED]: 'לקוח חדש נוצר',
  [NotificationType.CUSTOMER_UPDATED]: 'פרטי לקוח עודכנו',
  
  // Order related notifications
  [NotificationType.NEW_ORDER]: 'הזמנה חדשה',
  [NotificationType.ORDER_STATUS_CHANGED]: 'סטטוס הזמנה השתנה',
  [NotificationType.ORDER_PAYMENT_STATUS_CHANGED]: 'סטטוס תשלום הזמנה השתנה',
  
  // Invoice related notifications
  [NotificationType.NEW_INVOICE]: 'חשבונית חדשה',
  [NotificationType.INVOICE_STATUS_CHANGED]: 'סטטוס חשבונית השתנה',
  [NotificationType.PAYMENT_RECORDED]: 'תשלום נרשם',
  [NotificationType.INVOICE_OVERDUE]: 'חשבונית באיחור',
  
  // Appointment related notifications
  [NotificationType.NEW_APPOINTMENT]: 'פגישה חדשה',
  [NotificationType.APPOINTMENT_CONFIRMED]: 'פגישה אושרה',
  [NotificationType.APPOINTMENT_CANCELLED]: 'פגישה בוטלה',
  [NotificationType.APPOINTMENT_RESCHEDULED]: 'פגישה נקבעה מחדש',
  [NotificationType.APPOINTMENT_REMINDER]: 'תזכורת לפגישה',
  [NotificationType.APPOINTMENT_COMPLETED]: 'פגישה הושלמה',
  
  // Technician related notifications
  [NotificationType.TECHNICIAN_ASSIGNED]: 'טכנאי הוקצה',
  [NotificationType.TECHNICIAN_APPOINTMENT_CHANGED]: 'פגישת טכנאי השתנתה',
  
  // System notifications
  [NotificationType.SYSTEM_ERROR]: 'שגיאת מערכת',
  [NotificationType.INVENTORY_LOW]: 'מלאי נמוך',
  [NotificationType.WARRANTY_EXPIRING]: 'אחריות פגה בקרוב'
};

/**
 * Map of notification channels to Hebrew display text
 */
export const NOTIFICATION_CHANNEL_DISPLAY: Record<NotificationChannel, string> = {
  [NotificationChannel.EMAIL]: 'אימייל',
  [NotificationChannel.SMS]: 'מסרון',
  [NotificationChannel.PUSH]: 'התראה',
  [NotificationChannel.IN_APP]: 'התראה באפליקציה',
  [NotificationChannel.WHATSAPP]: 'וואטסאפ'
};

/**
 * Map of notification status values to Hebrew display text
 */
export const NOTIFICATION_STATUS_DISPLAY: Record<NotificationStatus, string> = {
  [NotificationStatus.PENDING]: 'ממתין',
  [NotificationStatus.SENT]: 'נשלח',
  [NotificationStatus.DELIVERED]: 'נמסר',
  [NotificationStatus.FAILED]: 'נכשל',
  [NotificationStatus.READ]: 'נקרא',
  [NotificationStatus.CANCELLED]: 'בוטל'
};

/**
 * Map of notification priority values to Hebrew display text
 */
export const NOTIFICATION_PRIORITY_DISPLAY: Record<NotificationPriority, string> = {
  [NotificationPriority.LOW]: 'נמוכה',
  [NotificationPriority.NORMAL]: 'רגילה',
  [NotificationPriority.HIGH]: 'גבוהה',
  [NotificationPriority.URGENT]: 'דחופה'
};

/**
 * Default templates for each notification type and channel
 */
export const DEFAULT_TEMPLATES = {
  [NotificationType.NEW_ORDER]: {
    [NotificationChannel.EMAIL]: {
      subject: 'הזמנה חדשה #{orderId} התקבלה',
      content: 'שלום {customerName},\n\nהזמנה חדשה מספר #{orderId} התקבלה בהצלחה.\n\nסכום ההזמנה: {orderTotal} ₪\n\nתודה שבחרת בנו!'
    },
    [NotificationChannel.SMS]: {
      subject: 'הזמנה חדשה',
      content: 'הזמנה #{orderId} התקבלה בהצלחה. סכום: {orderTotal} ₪. תודה!'
    }
  },
  [NotificationType.APPOINTMENT_REMINDER]: {
    [NotificationChannel.EMAIL]: {
      subject: 'תזכורת לפגישה מחר',
      content: 'שלום {customerName},\n\nברצוננו להזכיר לך על הפגישה שנקבעה למחר, {appointmentDate} בשעה {appointmentTime}, בכתובת {appointmentAddress}.\n\nנשמח לראותך!'
    },
    [NotificationChannel.SMS]: {
      subject: 'תזכורת לפגישה',
      content: 'תזכורת: פגישה מחר ב-{appointmentTime}, {appointmentAddress}. להסרה השב "הסר"'
    }
  }
};

/**
 * Maximum number of notifications to process in a single batch
 */
export const MAX_NOTIFICATIONS_PER_BATCH = 100;

/**
 * Maximum number of retry attempts for failed notifications
 */
export const MAX_RETRY_ATTEMPTS = 3; 