import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Notification } from '../domain/types';
import { notificationService } from '../services/notificationService';

/**
 * API handler for marking a notification as read
 */
export default async function markAsReadHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Notification>>
) {
  // Only allow POST and PATCH requests
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only POST and PATCH requests are allowed',
      },
    });
  }
  
  // Extract notification ID from query or body
  const id = req.query.id || req.body.id;
  
  // Validate notification ID
  if (!id || (typeof id !== 'string' && !Array.isArray(id))) {
    return res.status(400).json({
      error: {
        code: 'invalid_request',
        message: 'Notification ID is required',
      },
    });
  }
  
  const notificationId = Array.isArray(id) ? id[0] : id;
  
  try {
    // Mark notification as read
    const notification = await notificationService.markAsRead(notificationId);
    
    // Return updated notification
    return res.status(200).json({
      data: notification,
    });
  } catch (error) {
    console.error('Error in markAsRead API:', error);
    
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
        message: 'An error occurred while marking the notification as read',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 