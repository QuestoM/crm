import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { InvoicePayment, RecordPaymentInput } from '../domain/types';
import { invoiceService, InvoiceValidationError } from '../services/invoiceService';

/**
 * API handler for recording a payment for an invoice
 */
export default async function recordPaymentHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<InvoicePayment>>
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
    // Extract payment data from request body
    const paymentData: RecordPaymentInput = req.body;
    
    // Parse date fields if they are provided as strings
    if (paymentData.payment_date && typeof paymentData.payment_date === 'string') {
      paymentData.payment_date = new Date(paymentData.payment_date);
    }
    
    // Record payment using service
    const payment = await invoiceService.recordPayment(paymentData);
    
    // Return response
    return res.status(201).json({
      data: payment,
    });
  } catch (error) {
    console.error('Error in recordPayment API:', error);
    
    // Handle validation errors
    if (error instanceof InvoiceValidationError) {
      return res.status(400).json({
        error: {
          code: 'validation_error',
          message: 'Payment validation failed',
          details: error.errors,
        },
      });
    }
    
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
      
      if (error.message.includes('כבר שולמה במלואה') || 
          error.message.includes('לא ניתן לרשום תשלום') ||
          error.message.includes('סכום התשלום חורג')) {
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
        message: 'An error occurred while recording the payment',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
}