import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { appointmentService } from '../services/appointmentService';

/**
 * API handler for sending appointment reminders
 * This endpoint should be called by a scheduled task or cron job
 */
export default async function sendAppointmentRemindersHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ remindersSent: number }>>
) {
  // Only allow POST requests with API key for security
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only POST requests are allowed',
      },
    });
  }
  
  try {
    // Check for API key or other authorization mechanism
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    const expectedApiKey = process.env.INTERNAL_API_KEY;
    
    if (!apiKey || apiKey !== expectedApiKey) {
      return res.status(401).json({
        error: {
          code: 'unauthorized',
          message: 'Missing or invalid API key',
        },
      });
    }
    
    // Extract days ahead from query or default to 1
    const daysAhead = req.query.days_ahead ? parseInt(String(req.query.days_ahead), 10) : 1;
    
    // Send appointment reminders
    const remindersSent = await appointmentService.sendAppointmentReminders(daysAhead);
    
    // Return response
    return res.status(200).json({
      data: { remindersSent },
    });
  } catch (error) {
    console.error('Error in sendAppointmentReminders API:', error);
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while sending appointment reminders',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 