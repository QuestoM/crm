import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Appointment, UpdateAppointmentInput } from '../domain/types';
import { appointmentService, AppointmentValidationError } from '../services/appointmentService';

/**
 * API handler for updating an appointment
 */
export default async function updateAppointmentHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Appointment>>
) {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only PUT requests are allowed',
      },
    });
  }
  
  try {
    // Extract appointment data from request body
    const appointmentData: UpdateAppointmentInput = req.body;
    
    // Parse date fields if they are provided as strings
    if (appointmentData.scheduled_date && typeof appointmentData.scheduled_date === 'string') {
      appointmentData.scheduled_date = new Date(appointmentData.scheduled_date);
    }
    
    if (appointmentData.completed_at && typeof appointmentData.completed_at === 'string') {
      appointmentData.completed_at = new Date(appointmentData.completed_at);
    }
    
    // Update appointment using service
    const appointment = await appointmentService.updateAppointment(appointmentData);
    
    // Return response
    return res.status(200).json({
      data: appointment,
    });
  } catch (error) {
    console.error('Error in updateAppointment API:', error);
    
    // Handle validation errors
    if (error instanceof AppointmentValidationError) {
      return res.status(400).json({
        error: {
          code: 'validation_error',
          message: 'Appointment validation failed',
          details: error.errors,
        },
      });
    }
    
    // Handle not found errors
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: error.message,
        },
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while updating the appointment',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 