import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Customer } from '../domain/types';
import { customerService } from '../services/customerService';

export default async function getCustomerByIdHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Customer>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only GET requests are allowed',
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
    
    const customer = await customerService.getCustomerById(id);
    
    if (!customer) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: `Customer with ID ${id} not found`,
        },
      });
    }
    
    return res.status(200).json({
      data: customer,
    });
  } catch (error) {
    console.error('Error in getCustomerById API:', error);
    
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching the customer',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 