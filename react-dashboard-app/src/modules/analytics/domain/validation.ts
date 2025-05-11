import { z } from 'zod';
import { 
  TimeRange, 
  AnalyticsMetric, 
  AnalyticsDimension, 
  AnalyticsFilter 
} from './types';

export const timeRangeSchema = z.nativeEnum(TimeRange);

export const analyticsMetricSchema = z.nativeEnum(AnalyticsMetric);

export const analyticsDimensionSchema = z.nativeEnum(AnalyticsDimension);

export const analyticsFilterSchema = z.object({
  timeRange: timeRangeSchema.default(TimeRange.THIS_MONTH),
  from: z.date().optional(),
  to: z.date().optional(),
  customerId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  category: z.string().optional(),
  leadSource: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  salesChannel: z.string().optional(),
  customerSegment: z.string().optional(),
}).refine(
  (data) => {
    // If timeRange is CUSTOM, both from and to must be provided
    if (data.timeRange === TimeRange.CUSTOM) {
      return data.from !== undefined && data.to !== undefined;
    }
    return true;
  },
  {
    message: 'Custom time range requires both from and to dates',
    path: ['from', 'to'],
  }
);

export const dashboardConfigSchema = z.object({
  metrics: z.array(analyticsMetricSchema),
  timeRange: timeRangeSchema.default(TimeRange.THIS_MONTH),
  from: z.date().optional(),
  to: z.date().optional(),
});

export function validateAnalyticsFilter(data: unknown): AnalyticsFilter {
  return analyticsFilterSchema.parse(data);
}

export function validateDashboardConfig(data: unknown) {
  return dashboardConfigSchema.parse(data);
} 