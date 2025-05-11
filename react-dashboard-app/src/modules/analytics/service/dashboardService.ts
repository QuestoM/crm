import { supabase } from '../../../lib/supabase';
import { 
  DashboardSummary,
  MetricSummary,
  TimeRange,
  AnalyticsFilter,
  TimeSeriesDataPoint,
  AnalyticsMetric
} from '../domain/types';
import { METRIC_LABELS } from '../domain/constants';
import { getDateRangeFromTimeRange, getPreviousPeriodDateRange } from '../utils/dateRanges';
import { validateAnalyticsFilter } from '../domain/validation';

export async function getDashboardSummary(
  filterData: unknown
): Promise<DashboardSummary> {
  const filter = validateAnalyticsFilter(filterData);
  
  // Get date ranges
  const { from, to } = getDateRangeFromTimeRange(
    filter.timeRange, 
    filter.from, 
    filter.to
  );
  
  // Get previous period for comparison
  const { from: prevFrom, to: prevTo } = getPreviousPeriodDateRange(
    filter.timeRange,
    from,
    to
  );
  
  // Fetch metrics for current period
  const [
    totalLeads,
    conversionRate,
    totalCustomers,
    totalRevenue,
    ordersCount,
    appointmentsCount,
    invoicesPaid,
    invoicesOverdue
  ] = await Promise.all([
    getTotalLeads(from, to, filter),
    getLeadConversionRate(from, to, filter),
    getTotalCustomers(from, to, filter),
    getTotalRevenue(from, to, filter),
    getOrdersCount(from, to, filter),
    getAppointmentsCount(from, to, filter),
    getInvoicesPaid(from, to, filter),
    getInvoicesOverdue(from, to, filter)
  ]);
  
  // Fetch metrics for previous period for comparison
  const [
    prevTotalLeads,
    prevConversionRate,
    prevTotalCustomers,
    prevTotalRevenue,
    prevOrdersCount,
    prevAppointmentsCount,
    prevInvoicesPaid,
    prevInvoicesOverdue
  ] = await Promise.all([
    getTotalLeads(prevFrom, prevTo, filter),
    getLeadConversionRate(prevFrom, prevTo, filter),
    getTotalCustomers(prevFrom, prevTo, filter),
    getTotalRevenue(prevFrom, prevTo, filter),
    getOrdersCount(prevFrom, prevTo, filter),
    getAppointmentsCount(prevFrom, prevTo, filter),
    getInvoicesPaid(prevFrom, prevTo, filter),
    getInvoicesOverdue(prevFrom, prevTo, filter)
  ]);
  
  // Calculate trends (for simplicity, we're not implementing the full trends here)
  const emptyTrend: TimeSeriesDataPoint[] = [];
  
  // Calculate metrics with comparisons
  const metrics: Record<string, MetricSummary> = {
    [AnalyticsMetric.LEADS_COUNT]: createMetricSummary(
      totalLeads,
      prevTotalLeads,
      METRIC_LABELS[AnalyticsMetric.LEADS_COUNT],
      emptyTrend
    ),
    [AnalyticsMetric.LEADS_CONVERSION_RATE]: createMetricSummary(
      conversionRate,
      prevConversionRate,
      METRIC_LABELS[AnalyticsMetric.LEADS_CONVERSION_RATE],
      emptyTrend
    ),
    [AnalyticsMetric.CUSTOMERS_COUNT]: createMetricSummary(
      totalCustomers,
      prevTotalCustomers,
      METRIC_LABELS[AnalyticsMetric.CUSTOMERS_COUNT],
      emptyTrend
    ),
    [AnalyticsMetric.REVENUE]: createMetricSummary(
      totalRevenue,
      prevTotalRevenue,
      METRIC_LABELS[AnalyticsMetric.REVENUE],
      emptyTrend
    ),
    [AnalyticsMetric.ORDERS_COUNT]: createMetricSummary(
      ordersCount,
      prevOrdersCount,
      METRIC_LABELS[AnalyticsMetric.ORDERS_COUNT],
      emptyTrend
    ),
    [AnalyticsMetric.APPOINTMENTS_COUNT]: createMetricSummary(
      appointmentsCount,
      prevAppointmentsCount,
      METRIC_LABELS[AnalyticsMetric.APPOINTMENTS_COUNT],
      emptyTrend
    ),
    [AnalyticsMetric.INVOICES_PAID]: createMetricSummary(
      invoicesPaid,
      prevInvoicesPaid,
      METRIC_LABELS[AnalyticsMetric.INVOICES_PAID],
      emptyTrend
    ),
    [AnalyticsMetric.INVOICES_OVERDUE]: createMetricSummary(
      invoicesOverdue,
      prevInvoicesOverdue,
      METRIC_LABELS[AnalyticsMetric.INVOICES_OVERDUE],
      emptyTrend
    ),
  };
  
  return {
    metrics,
    timeRange: filter.timeRange,
    from,
    to
  };
}

