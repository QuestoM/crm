import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { CreateLeadInput, Lead } from '../domain/types';
import { leadService } from '../services/leadService';
import { LeadValidationError } from '../services/leadService';

/**
 * API handler for creating a new lead
 */
export default async function createLeadHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Lead>>
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
    // Extract lead data from request body
    const leadData: CreateLeadInput = req.body;
    
    // Create lead using service
    const lead = await leadService.createLead(leadData);
    
    // Return response
    return res.status(201).json({
      data: lead,
    });
  } catch (error) {
    console.error('Error in createLead API:', error);
    
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
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while creating the lead',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 