import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Package, UpdatePackageInput } from '../domain/types';
import { packageService, PackageValidationError } from '../services/packageService';

export default async function updatePackageHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Package>>
) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only PUT and PATCH requests are allowed',
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
    
    const packageData: UpdatePackageInput = {
      ...req.body,
      id,
    };
    
    const packageItem = await packageService.updatePackage(packageData);
    
    return res.status(200).json({
      data: packageItem,
    });
  } catch (error) {
    console.error('Error in updatePackage API:', error);
    
    if (error instanceof PackageValidationError) {
      return res.status(400).json({
        error: {
          code: 'validation_error',
          message: 'Package validation failed',
          details: error.errors,
        },
      });
    }
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: error.message,
        },
      });
    }
    
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while updating the package',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 