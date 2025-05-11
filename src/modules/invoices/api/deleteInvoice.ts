import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { invoiceService } from '../services/invoiceService';

/**
 * API handler for deleting an invoice
 */
export default async function deleteInvoiceHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ success: boolean }>>
) {
  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only DELETE requests are allowed',
      },
    });
  }
  
  try {
    // Extract invoice ID from query parameters
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        error: {
          code: 'bad_request',
          message: 'Invoice ID is required',
        },
      });
    }
    
    // Delete invoice using service
    const success = await invoiceService.deleteInvoice(String(id));
    
    // Return response
    return res.status(200).json({
      data: { success },
    });
  } catch (error) {
    console.error('Error in deleteInvoice API:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: {
            code: 'not_found',
            message: error.message,
          },
        });
      }
      
      if (error.message.includes('לא ניתן למחוק')) {
        return res.status(400).json({
          error: {
            code: 'operation_not_allowed',
            message: error.message,
          },
        });
      }
    }
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while deleting the invoice',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 