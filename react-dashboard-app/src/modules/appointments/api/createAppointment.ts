import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Appointment, CreateAppointmentInput } from '../domain/types';
import { appointmentService, AppointmentValidationError } from '../services/appointmentService';

/**
 * API handler for creating a new appointment
 */
export default async function createAppointmentHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Appointment>>
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
    // Extract appointment data from request body
    const appointmentData: CreateAppointmentInput = req.body;
    
    // Parse date fields if they are provided as strings
    if (appointmentData.scheduled_date && typeof appointmentData.scheduled_date === 'string') {
      appointmentData.scheduled_date = new Date(appointmentData.scheduled_date);
    }
    
    // Create appointment using service
    const appointment = await appointmentService.createAppointment(appointmentData);
    
    // Return response
    return res.status(201).json({
      data: appointment,
    });
  } catch (error) {
    console.error('Error in createAppointment API:', error);
    
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
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while creating the appointment',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 