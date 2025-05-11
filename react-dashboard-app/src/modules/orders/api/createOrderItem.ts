import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { CreateOrderItemInput, OrderItem } from '../domain/types';
import { orderService, OrderValidationError } from '../services/orderService';

/**
 * API handler for adding an item to an order
 */
export default async function createOrderItemHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<OrderItem>>
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
    // Extract order ID from query parameters
    const { orderId } = req.query;
    
    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({
        error: {
          code: 'invalid_parameters',
          message: 'Order ID is required',
        },
      });
    }
    
    // Extract item data from request body and add order ID
    const itemData: CreateOrderItemInput = {
      ...req.body,
      order_id: orderId,
    };
    
    // Add item to order using service
    const item = await orderService.addOrderItem(itemData);
    
    // Return response
    return res.status(201).json({
      data: item,
    });
  } catch (error) {
    console.error('Error in createOrderItem API:', error);
    
    // Handle validation errors
    if (error instanceof OrderValidationError) {
      return res.status(400).json({
        error: {
          code: 'validation_error',
          message: 'Order item validation failed',
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
        message: 'An error occurred while adding the item to the order',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 