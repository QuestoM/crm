import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Customer, UpdateCustomerInput } from '../domain/types';
import { customerService, CustomerValidationError } from '../services/customerService';

export default async function updateCustomerHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Customer>>
) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only PUT and PATCH requests are allowed',
      },
    });
  }
  
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: {
          code: 'invalid_parameters',
          message: 'Customer ID is required',
        },
      });
    }
    
    const customerData: UpdateCustomerInput = {
      ...req.body,
      id,
    };
    
    const customer = await customerService.updateCustomer(customerData);
    
    return res.status(200).json({
      data: customer,
    });
  } catch (error) {
    console.error('Error in updateCustomer API:', error);
    
    if (error instanceof CustomerValidationError) {
      return res.status(400).json({
        error: {
          code: 'validation_error',
          message: 'Customer validation failed',
          details: error.errors,
        },
      });
    }
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: error.message,
        },
      });
    }
    
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while updating the customer',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 