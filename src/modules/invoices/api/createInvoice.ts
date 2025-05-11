import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { CreateInvoiceInput, Invoice } from '../domain/types';
import { invoiceService, InvoiceValidationError } from '../services/invoiceService';

/**
 * API handler for creating a new invoice
 */
export default async function createInvoiceHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Invoice>>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only POST requests are allowed',
      },
    });
  }
  
  try {
    // Extract invoice data from request body
    const invoiceData: CreateInvoiceInput = req.body;
    
    // Parse date fields if they are provided as strings
    if (invoiceData.due_date && typeof invoiceData.due_date === 'string') {
      invoiceData.due_date = new Date(invoiceData.due_date);
    }
    
    // Create invoice using service
    const invoice = await invoiceService.createInvoice(invoiceData);
    
    // Return response
    return res.status(201).json({
      data: invoice,
    });
  } catch (error) {
    console.error('Error in createInvoice API:', error);
    
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
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while creating the invoice',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 