import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Lead, UpdateLeadInput } from '../domain/types';
import { leadService } from '../services/leadService';
import { LeadValidationError } from '../services/leadService';

/**
 * API handler for updating an existing lead
 */
export default async function updateLeadHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Lead>>
) {
  // Only allow PUT and PATCH requests
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only PUT and PATCH requests are allowed',
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
    
    // Extract lead data from request body and add ID
    const leadData: UpdateLeadInput = {
      ...req.body,
      id,
    };
    
    // Update lead using service
    const lead = await leadService.updateLead(leadData);
    
    // Return response
    return res.status(200).json({
      data: lead,
    });
  } catch (error) {
    console.error('Error in updateLead API:', error);
    
    // Handle validation errors
    if (error instanceof LeadValidationError) {
      return res.status(400).json({
        error: {
          code: 'validation_error',
          message: 'Lead validation failed',
          details: error.errors,
        },
      });
    }
    
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
        message: 'An error occurred while updating the lead',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 