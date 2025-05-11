import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Appointment } from '../domain/types';
import { appointmentService } from '../services/appointmentService';

/**
 * API handler for getting appointments for a specific day
 */
export default async function getAppointmentsByDayHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Appointment[]>>
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
    // Extract parameters from query
    const { date, technician_id } = req.query;
    
    if (!date) {
      return res.status(400).json({
        error: {
          code: 'bad_request',
          message: 'Date parameter is required',
        },
      });
    }
    
    // Parse technician ID if provided
    const technicianId = technician_id ? String(technician_id) : undefined;
    
    // Get appointments for the specified day
    const appointments = await appointmentService.getAppointmentsByDay(
      String(date),
      technicianId
    );
    
    // Return response
    return res.status(200).json({
      data: appointments,
    });
  } catch (error) {
    console.error('Error in getAppointmentsByDay API:', error);
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching appointments',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 