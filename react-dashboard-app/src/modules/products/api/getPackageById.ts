import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Package } from '../domain/types';
import { packageService } from '../services/packageService';

export default async function getPackageByIdHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Package>>
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
          message: 'Package ID is required',
        },
      });
    }
    
    const packageItem = await packageService.getPackageById(id);
    
    if (!packageItem) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: `Package with ID ${id} not found`,
        },
      });
    }
    
    return res.status(200).json({
      data: packageItem,
    });
  } catch (error) {
    console.error('Error in getPackageById API:', error);
    
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching the package',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 