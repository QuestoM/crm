import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Invoice } from '../domain/types';
import { invoiceService } from '../services/invoiceService';

/**
 * API handler for getting an invoice by order ID
 */
export default async function getInvoiceByOrderIdHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Invoice>>
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
    // Extract order ID from query parameters
    const { order_id, include_payments } = req.query;
    
    if (!order_id) {
      return res.status(400).json({
        error: {
          code: 'bad_request',
          message: 'Order ID is required',
        },
      });
    }
    
    // Convert boolean params
    const includePayments = include_payments !== 'false'; // True by default
    
    // Get invoice by order ID
    const invoice = await invoiceService.getInvoiceByOrderId(
      String(order_id),
      includePayments
    );
    
    if (!invoice) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: `Invoice for order ${order_id} not found`,
        },
      });
    }
    
    // Return response
    return res.status(200).json({
      data: invoice,
    });
  } catch (error) {
    console.error('Error in getInvoiceByOrderId API:', error);
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching the invoice',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 