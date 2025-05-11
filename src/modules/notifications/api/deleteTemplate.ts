import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { notificationService } from '../services/notificationService';

/**
 * API handler for deleting a notification template
 */
export default async function deleteTemplateHandler(
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
    // Delete template
    const success = await notificationService.deleteTemplate(id);
    
    // Return response
    return res.status(200).json({
      data: { success },
    });
  } catch (error) {
    console.error('Error in deleteTemplate API:', error);
    
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
        message: 'An error occurred while deleting the template',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 