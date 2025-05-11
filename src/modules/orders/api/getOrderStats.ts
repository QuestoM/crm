import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { orderService } from '../services/orderService';

/**
 * API handler for getting order statistics
 */
export default async function getOrderStatsHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusCounts: Record<string, number>;
  }>>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only GET requests are allowed',
      },
    });
  }
  
  try {
    // Extract date range from query parameters
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (req.query.startDate) {
      startDate = new Date(req.query.startDate as string);
    }
    
    if (req.query.endDate) {
      endDate = new Date(req.query.endDate as string);
    }
    
    // Get order statistics from service
    const stats = await orderService.getOrderStats(startDate, endDate);
    
    // Return response
    return res.status(200).json({
      data: stats,
    });
  } catch (error) {
    console.error('Error in getOrderStats API:', error);
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching order statistics',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 