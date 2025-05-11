import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Appointment, AppointmentFilters, AppointmentPriority, AppointmentStatus, ServiceType } from '../domain/types';
import { appointmentService } from '../services/appointmentService';

/**
 * API handler for getting appointments with filtering and pagination
 */
export default async function getAppointmentsHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ appointments: Appointment[], totalCount: number }>>
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
    // Extract query parameters
    const { 
      page, 
      pageSize, 
      customer_id, 
      technician_id,
      order_id,
      service_type,
      status,
      priority,
      date_from,
      date_to,
      city,
      search,
      include_customer,
      include_order,
      include_technician
    } = req.query;
    
    // Convert query params to proper types
    const filters: AppointmentFilters = {};
    
    if (customer_id) {
      filters.customer_id = String(customer_id);
    }
    
    if (technician_id) {
      filters.technician_id = String(technician_id);
    }
    
    if (order_id) {
      filters.order_id = String(order_id);
    }
    
    if (service_type) {
      if (Array.isArray(service_type)) {
        filters.service_type = service_type.map(s => s as ServiceType);
      } else {
        filters.service_type = service_type as ServiceType;
      }
    }
    
    if (status) {
      if (Array.isArray(status)) {
        filters.status = status.map(s => s as AppointmentStatus);
      } else {
        filters.status = status as AppointmentStatus;
      }
    }
    
    if (priority) {
      if (Array.isArray(priority)) {
        filters.priority = priority.map(p => p as AppointmentPriority);
      } else {
        filters.priority = priority as AppointmentPriority;
      }
    }
    
    if (date_from) {
      filters.date_from = new Date(String(date_from));
    }
    
    if (date_to) {
      filters.date_to = new Date(String(date_to));
    }
    
    if (city) {
      filters.city = String(city);
    }
    
    if (search) {
      filters.search = String(search);
    }
    
    // Convert pagination params
    const pageNumber = page ? parseInt(String(page), 10) : 1;
    const itemsPerPage = pageSize ? parseInt(String(pageSize), 10) : 20;
    
    // Convert boolean params
    const includeCustomer = include_customer === 'true';
    const includeOrder = include_order === 'true';
    const includeTechnician = include_technician === 'true';
    
    // Get appointments with filters and pagination
    const result = await appointmentService.getAppointments(
      filters,
      pageNumber,
      itemsPerPage,
      includeCustomer,
      includeOrder,
      includeTechnician
    );
    
    // Return response
    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.error('Error in getAppointments API:', error);
    
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