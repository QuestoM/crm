import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { CreateOrderInput, Order } from '../domain/types';
import { orderService, OrderValidationError } from '../services/orderService';

/**
 * API handler for creating a new order
 */
export default async function createOrderHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Order>>
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
    // Extract order data from request body
    const orderData: CreateOrderInput = req.body;
    
    // Create order using service
    const order = await orderService.createOrder(orderData);
    
    // Return response
    return res.status(201).json({
      data: order,
    });
  } catch (error) {
    console.error('Error in createOrder API:', error);
    
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
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while creating the order',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 