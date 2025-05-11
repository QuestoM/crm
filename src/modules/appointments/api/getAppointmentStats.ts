import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { AppointmentStatus } from '../domain/types';
import { appointmentService } from '../services/appointmentService';

/**
 * API handler for getting appointment statistics
 */
export default async function getAppointmentStatsHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{
    totalAppointments: number;
    statusCounts: Record<AppointmentStatus, number>;
    upcomingAppointments: number;
  }>>
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
  
  try {
    // Get appointment statistics
    const stats = await appointmentService.getAppointmentStats();
    
    // Return response
    return res.status(200).json({
      data: stats,
    });
  } catch (error) {
    console.error('Error in getAppointmentStats API:', error);
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching appointment statistics',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 