import { LeadStatus } from './types';

/**
 * Default status for newly created leads
 */
export const DEFAULT_LEAD_STATUS = LeadStatus.NEW;

/**
 * Available lead sources
 */
export const LEAD_SOURCES = [
  'אתר אינטרנט',
  'המלצה',
  'פייסבוק',
  'אינסטגרם',
  'גוגל',
  'שיחת טלפון',
  'תערוכה',
  'אחר'
];

/**
 * Map of status values to Hebrew display text
 */
export const LEAD_STATUS_DISPLAY: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'חדש',
  [LeadStatus.CONTACTED]: 'נוצר קשר',
  [LeadStatus.QUALIFIED]: 'מוסמך',
  [LeadStatus.PROPOSAL]: 'הצעת מחיר נשלחה',
  [LeadStatus.NEGOTIATION]: 'במשא ומתן',
  [LeadStatus.WON]: 'זכה',
  [LeadStatus.LOST]: 'אבד',
  [LeadStatus.DORMANT]: 'רדום'
};

/**
 * Map of lead sources to Hebrew display text
 */
export const LEAD_SOURCE_DISPLAY: Record<string, string> = {
  'website': 'אתר אינטרנט',
  'phone_call': 'שיחת טלפון',
  'referral': 'הפניה',
  'social_media': 'מדיה חברתית',
  'google_ads': 'גוגל אדס',
  'facebook_ads': 'פייסבוק אדס',
  'email_campaign': 'קמפיין אימייל',
  'exhibition': 'תערוכה',
  'other': 'אחר'
};

export const LEAD_PAGINATION_DEFAULT_LIMIT = 20;
export const LEAD_PAGINATION_MAX_LIMIT = 100; 