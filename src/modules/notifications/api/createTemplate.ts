import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { CreateTemplateInput, NotificationTemplate } from '../domain/types';
import { notificationService, NotificationValidationError } from '../services/notificationService';

/**
 * API handler for creating a new notification template
 */
export default async function createTemplateHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<NotificationTemplate>>
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
    // Extract template data from request body
    const templateData: CreateTemplateInput = req.body;
    
    // Create template
    const template = await notificationService.createTemplate(templateData);
    
    // Return created template
    return res.status(201).json({
      data: template,
    });
  } catch (error) {
    console.error('Error in createTemplate API:', error);
    
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
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while creating the template',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 