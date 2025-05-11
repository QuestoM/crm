// src/modules/orders/api/getOrders.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Order, OrderStatus, PaymentStatus } from '../domain/types';
import { orderService } from '../services/orderService';

/**
 * API handler for getting orders with optional filtering and pagination
 */
export default async function getOrdersHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ orders: Order[]; totalCount: number }>>
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
    // Extract query parameters
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;
    const includeItems = req.query.includeItems === 'true';
    const includeCustomer = req.query.includeCustomer === 'true';
    
    // Extract filters from query
    const filters: Record<string, any> = {};
    
    if (req.query.customer_id) {
      filters.customer_id = req.query.customer_id;
    }
    
    if (req.query.status) {
      // Handle multiple statuses as comma-separated values
      const statusParam = req.query.status as string;
      if (statusParam.includes(',')) {
        filters.status = statusParam.split(',').filter(status => 
          Object.values(OrderStatus).includes(status as OrderStatus)
        );
      } else if (Object.values(OrderStatus).includes(statusParam as OrderStatus)) {
        filters.status = statusParam;
      }
    }
    
    if (req.query.payment_status) {
      // Handle multiple payment statuses as comma-separated values
      const paymentStatusParam = req.query.payment_status as string;
      if (paymentStatusParam.includes(',')) {
        filters.payment_status = paymentStatusParam.split(',').filter(status => 
          Object.values(PaymentStatus).includes(status as PaymentStatus)
        );
      } else if (Object.values(PaymentStatus).includes(paymentStatusParam as PaymentStatus)) {
        filters.payment_status = paymentStatusParam;
      }
    }
    
    if (req.query.date_from) {
      filters.date_from = new Date(req.query.date_from as string);
    }
    
    if (req.query.date_to) {
      filters.date_to = new Date(req.query.date_to as string);
    }
    
    if (req.query.min_total) {
      filters.min_total = parseFloat(req.query.min_total as string);
    }
    
    if (req.query.max_total) {
      filters.max_total = parseFloat(req.query.max_total as string);
    }
    
    if (req.query.search) {
      filters.search = req.query.search;
    }
    
    // Get orders from service
    const { orders, totalCount } = await orderService.getOrders(
      filters, 
      page, 
      pageSize, 
      includeItems, 
      includeCustomer
    );
    
    // Return response
    return res.status(200).json({
      data: { orders, totalCount },
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error('Error in getOrders API:', error);
    
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching orders',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 