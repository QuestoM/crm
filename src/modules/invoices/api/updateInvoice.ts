import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Invoice, UpdateInvoiceInput } from '../domain/types';
import { invoiceService, InvoiceValidationError } from '../services/invoiceService';

/**
 * API handler for updating an invoice
 */
export default async function updateInvoiceHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Invoice>>
) {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only PUT requests are allowed',
      },
    });
  }
  
  try {
    // Extract invoice data from request body
    const invoiceData: UpdateInvoiceInput = req.body;
    
    // Parse date fields if they are provided as strings
    if (invoiceData.due_date && typeof invoiceData.due_date === 'string') {
      invoiceData.due_date = new Date(invoiceData.due_date);
    }
    
    if (invoiceData.paid_at && typeof invoiceData.paid_at === 'string') {
      invoiceData.paid_at = new Date(invoiceData.paid_at);
    }
    
    // Update invoice using service
    const invoice = await invoiceService.updateInvoice(invoiceData);
    
    // Return response
    return res.status(200).json({
      data: invoice,
    });
  } catch (error) {
    console.error('Error in updateInvoice API:', error);
    
    // Handle validation errors
    if (error instanceof InvoiceValidationError) {
      return res.status(400).json({
        error: {
          code: 'validation_error',
          message: 'Invoice validation failed',
          details: error.errors,
        },
      });
    }
    
    // Handle not found errors
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: error.message,
        },
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while updating the invoice',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 