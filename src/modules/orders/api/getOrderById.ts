import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Order } from '../domain/types';
import { orderService } from '../services/orderService';

/**
 * API handler for getting a single order by ID
 */
export default async function getOrderByIdHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Order>>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only GET requests are allowed',
      },
    });
  }
  
  try {
    // Extract parameters
    const { id } = req.query;
    const includeItems = req.query.includeItems !== 'false'; // Default to true
    const includeCustomer = req.query.includeCustomer === 'true';
    const includeProductDetails = req.query.includeProductDetails === 'true';
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: {
          code: 'invalid_parameters',
          message: 'Order ID is required',
        },
      });
    }
    
    // Get order from service
    const order = await orderService.getOrderById(
      id, 
      includeItems, 
      includeCustomer, 
      includeProductDetails
    );
    
    // Check if order exists
    if (!order) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: `Order with ID ${id} not found`,
        },
      });
    }
    
    // Return response
    return res.status(200).json({
      data: order,
    });
  } catch (error) {
    console.error('Error in getOrderById API:', error);
    
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching the order',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 