function createMetricSummary(
  value: number,
  previousValue: number,
  label: string,
  trend: TimeSeriesDataPoint[]
): MetricSummary {
  const change = value - previousValue;
  const changePercentage = previousValue !== 0 
    ? (change / previousValue) * 100 
    : 0;
    
  return {
    value,
    label,
    previousValue,
    change,
    changePercentage,
    trend
  };
}

// Individual metric calculation functions
async function getTotalLeads(from: Date, to: Date, filter: AnalyticsFilter): Promise<number> {
  const { data, error } = await supabase
    .from('leads')
    .select('id', { count: 'exact' })
    .gte('createdAt', from.toISOString())
    .lte('createdAt', to.toISOString());
    
  if (error) {
    throw new Error(`Failed to get total leads: ${error.message}`);
  }
  
  return data?.length || 0;
}

async function getLeadConversionRate(from: Date, to: Date, filter: AnalyticsFilter): Promise<number> {
  const { data: convertedLeads, error: convertedError } = await supabase
    .from('leads')
    .select('id', { count: 'exact' })
    .eq('status', 'CONVERTED')
    .gte('createdAt', from.toISOString())
    .lte('createdAt', to.toISOString());
    
  const { data: totalLeads, error: totalError } = await supabase
    .from('leads')
    .select('id', { count: 'exact' })
    .gte('createdAt', from.toISOString())
    .lte('createdAt', to.toISOString());
    
  if (convertedError || totalError) {
    throw new Error(`Failed to get lead conversion rate: ${convertedError?.message || totalError?.message}`);
  }
  
  const converted = convertedLeads?.length || 0;
  const total = totalLeads?.length || 0;
  
  return total > 0 ? (converted / total) * 100 : 0;
}

async function getTotalCustomers(from: Date, to: Date, filter: AnalyticsFilter): Promise<number> {
  const { data, error } = await supabase
    .from('customers')
    .select('id', { count: 'exact' })
    .lte('createdAt', to.toISOString());
    
  if (error) {
    throw new Error(`Failed to get total customers: ${error.message}`);
  }
  
  return data?.length || 0;
}

async function getTotalRevenue(from: Date, to: Date, filter: AnalyticsFilter): Promise<number> {
  const { data, error } = await supabase
    .from('invoices')
    .select('total')
    .eq('status', 'PAID')
    .gte('paidAt', from.toISOString())
    .lte('paidAt', to.toISOString());
    
  if (error) {
    throw new Error(`Failed to get total revenue: ${error.message}`);
  }
  
  return data?.reduce((sum, invoice) => sum + (invoice.total || 0), 0) || 0;
}

async function getOrdersCount(from: Date, to: Date, filter: AnalyticsFilter): Promise<number> {
  const { data, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact' })
    .gte('createdAt', from.toISOString())
    .lte('createdAt', to.toISOString());
    
  if (error) {
    throw new Error(`Failed to get orders count: ${error.message}`);
  }
  
  return data?.length || 0;
}

async function getAppointmentsCount(from: Date, to: Date, filter: AnalyticsFilter): Promise<number> {
  const { data, error } = await supabase
    .from('appointments')
    .select('id', { count: 'exact' })
    .gte('scheduledAt', from.toISOString())
    .lte('scheduledAt', to.toISOString());
    
  if (error) {
    throw new Error(`Failed to get appointments count: ${error.message}`);
  }
  
  return data?.length || 0;
}

async function getInvoicesPaid(from: Date, to: Date, filter: AnalyticsFilter): Promise<number> {
  const { data, error } = await supabase
    .from('invoices')
    .select('id', { count: 'exact' })
    .eq('status', 'PAID')
    .gte('paidAt', from.toISOString())
    .lte('paidAt', to.toISOString());
    
  if (error) {
    throw new Error(`Failed to get paid invoices: ${error.message}`);
  }
  
  return data?.length || 0;
}

async function getInvoicesOverdue(from: Date, to: Date, filter: AnalyticsFilter): Promise<number> {
  const now = new Date();
  
  const { data, error } = await supabase
    .from('invoices')
    .select('id', { count: 'exact' })
    .eq('status', 'PENDING')
    .lt('dueDate', now.toISOString());
    
  if (error) {
    throw new Error(`Failed to get overdue invoices: ${error.message}`);
  }
  
  return data?.length || 0;
} 