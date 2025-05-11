/**
 * Available product categories
 */
export const PRODUCT_CATEGORIES = [
  'water_filter',
  'water_bar',
  'replacement_filter',
  'accessory',
  'cleaning_kit',
  'maintenance_kit',
  'part',
  'service',
  'other'
] as const;

/**
 * Map of product categories to Hebrew display text
 */
export const PRODUCT_CATEGORY_DISPLAY: Record<string, string> = {
  'water_filter': 'מסנן מים',
  'water_bar': 'בר מים',
  'replacement_filter': 'פילטר חלופי',
  'accessory': 'אביזר',
  'cleaning_kit': 'ערכת ניקוי',
  'maintenance_kit': 'ערכת תחזוקה',
  'part': 'חלק חילוף',
  'service': 'שירות',
  'other': 'אחר'
};

/**
 * Default values for new products
 */
export const DEFAULT_PRODUCT_VALUES = {
  active: true,
  warranty_months: 12
};

/**
 * Default values for new packages
 */
export const DEFAULT_PACKAGE_VALUES = {
  active: true
}; 