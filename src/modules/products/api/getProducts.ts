import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Product } from '../domain/types';
import { productService } from '../services/productService';

/**
 * API handler for getting products with optional filtering and pagination
 */
export default async function getProductsHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ products: Product[]; totalCount: number }>>
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
    
    if (req.query.category) {
      filters.category = req.query.category;
    }
    
    if (req.query.active !== undefined) {
      filters.active = req.query.active === 'true';
    }
    
    if (req.query.min_price) {
      filters.min_price = parseFloat(req.query.min_price as string);
    }
    
    if (req.query.max_price) {
      filters.max_price = parseFloat(req.query.max_price as string);
    }
    
    if (req.query.has_warranty !== undefined) {
      filters.has_warranty = req.query.has_warranty === 'true';
    }
    
    // Get products from service
    const { products, totalCount } = await productService.getProducts(filters, page, pageSize);
    
    // Return response
    return res.status(200).json({
      data: { products, totalCount },
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error('Error in getProducts API:', error);
    
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching products',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 