import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { invoiceService } from '../services/invoiceService';

/**
 * API handler for processing overdue invoices
 * This endpoint should be called by a scheduled task or cron job
 */
export default async function processOverdueInvoicesHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ updatedCount: number }>>
) {
  // Only allow POST requests with API key for security
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only POST requests are allowed',
      },
    });
  }
  
  try {
    // Check for API key or other authorization mechanism
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    const expectedApiKey = process.env.INTERNAL_API_KEY;
    
    if (!apiKey || apiKey !== expectedApiKey) {
      return res.status(401).json({
        error: {
          code: 'unauthorized',
          message: 'Missing or invalid API key',
        },
      });
    }
    
    // Process overdue invoices
    const updatedCount = await invoiceService.processOverdueInvoices();
    
    // Return response
    return res.status(200).json({
      data: { updatedCount },
    });
  } catch (error) {
    console.error('Error in processOverdueInvoices API:', error);
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while processing overdue invoices',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 