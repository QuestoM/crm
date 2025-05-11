import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { CreatePackageInput, Package } from '../domain/types';
import { packageService, PackageValidationError } from '../services/packageService';

export default async function createPackageHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Package>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only POST requests are allowed',
      },
    });
  }
  
  try {
    const packageData: CreatePackageInput = req.body;
    
    const packageItem = await packageService.createPackage(packageData);
    
    return res.status(201).json({
      data: packageItem,
    });
  } catch (error) {
    console.error('Error in createPackage API:', error);
    
    if (error instanceof PackageValidationError) {
      return res.status(400).json({
        error: {
          code: 'validation_error',
          message: 'Package validation failed',
          details: error.errors,
        },
      });
    }
    
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while creating the package',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 