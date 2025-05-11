import { NextApiRequest, NextApiResponse } from 'next';
import { getSalesAnalytics } from '../service/salesAnalyticsService';
import { TimeRange } from '../domain/types';
import { ApiResponse } from '../../../lib/apiResponse';
import { handleApiError } from '../../../lib/errorHandler';

export default async function getSalesAnalyticsHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only GET method is allowed'
        }
      });
    }

    const {
      timeRange = TimeRange.THIS_MONTH,
      from,
      to,
      customerId,
      productId,
      category,
      salesChannel,
      region,
      city
    } = req.query;

    const filter: any = {
      timeRange: String(timeRange)
    };

    // Parse query parameters
    if (from) filter.from = new Date(String(from));
    if (to) filter.to = new Date(String(to));
    if (customerId) filter.customerId = String(customerId);
    if (productId) filter.productId = String(productId);
    if (category) filter.category = String(category);
    if (salesChannel) filter.salesChannel = String(salesChannel);
    if (region) filter.region = String(region);
    if (city) filter.city = String(city);

    const salesAnalyticsData = await getSalesAnalytics(filter);

    return res.status(200).json({
      success: true,
      data: salesAnalyticsData
    });
  } catch (error) {
    handleApiError(error, res);
  }
} 