import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Customer, CreateCustomerInput } from '../domain/types';
import { customerService, CustomerValidationError } from '../services/customerService';

/**
 * API handler for creating a new customer
 */
export default async function createCustomerHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Customer>>
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
    // Extract customer data from request body
    const customerData: CreateCustomerInput = req.body;
    
    // Create customer using service
    const customer = await customerService.createCustomer(customerData);
    
    // Return response
    return res.status(201).json({
      data: customer,
    });
  } catch (error) {
    console.error('Error in createCustomer API:', error);
    
    // Handle validation errors
    if (error instanceof CustomerValidationError) {
      return res.status(400).json({
        error: {
          code: 'validation_error',
          message: 'Customer validation failed',
          details: error.errors,
        },
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while creating the customer',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 