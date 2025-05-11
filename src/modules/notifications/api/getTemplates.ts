import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { NotificationChannel, NotificationTemplate, NotificationType, TemplateFilters } from '../domain/types';
import { notificationService } from '../services/notificationService';

/**
 * API handler for getting notification templates with filtering and pagination
 */
export default async function getTemplatesHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ templates: NotificationTemplate[], totalCount: number }>>
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
    const { 
      page, 
      pageSize, 
      type,
      channel,
      active,
      search
    } = req.query;
    
    // Convert query params to proper types
    const filters: TemplateFilters = {};
    
    if (type) {
      if (Array.isArray(type)) {
        filters.type = type.map(t => t as NotificationType);
      } else {
        filters.type = type as NotificationType;
      }
    }
    
    if (channel) {
      if (Array.isArray(channel)) {
        filters.channel = channel.map(c => c as NotificationChannel);
      } else {
        filters.channel = channel as NotificationChannel;
      }
    }
    
    if (active !== undefined) {
      filters.active = active === 'true';
    }
    
    if (search) {
      filters.search = String(search);
    }
    
    // Convert pagination params
    const pageNumber = page ? parseInt(String(page), 10) : 1;
    const itemsPerPage = pageSize ? parseInt(String(pageSize), 10) : 20;
    
    // Get templates with filters and pagination
    const result = await notificationService.getTemplates(
      filters,
      pageNumber,
      itemsPerPage
    );
    
    // Return response
    return res.status(200).json({
      data: result,
      meta: {
        page: pageNumber,
        pageSize: itemsPerPage,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / itemsPerPage)
      }
    });
  } catch (error) {
    console.error('Error in getTemplates API:', error);
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching notification templates',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 