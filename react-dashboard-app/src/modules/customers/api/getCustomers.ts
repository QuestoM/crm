// src/modules/customers/api/getCustomers.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Customer } from '../domain/types';
import { customerService } from '../services/customerService';

/**
 * API handler for getting customers with optional filtering and pagination
 */
export default async function getCustomersHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ customers: Customer[]; totalCount: number }>>
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
    
    // Extract filters from query
    const filters: Record<string, any> = {};
    
    if (req.query.search) {
      filters.search = req.query.search;
    }
    
    if (req.query.city) {
      filters.city = req.query.city;
    }
    
    if (req.query.date_from) {
      filters.date_from = new Date(req.query.date_from as string);
    }
    
    if (req.query.date_to) {
      filters.date_to = new Date(req.query.date_to as string);
    }
    
    if (req.query.has_orders) {
      filters.has_orders = req.query.has_orders === 'true';
    }
    
    if (req.query.has_warranty) {
      filters.has_warranty = req.query.has_warranty === 'true';
    }
    
    // Get customers from service
    const { customers, totalCount } = await customerService.getCustomers(filters, page, pageSize);
    
    // Return response
    return res.status(200).json({
      data: { customers, totalCount },
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error('Error in getCustomers API:', error);
    
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching customers',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 