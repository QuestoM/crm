export enum TimeRange {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  THIS_WEEK = 'THIS_WEEK',
  LAST_WEEK = 'LAST_WEEK',
  THIS_MONTH = 'THIS_MONTH',
  LAST_MONTH = 'LAST_MONTH',
  THIS_QUARTER = 'THIS_QUARTER',
  LAST_QUARTER = 'LAST_QUARTER',
  THIS_YEAR = 'THIS_YEAR',
  LAST_YEAR = 'LAST_YEAR',
  CUSTOM = 'CUSTOM',
}

export enum AnalyticsMetric {
  LEADS_COUNT = 'LEADS_COUNT',
  LEADS_CONVERSION_RATE = 'LEADS_CONVERSION_RATE',
  CUSTOMERS_COUNT = 'CUSTOMERS_COUNT',
  NEW_CUSTOMERS = 'NEW_CUSTOMERS',
  REVENUE = 'REVENUE',
  ORDERS_COUNT = 'ORDERS_COUNT',
  AVERAGE_ORDER_VALUE = 'AVERAGE_ORDER_VALUE',
  INVOICES_COUNT = 'INVOICES_COUNT',
  INVOICES_PAID = 'INVOICES_PAID',
  INVOICES_OVERDUE = 'INVOICES_OVERDUE',
  APPOINTMENTS_COUNT = 'APPOINTMENTS_COUNT',
  APPOINTMENTS_COMPLETED = 'APPOINTMENTS_COMPLETED',
  APPOINTMENTS_CANCELLED = 'APPOINTMENTS_CANCELLED',
  PRODUCT_SALES = 'PRODUCT_SALES',
  CUSTOMER_RETENTION = 'CUSTOMER_RETENTION',
  SALES_BY_CHANNEL = 'SALES_BY_CHANNEL',
}

export enum AnalyticsDimension {
  DATE = 'DATE',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
  PRODUCT = 'PRODUCT',
  PRODUCT_CATEGORY = 'PRODUCT_CATEGORY',
  CUSTOMER = 'CUSTOMER',
  CUSTOMER_SEGMENT = 'CUSTOMER_SEGMENT',
  LEAD_SOURCE = 'LEAD_SOURCE',
  REGION = 'REGION',
  CITY = 'CITY',
  SALES_CHANNEL = 'SALES_CHANNEL',
  PAYMENT_METHOD = 'PAYMENT_METHOD',
}

export interface DataPoint {
  value: number;
  label?: string;
}

export interface TimeSeriesDataPoint extends DataPoint {
  date: string;
}

export interface ChartData {
  series: DataPoint[] | TimeSeriesDataPoint[];
  total?: number;
  average?: number;
  change?: number;
  changePercentage?: number;
}

export interface MetricSummary {
  value: number;
  label: string;
  previousValue?: number;
  change?: number;
  changePercentage?: number;
  trend?: TimeSeriesDataPoint[];
}

export interface DashboardSummary {
  metrics: Record<string, MetricSummary>;
  timeRange: TimeRange;
  from?: Date;
  to?: Date;
}

export interface LeadsAnalytics {
  totalLeads: MetricSummary;
  leadsBySource: ChartData;
  leadsByStatus: ChartData;
  leadConversionRate: MetricSummary;
  timeToConversion: MetricSummary;
  leadsTrend: ChartData;
}

export interface SalesAnalytics {
  totalRevenue: MetricSummary;
  salesByProduct: ChartData;
  salesByCategory: ChartData;
  salesByChannel: ChartData;
  orderCount: MetricSummary;
  averageOrderValue: MetricSummary;
  salesTrend: ChartData;
}

export interface CustomerAnalytics {
  totalCustomers: MetricSummary;
  newCustomers: MetricSummary;
  customerRetentionRate: MetricSummary;
  customersBySegment: ChartData;
  customersByRegion: ChartData;
  customerLifetimeValue: MetricSummary;
  customerAcquisitionCost: MetricSummary;
}

export interface InvoiceAnalytics {
  totalInvoiced: MetricSummary;
  totalPaid: MetricSummary;
  totalOverdue: MetricSummary;
  invoicesByStatus: ChartData;
  averagePaymentTime: MetricSummary;
  invoicesTrend: ChartData;
}

export interface AppointmentAnalytics {
  totalAppointments: MetricSummary;
  appointmentsByStatus: ChartData;
  appointmentsByType: ChartData;
  appointmentCompletionRate: MetricSummary;
  appointmentCancellationRate: MetricSummary;
  appointmentsTrend: ChartData;
}

export interface AnalyticsFilter {
  timeRange: TimeRange;
  from?: Date;
  to?: Date;
  customerId?: string;
  productId?: string;
  category?: string;
  leadSource?: string;
  region?: string;
  city?: string;
  salesChannel?: string;
  customerSegment?: string;
} 