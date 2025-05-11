// src/modules/leads/api/deleteLead.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { leadService } from '../services/leadService';

/**
 * API handler for deleting a lead
 */
export default async function deleteLeadHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ success: boolean }>>
) {
  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only DELETE requests are allowed',
      },
    });
  }
  
  try {
    // Extract lead ID from query parameters
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: {
          code: 'invalid_parameters',
          message: 'Lead ID is required',
        },
      });
    }
    
    // Delete lead using service
    await leadService.deleteLead(id);
    
    // Return response
    return res.status(200).json({
      data: { success: true },
    });
  } catch (error) {
    console.error('Error in deleteLead API:', error);
    
    // Handle not found error
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: error.message,
        },
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while deleting the lead',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 