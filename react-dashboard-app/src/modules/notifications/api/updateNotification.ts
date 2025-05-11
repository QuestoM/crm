import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Notification, UpdateNotificationInput } from '../domain/types';
import { notificationService, NotificationValidationError } from '../services/notificationService';

/**
 * API handler for updating an existing notification
 */
export default async function updateNotificationHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Notification>>
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
    // Extract notification data from request body
    const notificationData: UpdateNotificationInput = req.body;
    
    // Validate notification ID
    if (!notificationData.id) {
      return res.status(400).json({
        error: {
          code: 'invalid_request',
          message: 'Notification ID is required',
        },
      });
    }
    
    // Update notification
    const notification = await notificationService.updateNotification(notificationData);
    
    // Return updated notification
    return res.status(200).json({
      data: notification,
    });
  } catch (error) {
    console.error('Error in updateNotification API:', error);
    
    // Handle validation errors
    if (error instanceof NotificationValidationError) {
      return res.status(400).json({
        error: {
          code: 'validation_error',
          message: 'Invalid notification data',
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
        message: 'An error occurred while updating the notification',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 