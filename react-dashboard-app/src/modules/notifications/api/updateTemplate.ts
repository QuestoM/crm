import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { NotificationTemplate, UpdateTemplateInput } from '../domain/types';
import { notificationService, NotificationValidationError } from '../services/notificationService';

/**
 * API handler for updating an existing notification template
 */
export default async function updateTemplateHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<NotificationTemplate>>
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
    // Extract template data from request body
    const templateData: UpdateTemplateInput = req.body;
    
    // Validate template ID
    if (!templateData.id) {
      return res.status(400).json({
        error: {
          code: 'invalid_request',
          message: 'Template ID is required',
        },
      });
    }
    
    // Update template
    const template = await notificationService.updateTemplate(templateData);
    
    // Return updated template
    return res.status(200).json({
      data: template,
    });
  } catch (error) {
    console.error('Error in updateTemplate API:', error);
    
    // Handle validation errors
    if (error instanceof NotificationValidationError) {
      return res.status(400).json({
        error: {
          code: 'validation_error',
          message: 'Invalid template data',
          details: error.errors,
        },
      });
    }
    
    // Handle not found error
    if ((error as Error).message.includes('not found')) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: (error as Error).message,
        },
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while updating the template',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 