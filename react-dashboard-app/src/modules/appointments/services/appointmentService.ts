import { appointmentRepository } from '../repositories/appointmentRepository';
import { 
  Appointment,
  AppointmentFilters,
  AppointmentStatus,
  AvailabilityCheckInput,
  AvailabilityResult,
  CreateAppointmentInput,
  TimeSlot,
  UpdateAppointmentInput
} from '../domain/types';
import { validateAvailabilityCheck, validateCreateAppointment, validateUpdateAppointment } from '../domain/validation';
import { createTask } from '../../../services/queue/queueService';
import { supabaseClient } from '../../../services/supabase/client';
import { DEFAULT_APPOINTMENT_DURATION } from '../domain/constants';

/**
 * Error class for appointment validation errors
 */
export class AppointmentValidationError extends Error {
  errors: Record<string, string>;
  
  constructor(message: string, errors: Record<string, string>) {
    super(message);
    this.name = 'AppointmentValidationError';
    this.errors = errors;
  }
}

/**
 * Service for appointment management operations
 */
export const appointmentService = {
  /**
   * Get appointments with optional filtering and pagination
   */
  async getAppointments(
    filters?: AppointmentFilters,
    page?: number,
    pageSize?: number,
    includeCustomer: boolean = false,
    includeOrder: boolean = false,
    includeTechnician: boolean = false
  ): Promise<{ appointments: Appointment[]; totalCount: number }> {
    return appointmentRepository.getAppointments(
      filters, 
      page, 
      pageSize, 
      includeCustomer, 
      includeOrder, 
      includeTechnician
    );
  },

  /**
   * Get a single appointment by ID
   */
  async getAppointmentById(
    id: string,
    includeCustomer: boolean = false,
    includeOrder: boolean = false,
    includeTechnician: boolean = false
  ): Promise<Appointment | null> {
    return appointmentRepository.getAppointmentById(
      id,
      includeCustomer,
      includeOrder,
      includeTechnician
    );
  },

  /**
   * Create a new appointment with validation
   */
  async createAppointment(appointmentData: CreateAppointmentInput): Promise<Appointment> {
    // Validate the appointment data
    const validation = validateCreateAppointment(appointmentData);
    
    if (!validation.isValid) {
      throw new AppointmentValidationError('Appointment validation failed', validation.errors);
    }
    
    // Verify customer exists if customer_id is provided
    const { data: customer, error: customerError } = await supabaseClient
      .from('customers')
      .select('id')
      .eq('id', appointmentData.customer_id)
      .single();
    
    if (customerError) {
      throw new AppointmentValidationError('Appointment validation failed', {
        customer_id: 'לקוח לא קיים'
      });
    }
    
    // Verify technician exists if technician_id is provided
    if (appointmentData.technician_id) {
      const { data: technician, error: technicianError } = await supabaseClient
        .from('technicians')
        .select('id, active')
        .eq('id', appointmentData.technician_id)
        .single();
      
      if (technicianError) {
        throw new AppointmentValidationError('Appointment validation failed', {
          technician_id: 'טכנאי לא קיים'
        });
      }
      
      if (technician && !technician.active) {
        throw new AppointmentValidationError('Appointment validation failed', {
          technician_id: 'טכנאי לא פעיל'
        });
      }
    }
    
    // Verify order exists if order_id is provided
    if (appointmentData.order_id) {
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .select('id')
        .eq('id', appointmentData.order_id)
        .single();
      
      if (orderError) {
        throw new AppointmentValidationError('Appointment validation failed', {
          order_id: 'הזמנה לא קיימת'
        });
      }
    }
    
    // Check availability for the requested date and time slot
    const dateString = appointmentData.scheduled_date instanceof Date
      ? appointmentData.scheduled_date.toISOString().split('T')[0]
      : new Date(appointmentData.scheduled_date).toISOString().split('T')[0];
    
    const availability = await appointmentRepository.checkAvailability(
      dateString,
      appointmentData.technician_id
    );
    
    const requestedTimeSlot = availability.time_slots.find(
      slot => `${slot.start}-${slot.end}` === appointmentData.scheduled_time_slot
    );
    
    if (!requestedTimeSlot) {
      throw new AppointmentValidationError('Appointment validation failed', {
        scheduled_time_slot: 'משבצת זמן לא קיימת'
      });
    }
    
    if (!requestedTimeSlot.available) {
      throw new AppointmentValidationError('Appointment validation failed', {
        scheduled_time_slot: 'משבצת זמן לא זמינה'
      });
    }
    
    // If no technician is assigned, use the one from availability check
    if (!appointmentData.technician_id && requestedTimeSlot.technician_id) {
      appointmentData.technician_id = requestedTimeSlot.technician_id;
    }
    
    // Create the appointment
    const appointment = await appointmentRepository.createAppointment(appointmentData);
    
    // Queue notifications for new appointment
    try {
      // Send notification to customer
      await createTask('new_appointment_notification', {
        appointmentId: appointment.id,
        customerId: appointment.customer_id,
        notificationType: 'customer_new_appointment',
        scheduledDate: appointment.scheduled_date.toISOString(),
        scheduledTimeSlot: appointment.scheduled_time_slot
      }, 5);
      
      // Send notification to technician if assigned
      if (appointment.technician_id) {
        await createTask('new_appointment_notification', {
          appointmentId: appointment.id,
          technicianId: appointment.technician_id,
          notificationType: 'technician_new_appointment',
          scheduledDate: appointment.scheduled_date.toISOString(),
          scheduledTimeSlot: appointment.scheduled_time_slot
        }, 5);
      }
    } catch (error) {
      console.error('Failed to queue appointment notifications:', error);
      // We don't fail the appointment creation if notification queueing fails
    }
    
    return appointment;
  },

  /**
   * Update an appointment with validation
   */
  async updateAppointment(appointmentData: UpdateAppointmentInput): Promise<Appointment> {
    // Validate the appointment data
    const validation = validateUpdateAppointment(appointmentData);
    
    if (!validation.isValid) {
      throw new AppointmentValidationError('Appointment validation failed', validation.errors);
    }
    
    // Check if the appointment exists
    const existingAppointment = await appointmentRepository.getAppointmentById(
      appointmentData.id
    );
    
    if (!existingAppointment) {
      throw new Error(`Appointment with ID ${appointmentData.id} not found`);
    }
    
    // If status is being updated to COMPLETED, set completed_at if not provided
    if (appointmentData.status === AppointmentStatus.COMPLETED &&
        existingAppointment.status !== AppointmentStatus.COMPLETED &&
        !appointmentData.completed_at) {
      appointmentData.completed_at = new Date();
    }
    
    // Verify technician exists if being updated
    if (appointmentData.technician_id && 
        appointmentData.technician_id !== existingAppointment.technician_id) {
      const { data: technician, error: technicianError } = await supabaseClient
        .from('technicians')
        .select('id, active')
        .eq('id', appointmentData.technician_id)
        .single();
      
      if (technicianError) {
        throw new AppointmentValidationError('Appointment validation failed', {
          technician_id: 'טכנאי לא קיים'
        });
      }
      
      if (technician && !technician.active) {
        throw new AppointmentValidationError('Appointment validation failed', {
          technician_id: 'טכנאי לא פעיל'
        });
      }
    }
    
    // If scheduled date or time slot is being changed, check availability
    if ((appointmentData.scheduled_date || appointmentData.scheduled_time_slot) &&
        appointmentData.status !== AppointmentStatus.CANCELLED &&
        appointmentData.status !== AppointmentStatus.COMPLETED) {
      
      const dateToCheck = appointmentData.scheduled_date || existingAppointment.scheduled_date;
      const timeSlotToCheck = appointmentData.scheduled_time_slot || existingAppointment.scheduled_time_slot;
      const technicianToCheck = appointmentData.technician_id || existingAppointment.technician_id;
      
      const dateString = dateToCheck instanceof Date
        ? dateToCheck.toISOString().split('T')[0]
        : new Date(dateToCheck).toISOString().split('T')[0];
      
      const availability = await appointmentRepository.checkAvailability(
        dateString,
        technicianToCheck,
        appointmentData.id // Exclude the current appointment from availability check
      );
      
      const requestedTimeSlot = availability.time_slots.find(
        slot => `${slot.start}-${slot.end}` === timeSlotToCheck
      );
      
      if (!requestedTimeSlot) {
        throw new AppointmentValidationError('Appointment validation failed', {
          scheduled_time_slot: 'משבצת זמן לא קיימת'
        });
      }
      
      if (!requestedTimeSlot.available) {
        throw new AppointmentValidationError('Appointment validation failed', {
          scheduled_time_slot: 'משבצת זמן לא זמינה'
        });
      }
    }
    
    // Update the appointment
    const updatedAppointment = await appointmentRepository.updateAppointment(appointmentData);
    
    // Queue notifications for status changes
    if (appointmentData.status && appointmentData.status !== existingAppointment.status) {
      try {
        // Get customer details
        const { data: customer } = await supabaseClient
          .from('customers')
          .select('id, email, phone')
          .eq('id', existingAppointment.customer_id)
          .single();
        
        // Send appropriate notifications based on status change
        switch (appointmentData.status) {
          case AppointmentStatus.CONFIRMED:
            await createTask('appointment_status_changed', {
              appointmentId: updatedAppointment.id,
              customerId: updatedAppointment.customer_id,
              notificationType: 'appointment_confirmed',
              customerEmail: customer?.email,
              customerPhone: customer?.phone,
              scheduledDate: updatedAppointment.scheduled_date.toISOString(),
              scheduledTimeSlot: updatedAppointment.scheduled_time_slot
            }, 3);
            break;
            
          case AppointmentStatus.CANCELLED:
            await createTask('appointment_status_changed', {
              appointmentId: updatedAppointment.id,
              customerId: updatedAppointment.customer_id,
              notificationType: 'appointment_cancelled',
              customerEmail: customer?.email,
              customerPhone: customer?.phone
            }, 3);
            
            // Also notify technician
            if (updatedAppointment.technician_id) {
              await createTask('appointment_status_changed', {
                appointmentId: updatedAppointment.id,
                technicianId: updatedAppointment.technician_id,
                notificationType: 'technician_appointment_cancelled',
                scheduledDate: updatedAppointment.scheduled_date.toISOString(),
                scheduledTimeSlot: updatedAppointment.scheduled_time_slot
              }, 3);
            }
            break;
            
          case AppointmentStatus.COMPLETED:
            await createTask('appointment_status_changed', {
              appointmentId: updatedAppointment.id,
              customerId: updatedAppointment.customer_id,
              notificationType: 'appointment_completed',
              customerEmail: customer?.email,
              customerPhone: customer?.phone
            }, 3);
            break;
        }
      } catch (error) {
        console.error('Failed to queue status change notification:', error);
      }
    }
    
    // If technician is changed, notify the new technician
    if (appointmentData.technician_id && 
        appointmentData.technician_id !== existingAppointment.technician_id) {
      try {
        await createTask('appointment_technician_changed', {
          appointmentId: updatedAppointment.id,
          technicianId: appointmentData.technician_id,
          notificationType: 'technician_assigned',
          scheduledDate: updatedAppointment.scheduled_date.toISOString(),
          scheduledTimeSlot: updatedAppointment.scheduled_time_slot
        }, 3);
      } catch (error) {
        console.error('Failed to queue technician change notification:', error);
      }
    }
    
    return updatedAppointment;
  },

  /**
   * Delete an appointment by ID with validation
   */
  async deleteAppointment(id: string): Promise<boolean> {
    // Check if the appointment exists
    const existingAppointment = await appointmentRepository.getAppointmentById(id);
    
    if (!existingAppointment) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    // Check if the appointment can be deleted (e.g., not completed)
    if (existingAppointment.status === AppointmentStatus.COMPLETED) {
      throw new Error('לא ניתן למחוק פגישה שהושלמה');
    }
    
    // Alternative to deletion is to update status to cancelled
    // This preserves appointment history
    if (existingAppointment.status !== AppointmentStatus.CANCELLED) {
      await this.updateAppointment({
        id,
        status: AppointmentStatus.CANCELLED
      });
      
      return true;
    }
    
    // If already cancelled, we can just delete it
    return appointmentRepository.deleteAppointment(id);
  },

  /**
   * Check availability for scheduling appointments
   */
  async checkAvailability(checkData: AvailabilityCheckInput): Promise<AvailabilityResult> {
    // Validate the input data
    const validation = validateAvailabilityCheck(checkData);
    
    if (!validation.isValid) {
      throw new AppointmentValidationError('Availability check failed', validation.errors);
    }
    
    // Check if technician exists if specified
    if (checkData.technician_id) {
      const { data: technician, error: technicianError } = await supabaseClient
        .from('technicians')
        .select('id, active')
        .eq('id', checkData.technician_id)
        .single();
      
      if (technicianError || !technician?.active) {
        throw new AppointmentValidationError('Availability check failed', {
          technician_id: 'טכנאי לא קיים או לא פעיל'
        });
      }
    }
    
    // Get availability
    return appointmentRepository.checkAvailability(
      checkData.date,
      checkData.technician_id
    );
  },
  
  /**
   * Get appointments for a specific day
   */
  async getAppointmentsByDay(
    date: Date | string,
    technicianId?: string
  ): Promise<Appointment[]> {
    return appointmentRepository.getAppointmentsByDay(date, technicianId);
  },
  
  /**
   * Get appointment statistics
   */
  async getAppointmentStats(): Promise<{
    totalAppointments: number;
    statusCounts: Record<AppointmentStatus, number>;
    upcomingAppointments: number;
  }> {
    try {
      // Get status counts
      const statusCounts = await appointmentRepository.getAppointmentCountByStatus();
      
      // Calculate total
      const totalAppointments = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
      
      // Get upcoming appointments count (not completed, cancelled, or no-show)
      const upcomingAppointments = 
        statusCounts[AppointmentStatus.SCHEDULED] +
        statusCounts[AppointmentStatus.CONFIRMED] +
        statusCounts[AppointmentStatus.IN_PROGRESS];
      
      return {
        totalAppointments,
        statusCounts,
        upcomingAppointments
      };
    } catch (error) {
      console.error('Error getting appointment statistics:', error);
      throw error;
    }
  },
  
  /**
   * Send appointment reminders for upcoming appointments
   * This should be called by a scheduled job
   */
  async sendAppointmentReminders(daysAhead: number = 1): Promise<number> {
    try {
      // Calculate the target date
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysAhead);
      const dateString = targetDate.toISOString().split('T')[0];
      
      // Get appointments for the target date
      const appointments = await appointmentRepository.getAppointmentsByDay(dateString);
      
      // Filter to only confirmed or scheduled appointments
      const appointmentsToRemind = appointments.filter(appt => 
        appt.status === AppointmentStatus.CONFIRMED || 
        appt.status === AppointmentStatus.SCHEDULED
      );
      
      // Send reminders
      let remindersSent = 0;
      
      for (const appointment of appointmentsToRemind) {
        try {
          // Get customer details
          const { data: customer } = await supabaseClient
            .from('customers')
            .select('id, email, phone')
            .eq('id', appointment.customer_id)
            .single();
          
          if (customer) {
            // Queue reminder notification
            await createTask('appointment_reminder', {
              appointmentId: appointment.id,
              customerId: appointment.customer_id,
              customerEmail: customer.email,
              customerPhone: customer.phone,
              notificationType: 'appointment_reminder',
              scheduledDate: appointment.scheduled_date.toISOString(),
              scheduledTimeSlot: appointment.scheduled_time_slot,
              address: appointment.address,
              city: appointment.city
            }, 2);
            
            remindersSent++;
          }
        } catch (error) {
          console.error(`Failed to send reminder for appointment ${appointment.id}:`, error);
          // Continue with other reminders even if one fails
        }
      }
      
      return remindersSent;
    } catch (error) {
      console.error('Error sending appointment reminders:', error);
      throw error;
    }
  }
}; 