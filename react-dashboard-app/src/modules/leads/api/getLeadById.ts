import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Lead } from '../domain/types';
import { leadService } from '../services/leadService';

/**
 * API handler for getting a single lead by ID
 */
export default async function getLeadByIdHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Lead>>
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
    
    // Get lead from service
    const lead = await leadService.getLeadById(id);
    
    // Check if lead exists
    if (!lead) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: `Lead with ID ${id} not found`,
        },
      });
    }
    
    // Return response
    return res.status(200).json({
      data: lead,
    });
  } catch (error) {
    console.error('Error in getLeadById API:', error);
    
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching the lead',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 