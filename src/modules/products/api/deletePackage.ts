import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { packageService } from '../services/packageService';

export default async function deletePackageHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ success: boolean }>>
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only DELETE requests are allowed',
      },
    });
  }
  
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: {
          code: 'invalid_parameters',
          message: 'Package ID is required',
        },
      });
    }
    
    await packageService.deletePackage(id);
    
    return res.status(200).json({
      data: { success: true },
    });
  } catch (error) {
    console.error('Error in deletePackage API:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: error.message,
        },
      });
    }
    
    // Handle business rule errors (e.g., package in use)
    if (error instanceof Error && error.message.includes('בשימוש')) {
      return res.status(409).json({
        error: {
          code: 'business_rule_violation',
          message: error.message,
        },
      });
    }
    
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while deleting the package',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 