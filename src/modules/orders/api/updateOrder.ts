import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Order, UpdateOrderInput } from '../domain/types';
import { orderService, OrderValidationError } from '../services/orderService';

/**
 * API handler for updating an existing order
 */
export default async function updateOrderHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Order>>
) {
  // Only allow PUT and PATCH requests
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only PUT and PATCH requests are allowed',
      },
    });
  }
  
  try {
    // Extract order ID from query parameters
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: {
          code: 'invalid_parameters',
          message: 'Order ID is required',
        },
      });
    }
    
    // Extract order data from request body and add ID
    const orderData: UpdateOrderInput = {
      ...req.body,
      id,
    };
    
    // Update order using service
    const order = await orderService.updateOrder(orderData);
    
    // Return response
    return res.status(200).json({
      data: order,
    });
  } catch (error) {
    console.error('Error in updateOrder API:', error);
    
    // Handle validation errors
    if (error instanceof OrderValidationError) {
      return res.status(400).json({
        error: {
          code: 'validation_error',
          message: 'Order validation failed',
          details: error.errors,
        },
      });
    }
    
    // Handle not found error
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
        message: 'An error occurred while updating the order',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 