import { TimeRange, AnalyticsMetric, AnalyticsDimension } from './types';

export const TIME_RANGES = Object.values(TimeRange);
export const ANALYTICS_METRICS = Object.values(AnalyticsMetric);
export const ANALYTICS_DIMENSIONS = Object.values(AnalyticsDimension);

export const DEFAULT_TIME_RANGE = TimeRange.THIS_MONTH;
export const DEFAULT_DASHBOARD_METRICS = [
  AnalyticsMetric.LEADS_COUNT,
  AnalyticsMetric.LEADS_CONVERSION_RATE,
  AnalyticsMetric.CUSTOMERS_COUNT,
  AnalyticsMetric.REVENUE,
  AnalyticsMetric.ORDERS_COUNT,
  AnalyticsMetric.AVERAGE_ORDER_VALUE,
  AnalyticsMetric.INVOICES_PAID,
  AnalyticsMetric.INVOICES_OVERDUE,
  AnalyticsMetric.APPOINTMENTS_COUNT,
];

export const METRIC_LABELS: Record<AnalyticsMetric, string> = {
  [AnalyticsMetric.LEADS_COUNT]: 'Total Leads',
  [AnalyticsMetric.LEADS_CONVERSION_RATE]: 'Lead Conversion Rate',
  [AnalyticsMetric.CUSTOMERS_COUNT]: 'Total Customers',
  [AnalyticsMetric.NEW_CUSTOMERS]: 'New Customers',
  [AnalyticsMetric.REVENUE]: 'Total Revenue',
  [AnalyticsMetric.ORDERS_COUNT]: 'Order Count',
  [AnalyticsMetric.AVERAGE_ORDER_VALUE]: 'Average Order Value',
  [AnalyticsMetric.INVOICES_COUNT]: 'Invoice Count',
  [AnalyticsMetric.INVOICES_PAID]: 'Invoices Paid',
  [AnalyticsMetric.INVOICES_OVERDUE]: 'Overdue Invoices',
  [AnalyticsMetric.APPOINTMENTS_COUNT]: 'Appointment Count',
  [AnalyticsMetric.APPOINTMENTS_COMPLETED]: 'Completed Appointments',
  [AnalyticsMetric.APPOINTMENTS_CANCELLED]: 'Cancelled Appointments',
  [AnalyticsMetric.PRODUCT_SALES]: 'Product Sales',
  [AnalyticsMetric.CUSTOMER_RETENTION]: 'Customer Retention Rate',
  [AnalyticsMetric.SALES_BY_CHANNEL]: 'Sales by Channel',
};

export const DIMENSION_LABELS: Record<AnalyticsDimension, string> = {
  [AnalyticsDimension.DATE]: 'Date',
  [AnalyticsDimension.MONTH]: 'Month',
  [AnalyticsDimension.QUARTER]: 'Quarter',
  [AnalyticsDimension.YEAR]: 'Year',
  [AnalyticsDimension.PRODUCT]: 'Product',
  [AnalyticsDimension.PRODUCT_CATEGORY]: 'Product Category',
  [AnalyticsDimension.CUSTOMER]: 'Customer',
  [AnalyticsDimension.CUSTOMER_SEGMENT]: 'Customer Segment',
  [AnalyticsDimension.LEAD_SOURCE]: 'Lead Source',
  [AnalyticsDimension.REGION]: 'Region',
  [AnalyticsDimension.CITY]: 'City',
  [AnalyticsDimension.SALES_CHANNEL]: 'Sales Channel',
  [AnalyticsDimension.PAYMENT_METHOD]: 'Payment Method',
};

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  [TimeRange.TODAY]: 'Today',
  [TimeRange.YESTERDAY]: 'Yesterday',
  [TimeRange.THIS_WEEK]: 'This Week',
  [TimeRange.LAST_WEEK]: 'Last Week',
  [TimeRange.THIS_MONTH]: 'This Month',
  [TimeRange.LAST_MONTH]: 'Last Month',
  [TimeRange.THIS_QUARTER]: 'This Quarter',
  [TimeRange.LAST_QUARTER]: 'Last Quarter',
  [TimeRange.THIS_YEAR]: 'This Year',
  [TimeRange.LAST_YEAR]: 'Last Year',
  [TimeRange.CUSTOM]: 'Custom Range',
}; 