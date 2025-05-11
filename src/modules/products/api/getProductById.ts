import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Product } from '../domain/types';
import { productService } from '../services/productService';

export default async function getProductByIdHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Product>>
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
          message: 'Product ID is required',
        },
      });
    }
    
    const product = await productService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: `Product with ID ${id} not found`,
        },
      });
    }
    
    return res.status(200).json({
      data: product,
    });
  } catch (error) {
    console.error('Error in getProductById API:', error);
    
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching the product',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 