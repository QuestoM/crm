import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Notification } from '../domain/types';
import { notificationService } from '../services/notificationService';

/**
 * API handler for getting a notification by ID
 */
export default async function getNotificationByIdHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Notification>>
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
  
  // Extract notification ID from query
  const { id } = req.query;
  
  // Validate notification ID
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      error: {
        code: 'invalid_request',
        message: 'Notification ID is required',
      },
    });
  }
  
  try {
    // Get notification by ID
    const notification = await notificationService.getNotificationById(id);
    
    // Check if notification exists
    if (!notification) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: `Notification with ID ${id} not found`,
        },
      });
    }
    
    // Return notification
    return res.status(200).json({
      data: notification,
    });
  } catch (error) {
    console.error('Error in getNotificationById API:', error);
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching the notification',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 