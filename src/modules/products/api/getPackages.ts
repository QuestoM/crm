import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Package } from '../domain/types';
import { packageService } from '../services/packageService';

export default async function getPackagesHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ packages: Package[]; totalCount: number }>>
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
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;
    
    const filters: Record<string, any> = {};
    
    if (req.query.search) {
      filters.search = req.query.search;
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
    
    if (req.query.contains_product_id) {
      filters.contains_product_id = req.query.contains_product_id as string;
    }
    
    const { packages, totalCount } = await packageService.getPackages(filters, page, pageSize);
    
    return res.status(200).json({
      data: { packages, totalCount },
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error('Error in getPackages API:', error);
    
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching packages',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 