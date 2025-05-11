import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { CreateProductInput, Product } from '../domain/types';
import { productService, ProductValidationError } from '../services/productService';

/**
 * API handler for creating a new product
 */
export default async function createProductHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Product>>
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
    // Extract product data from request body
    const productData: CreateProductInput = req.body;
    
    // Create product using service
    const product = await productService.createProduct(productData);
    
    // Return response
    return res.status(201).json({
      data: product,
    });
  } catch (error) {
    console.error('Error in createProduct API:', error);
    
    // Handle validation errors
    if (error instanceof ProductValidationError) {
      return res.status(400).json({
        error: {
          code: 'validation_error',
          message: 'Product validation failed',
          details: error.errors,
        },
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while creating the product',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 