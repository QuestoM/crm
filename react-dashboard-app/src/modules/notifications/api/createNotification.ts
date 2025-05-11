import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { CreateNotificationInput, Notification } from '../domain/types';
import { notificationService, NotificationValidationError } from '../services/notificationService';

/**
 * API handler for creating a new notification
 */
export default async function createNotificationHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Notification>>
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
    // Extract notification data from request body
    const notificationData: CreateNotificationInput = req.body;
    
    // Create notification
    const notification = await notificationService.createNotification(notificationData);
    
    // Return created notification
    return res.status(201).json({
      data: notification,
    });
  } catch (error) {
    console.error('Error in createNotification API:', error);
    
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
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while creating the notification',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 