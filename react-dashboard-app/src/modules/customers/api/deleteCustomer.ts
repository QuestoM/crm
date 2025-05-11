import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { customerService } from '../services/customerService';

export default async function deleteCustomerHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ success: boolean }>>
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only DELETE requests are allowed',
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
    
    await customerService.deleteCustomer(id);
    
    return res.status(200).json({
      data: { success: true },
    });
  } catch (error) {
    console.error('Error in deleteCustomer API:', error);
    
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
        message: 'An error occurred while deleting the customer',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 