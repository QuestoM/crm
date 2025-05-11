import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { NotificationTemplate } from '../domain/types';
import { notificationService } from '../services/notificationService';

/**
 * API handler for getting a notification template by ID
 */
export default async function getTemplateByIdHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<NotificationTemplate>>
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
  
  // Extract template ID from query
  const { id } = req.query;
  
  // Validate template ID
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      error: {
        code: 'invalid_request',
        message: 'Template ID is required',
      },
    });
  }
  
  try {
    // Get template by ID
    const template = await notificationService.getTemplateById(id);
    
    // Check if template exists
    if (!template) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: `Template with ID ${id} not found`,
        },
      });
    }
    
    // Return template
    return res.status(200).json({
      data: template,
    });
  } catch (error) {
    console.error('Error in getTemplateById API:', error);
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching the notification template',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 