import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { invoiceService } from '../services/invoiceService';

/**
 * API handler for getting invoice statistics
 */
export default async function getInvoiceStatsHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
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
    const { start_date, end_date } = req.query;
    
    let startDate: Date | undefined = undefined;
    let endDate: Date | undefined = undefined;
    
    if (start_date) {
      startDate = new Date(String(start_date));
    }
    
    if (end_date) {
      endDate = new Date(String(end_date));
    }
    
    // Get invoice statistics
    const stats = await invoiceService.getInvoiceStats(startDate, endDate);
    
    // Return response
    return res.status(200).json({
      data: stats,
    });
  } catch (error) {
    console.error('Error in getInvoiceStats API:', error);
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching invoice statistics',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 