import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { validateBody } from '../../../../lib/validation';
import { handleApiError } from '../../../../lib/errorHandler';
import { createWarranty } from '../../service/warrantyService';
import { WarrantyCreateSchema } from '../../domain/validation';

/**
 * @api {post} /api/inventory/warranties Create a warranty
 * @apiName CreateWarranty
 * @apiGroup Warranties
 * @apiDescription Create a new warranty for a product
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: { 
        code: 'method_not_allowed',
        message: 'Method not allowed' 
      } 
    });
  }

  try {
    // Validate request body
    const data = validateBody(req.body, WarrantyCreateSchema);
    
    // Create warranty
    const result = await createWarranty(data);
    
    // Return result
    return res.status(201).json(result);
  } catch (error) {
    return handleApiError(error, 'Failed to create warranty');
  }
} 