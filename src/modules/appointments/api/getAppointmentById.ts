import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Appointment } from '../domain/types';
import { appointmentService } from '../services/appointmentService';

/**
 * API handler for getting a single appointment by ID
 */
export default async function getAppointmentByIdHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Appointment>>
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
    // Extract appointment ID from query parameters
    const { id, include_customer, include_order, include_technician } = req.query;
    
    if (!id) {
      return res.status(400).json({
        error: {
          code: 'bad_request',
          message: 'Appointment ID is required',
        },
      });
    }
    
    // Convert boolean params
    const includeCustomer = include_customer === 'true';
    const includeOrder = include_order === 'true';
    const includeTechnician = include_technician === 'true';
    
    // Get appointment
    const appointment = await appointmentService.getAppointmentById(
      String(id),
      includeCustomer,
      includeOrder,
      includeTechnician
    );
    
    if (!appointment) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: `Appointment with ID ${id} not found`,
        },
      });
    }
    
    // Return response
    return res.status(200).json({
      data: appointment,
    });
  } catch (error) {
    console.error('Error in getAppointmentById API:', error);
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching the appointment',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 