import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { AvailabilityCheckInput, AvailabilityResult } from '../domain/types';
import { appointmentService, AppointmentValidationError } from '../services/appointmentService';

/**
 * API handler for checking appointment availability
 */
export default async function checkAvailabilityHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<AvailabilityResult>>
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
    // Extract availability check parameters from query
    const { date, service_type, technician_id, duration_minutes } = req.query;
    
    if (!date) {
      return res.status(400).json({
        error: {
          code: 'bad_request',
          message: 'Date parameter is required',
        },
      });
    }
    
    // Build availability check input
    const checkData: AvailabilityCheckInput = {
      date: String(date)
    };
    
    if (service_type) {
      checkData.service_type = String(service_type) as any;
    }
    
    if (technician_id) {
      checkData.technician_id = String(technician_id);
    }
    
    if (duration_minutes) {
      checkData.duration_minutes = Number(duration_minutes);
    }
    
    // Check availability using service
    const availability = await appointmentService.checkAvailability(checkData);
    
    // Return response
    return res.status(200).json({
      data: availability,
    });
  } catch (error) {
    console.error('Error in checkAvailability API:', error);
    
    // Handle validation errors
    if (error instanceof AppointmentValidationError) {
      return res.status(400).json({
        error: {
          code: 'validation_error',
          message: 'Availability check validation failed',
          details: error.errors,
        },
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while checking availability',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 