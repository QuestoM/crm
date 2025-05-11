import { supabase } from '../../../lib/supabase';
import { 
  SalesAnalytics,
  AnalyticsFilter,
  MetricSummary,
  ChartData,
  DataPoint,
  TimeSeriesDataPoint,
} from '../domain/types';
import { getDateRangeFromTimeRange, getPreviousPeriodDateRange } from '../utils/dateRanges';
import { validateAnalyticsFilter } from '../domain/validation';

export async function getSalesAnalytics(
  filterData: unknown
): Promise<SalesAnalytics> {
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
  
  // Fetch metrics
  const [
    totalRevenueValue,
    prevTotalRevenueValue,
    salesByProduct,
    salesByCategory,
    salesByChannel,
    orderCountValue,
    prevOrderCountValue,
    avgOrderValueValue,
    prevAvgOrderValueValue,
    salesTrend
  ] = await Promise.all([
    getTotalRevenue(from, to, filter),
    getTotalRevenue(prevFrom, prevTo, filter),
    getSalesByProduct(from, to, filter),
    getSalesByCategory(from, to, filter),
    getSalesByChannel(from, to, filter),
    getOrderCount(from, to, filter),
    getOrderCount(prevFrom, prevTo, filter),
    getAverageOrderValue(from, to, filter),
    getAverageOrderValue(prevFrom, prevTo, filter),
    getSalesTrend(from, to, filter)
  ]);
  
  // Create metric summaries
  const totalRevenue: MetricSummary = {
    value: totalRevenueValue,
    label: 'Total Revenue',
    previousValue: prevTotalRevenueValue,
    change: totalRevenueValue - prevTotalRevenueValue,
    changePercentage: prevTotalRevenueValue !== 0 
      ? ((totalRevenueValue - prevTotalRevenueValue) / prevTotalRevenueValue) * 100 
      : 0,
  };
  
  const orderCount: MetricSummary = {
    value: orderCountValue,
    label: 'Total Orders',
    previousValue: prevOrderCountValue,
    change: orderCountValue - prevOrderCountValue,
    changePercentage: prevOrderCountValue !== 0 
      ? ((orderCountValue - prevOrderCountValue) / prevOrderCountValue) * 100 
      : 0,
  };
  
  const averageOrderValue: MetricSummary = {
    value: avgOrderValueValue,
    label: 'Average Order Value',
    previousValue: prevAvgOrderValueValue,
    change: avgOrderValueValue - prevAvgOrderValueValue,
    changePercentage: prevAvgOrderValueValue !== 0 
      ? ((avgOrderValueValue - prevAvgOrderValueValue) / prevAvgOrderValueValue) * 100 
      : 0,
  };
  
  return {
    totalRevenue,
    salesByProduct,
    salesByCategory,
    salesByChannel,
    orderCount,
    averageOrderValue,
    salesTrend
  };
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

async function getSalesByProduct(from: Date, to: Date, filter: AnalyticsFilter): Promise<ChartData> {
  // In a real implementation, this would join order_items with products
  // For simplicity, we'll return simulated data
  
  const series: DataPoint[] = [
    { label: 'Basic Package', value: 12500 },
    { label: 'Premium Package', value: 24800 },
    { label: 'Enterprise Package', value: 45000 },
    { label: 'Consultation', value: 8900 },
    { label: 'Support Package', value: 7600 },
  ];
  
  const total = series.reduce((sum, point) => sum + point.value, 0);
  
  return {
    series,
    total
  };
}

async function getSalesByCategory(from: Date, to: Date, filter: AnalyticsFilter): Promise<ChartData> {
  // In a real implementation, this would join products with categories
  // For simplicity, we'll return simulated data
  
  const series: DataPoint[] = [
    { label: 'Software', value: 37300 },
    { label: 'Hardware', value: 29800 },
    { label: 'Services', value: 16500 },
    { label: 'Training', value: 9200 },
    { label: 'Support', value: 6000 },
  ];
  
  const total = series.reduce((sum, point) => sum + point.value, 0);
  
  return {
    series,
    total
  };
}

async function getSalesByChannel(from: Date, to: Date, filter: AnalyticsFilter): Promise<ChartData> {
  // In a real implementation, this would access the sales channel on orders
  // For simplicity, we'll return simulated data
  
  const series: DataPoint[] = [
    { label: 'Direct Sales', value: 48000 },
    { label: 'Online', value: 32500 },
    { label: 'Referral', value: 18600 },
    { label: 'Partner', value: 12700 },
  ];
  
  const total = series.reduce((sum, point) => sum + point.value, 0);
  
  return {
    series,
    total
  };
}

async function getOrderCount(from: Date, to: Date, filter: AnalyticsFilter): Promise<number> {
  const { data, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact' })
    .gte('createdAt', from.toISOString())
    .lte('createdAt', to.toISOString());
    
  if (error) {
    throw new Error(`Failed to get order count: ${error.message}`);
  }
  
  return data?.length || 0;
}

async function getAverageOrderValue(from: Date, to: Date, filter: AnalyticsFilter): Promise<number> {
  const { data, error } = await supabase
    .from('orders')
    .select('total')
    .gte('createdAt', from.toISOString())
    .lte('createdAt', to.toISOString());
    
  if (error) {
    throw new Error(`Failed to get average order value: ${error.message}`);
  }
  
  if (!data || data.length === 0) {
    return 0;
  }
  
  const total = data.reduce((sum, order) => sum + (order.total || 0), 0);
  return total / data.length;
}

async function getSalesTrend(from: Date, to: Date, filter: AnalyticsFilter): Promise<ChartData> {
  // For simplicity, we'll return a simulated trend
  // In a real implementation, this would aggregate orders by day/week/month
  
  const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  const series: TimeSeriesDataPoint[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(from);
    date.setDate(date.getDate() + i);
    
    // Generate a realistic-looking trend with some spikes
    let value = Math.floor(Math.random() * 3000) + 1000;
    
    // Add some weekly patterns (higher on weekends)
    if (date.getDay() === 0 || date.getDay() === 6) {
      value = value * 1.5;
    }
    
    series.push({
      date: date.toISOString().split('T')[0],
      value,
      label: date.toLocaleDateString()
    });
  }
  
  const total = series.reduce((sum, point) => sum + point.value, 0);
  const average = total / series.length;
  
  return {
    series,
    total,
    average
  };
} 