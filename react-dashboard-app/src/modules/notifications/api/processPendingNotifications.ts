import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { notificationService } from '../services/notificationService';

/**
 * API handler for processing pending notifications
 * This endpoint would typically be called by a cron job or scheduled task
 */
export default async function processPendingNotificationsHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ processedCount: number }>>
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
  
  // Check for API key or other authorization
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.NOTIFICATIONS_API_KEY) {
    return res.status(401).json({
      error: {
        code: 'unauthorized',
        message: 'Unauthorized access to notification processing',
      },
    });
  }
  
  try {
    // Process pending notifications
    const processedCount = await notificationService.processPendingNotifications();
    
    // Return response
    return res.status(200).json({
      data: { processedCount },
    });
  } catch (error) {
    console.error('Error in processPendingNotifications API:', error);
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while processing pending notifications',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 