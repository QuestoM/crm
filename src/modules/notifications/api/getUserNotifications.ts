import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Notification } from '../domain/types';
import { notificationService } from '../services/notificationService';

/**
 * API handler for getting notifications for a specific user/recipient
 */
export default async function getUserNotificationsHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ notifications: Notification[], totalCount: number }>>
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
  
  // Extract recipient ID and pagination parameters
  const { recipient_id, page, pageSize, unread_only } = req.query;
  
  // Validate recipient ID
  if (!recipient_id || typeof recipient_id !== 'string') {
    return res.status(400).json({
      error: {
        code: 'invalid_request',
        message: 'Recipient ID is required',
      },
    });
  }
  
  try {
    // Convert pagination params
    const pageNumber = page ? parseInt(String(page), 10) : 1;
    const itemsPerPage = pageSize ? parseInt(String(pageSize), 10) : 20;
    
    let result;
    
    // Check if only unread notifications are requested
    if (unread_only === 'true') {
      const unreadNotifications = await notificationService.getUnreadNotificationsForRecipient(recipient_id);
      result = {
        notifications: unreadNotifications,
        totalCount: unreadNotifications.length
      };
    } else {
      // Get all notifications for the recipient with pagination
      result = await notificationService.getNotificationsForRecipient(
        recipient_id,
        pageNumber,
        itemsPerPage
      );
    }
    
    // Return notifications
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
    console.error('Error in getUserNotifications API:', error);
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching user notifications',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 