// src/modules/leads/api/getLeads.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Lead } from '../domain/types';
import { leadService } from '../services/leadService';

/**
 * API handler for getting leads with optional filtering and pagination
 */
export default async function getLeadsHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ leads: Lead[]; totalCount: number }>>
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
    // Extract query parameters
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;
    
    // Extract filters from query
    const filters: Record<string, any> = {};
    
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    if (req.query.lead_source) {
      filters.lead_source = req.query.lead_source;
    }
    
    if (req.query.assigned_to) {
      filters.assigned_to = req.query.assigned_to;
    }
    
    if (req.query.search) {
      filters.search = req.query.search;
    }
    
    if (req.query.date_from) {
      filters.date_from = new Date(req.query.date_from as string);
    }
    
    if (req.query.date_to) {
      filters.date_to = new Date(req.query.date_to as string);
    }
    
    // Get leads from service
    const { leads, totalCount } = await leadService.getLeads(filters, page, pageSize);
    
    // Return response
    return res.status(200).json({
      data: { leads, totalCount },
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error('Error in getLeads API:', error);
    
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching leads',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 