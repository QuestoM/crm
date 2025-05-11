import { NextApiRequest, NextApiResponse } from 'next';
import { getDashboardSummary } from '../service/dashboardService';
import { TimeRange } from '../domain/types';
import { ApiResponse } from '../../../lib/apiResponse';
import { handleApiError } from '../../../lib/errorHandler';

export default async function getDashboardHandler(
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
      leadSource,
      region,
      city,
      salesChannel,
      customerSegment
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
    if (leadSource) filter.leadSource = String(leadSource);
    if (region) filter.region = String(region);
    if (city) filter.city = String(city);
    if (salesChannel) filter.salesChannel = String(salesChannel);
    if (customerSegment) filter.customerSegment = String(customerSegment);

    const dashboardData = await getDashboardSummary(filter);

    return res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    handleApiError(error, res);
  }
} 